# Python Forecast Service

This backend exposes a real ML forecasting API for the frontend `PredictionChart`.

## Stack
- FastAPI
- pandas
- scikit-learn (`RandomForestRegressor`)

## Required Environment Variables
- `EODHD_API_KEY=your_real_eodhd_key`
- `ALLOWED_ORIGINS=http://127.0.0.1:5173,http://localhost:5173`

## Run
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
set EODHD_API_KEY=your_real_eodhd_key
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

## Endpoint
- `GET /market-data?ticker=RELIANCE`
  - Uses backend-side EODHD key (never exposed to browser)
- `GET /health`
- `POST /forecast`
  - Input: `ticker`, `horizon`, `dates[]`, `closes[]`
  - Output: `projected_dates`, `projected_closes`, `upper_band`, `lower_band`, `metrics`
