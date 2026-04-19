# Python Forecast Service

This backend exposes a real ML forecasting API for the frontend `PredictionChart`.

## Stack
- FastAPI
- pandas
- scikit-learn (`RandomForestRegressor`)

## Run
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

## Endpoint
- `POST /forecast`
  - Input: `ticker`, `horizon`, `dates[]`, `closes[]`
  - Output: `projected_dates`, `projected_closes`, `upper_band`, `lower_band`, `metrics`
