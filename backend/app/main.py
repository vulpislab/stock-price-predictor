from datetime import date, datetime, timedelta
from math import sqrt
import os

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sklearn.ensemble import RandomForestRegressor

FEATURE_COLUMNS = [
    "lag_1",
    "lag_2",
    "lag_3",
    "return_1",
    "return_5",
    "sma_5",
    "sma_20",
    "vol_20",
    "momentum_10",
]


class ForecastRequest(BaseModel):
    ticker: str = Field(min_length=1, max_length=20)
    horizon: int = Field(default=7, ge=3, le=30)
    dates: list[str]
    closes: list[float]


class ForecastMetrics(BaseModel):
    mae: float
    rmse: float
    mape: float


class ForecastResponse(BaseModel):
    ticker: str
    horizon: int
    model_name: str
    metrics: ForecastMetrics
    projected_dates: list[str]
    projected_closes: list[float]
    upper_band: list[float]
    lower_band: list[float]


app = FastAPI(title="Stock Predictor API", version="1.0.0")

default_origins = "http://127.0.0.1:5173,http://localhost:5173"
allowed_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", default_origins).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def build_feature_frame(closes: list[float], include_target: bool) -> pd.DataFrame:
    series = pd.Series(closes, dtype="float64")
    frame = pd.DataFrame({"close": series})
    frame["lag_1"] = frame["close"].shift(1)
    frame["lag_2"] = frame["close"].shift(2)
    frame["lag_3"] = frame["close"].shift(3)
    frame["return_1"] = frame["close"].pct_change(1)
    frame["return_5"] = frame["close"].pct_change(5)
    frame["sma_5"] = frame["close"].rolling(5).mean()
    frame["sma_20"] = frame["close"].rolling(20).mean()
    frame["vol_20"] = frame["return_1"].rolling(20).std()
    frame["momentum_10"] = frame["close"] / frame["close"].shift(10) - 1
    if include_target:
        frame["target"] = frame["close"].shift(-1)
    return frame


def parse_last_date(values: list[str]) -> date:
    for value in reversed(values):
        try:
            return datetime.fromisoformat(value).date()
        except ValueError:
            continue
    return date.today()


def next_trading_dates(last_date: date, horizon: int) -> list[str]:
    out = []
    cursor = last_date
    while len(out) < horizon:
        cursor += timedelta(days=1)
        if cursor.weekday() < 5:
            out.append(cursor.isoformat())
    return out


def compute_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> ForecastMetrics:
    residuals = y_true - y_pred
    mae = float(np.mean(np.abs(residuals)))
    rmse = float(np.sqrt(np.mean(residuals**2)))
    safe_denominator = np.maximum(np.abs(y_true), 1e-9)
    mape = float(np.mean(np.abs(residuals) / safe_denominator) * 100)
    return ForecastMetrics(mae=round(mae, 4), rmse=round(rmse, 4), mape=round(mape, 4))


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/forecast", response_model=ForecastResponse)
def forecast_prices(request: ForecastRequest) -> ForecastResponse:
    if len(request.dates) != len(request.closes):
        raise HTTPException(status_code=400, detail="dates and closes length mismatch")

    if len(request.closes) < 80:
        raise HTTPException(status_code=400, detail="At least 80 historical points are required for model training.")

    closes = np.asarray(request.closes, dtype="float64")
    if not np.all(np.isfinite(closes)):
        raise HTTPException(status_code=400, detail="closes contains invalid numeric values")
    if np.any(closes <= 0):
        raise HTTPException(status_code=400, detail="closes must contain positive values")

    train_frame = build_feature_frame(request.closes, include_target=True).dropna()
    if len(train_frame) < 40:
        raise HTTPException(status_code=400, detail="Not enough valid training rows after feature engineering.")

    x = train_frame[FEATURE_COLUMNS].to_numpy(dtype="float64")
    y = train_frame["target"].to_numpy(dtype="float64")

    test_size = max(12, min(30, len(train_frame) // 5))
    x_train, x_test = x[:-test_size], x[-test_size:]
    y_train, y_test = y[:-test_size], y[-test_size:]

    model = RandomForestRegressor(
        n_estimators=320,
        max_depth=12,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=1,
    )
    model.fit(x_train, y_train)

    y_pred_test = model.predict(x_test)
    metrics = compute_metrics(y_test, y_pred_test)

    residual_std = float(np.std(y_test - y_pred_test))
    if residual_std < 1e-9:
        residual_std = max(0.01, float(np.std(y_train)) * 0.03)

    history = request.closes.copy()
    projected_closes = []
    upper_band = []
    lower_band = []

    for step in range(1, request.horizon + 1):
        inference_frame = build_feature_frame(history, include_target=False).dropna()
        if inference_frame.empty:
            raise HTTPException(status_code=400, detail="Unable to derive features for forecast inference.")

        feature_row = inference_frame.iloc[-1][FEATURE_COLUMNS].to_numpy(dtype="float64").reshape(1, -1)
        next_close = float(model.predict(feature_row)[0])
        next_close = max(0.1, next_close)

        history.append(next_close)
        projected_closes.append(round(next_close, 4))

        spread = residual_std * sqrt(step) * 1.15
        upper_band.append(round(next_close + spread, 4))
        lower_band.append(round(max(0.1, next_close - spread), 4))

    return ForecastResponse(
        ticker=request.ticker.strip().upper(),
        horizon=request.horizon,
        model_name="RandomForestRegressor",
        metrics=metrics,
        projected_dates=next_trading_dates(parse_last_date(request.dates), request.horizon),
        projected_closes=projected_closes,
        upper_band=upper_band,
        lower_band=lower_band,
    )
