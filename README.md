# Stock Price Predictor

Stock Price Predictor is a teaching-first full-stack project for NSE analytics and forecasting.
It combines a React dashboard, live/synthetic market data handling, and a Python ML prediction API.

## Tech Stack
- Frontend: React + Vite + TailwindCSS + Plotly
- Data source: EODHD via backend proxy endpoint (NSE daily OHLCV)
- Prediction backend: FastAPI + pandas + scikit-learn (`RandomForestRegressor`)

## What It Does
- Loads NSE historical candles and volume
- Computes indicators (SMA, returns, annualized volatility, trend)
- Renders interactive candlestick, trend, volume, and forecast charts
- Trains a Python model per request and returns:
  - forecasted prices
  - confidence bands
  - MAE / RMSE / MAPE metrics
- Uses synthetic fallback data when live API quota/connectivity fails so charts remain usable
- Uses heuristic projection fallback when Python API is unavailable

## Project Structure
```text
stock-price-predictor/
  backend/
    app/main.py
    requirements.txt
  src/
    components/
    services/
    utils/
```

## Frontend Setup
1. Install packages:
   ```bash
   npm install
   ```
2. Create env file:
   ```bash
   cp .env.example .env
   ```
3. Set values in `.env`:
   ```env
   VITE_BACKEND_API_URL=http://127.0.0.1:8000
   VITE_PYTHON_API_URL=http://127.0.0.1:8000
   VITE_PYTHON_MODEL_PROFILE=auto
   ```
4. Start frontend:
   ```bash
   npm run dev -- --host 127.0.0.1 --port 5173
   ```

## Python Backend Setup
1. Move into backend:
   ```bash
   cd backend
   ```
2. Create and activate venv (Windows):
   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   ```
3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run API:
   ```bash
   set EODHD_API_KEY=your_real_eodhd_key
   set ALLOWED_ORIGINS=http://127.0.0.1:5173,http://localhost:5173
   set PYTHON_MODEL_PROFILE=auto
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
5. Health check:
   - `GET http://127.0.0.1:8000/health`
   - `GET http://127.0.0.1:8000/market-data?ticker=RELIANCE`

## Sample Tickers
- RELIANCE
- TCS
- INFY
- HDFCBANK
- ICICIBANK
- SBIN

## Notes
- Forecast output is for educational/demo purposes, not investment advice.
- No database is required for this version.
- EODHD API key is now backend-only (`EODHD_API_KEY`) and is not exposed in browser code.
- `RandomForestRegressor` is always used. In `auto` mode, backend can switch to a lighter RF profile for better free-tier latency.

## Free Share Hack (No Render/Fly/Paid Vercel)
You can run both services locally and share one public URL with a free tunnel:
1. Start backend on `127.0.0.1:8000`.
2. Keep frontend env in `.env` as:
   - `VITE_BACKEND_API_URL=/_/backend`
   - `VITE_PYTHON_API_URL=/_/backend`
   - `VITE_PYTHON_MODEL_PROFILE=light` (optional for weaker machines/free usage)
3. Start frontend (`npm run dev`). Vite already proxies `/_/backend` -> `http://127.0.0.1:8000`.
4. Open a tunnel only for frontend (example):
   - `cloudflared tunnel --url http://127.0.0.1:5173`
5. Share the public tunnel URL to students.

This avoids paid hosting, keeps the real RandomForest model, and still falls back to synthetic/client-side projection when live services fail.
