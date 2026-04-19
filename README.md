# Stock Price Predictor

Stock Price Predictor is a premium, teaching-first frontend project built to demonstrate polished product thinking and recruiter-grade implementation quality. It lets users analyze real NSE stock history using Twelve Data and explore transparent educational prediction logic.

## Project Overview
This app is designed to feel like a modern fintech SaaS demo while remaining educational and honest about modeling limits.

### Problem Statement
Most tutorial stock dashboards either look unfinished or overclaim machine-learning capability. Stock Price Predictor solves that by combining:
- real market data
- clear indicator logic
- premium visual design
- explicit educational framing

## What the App Teaches
- Time series analysis basics through real OHLCV data
- Trend detection using moving-average interpretation
- Volatility interpretation using rolling returns
- How educational projections differ from deployable quantitative models
- What LSTM means conceptually and why this app does not fake deep-learning inference in-browser

## Recruiter Evaluation Lens
Recruiters can evaluate this project for:
- API integration quality and error handling
- Data normalization and transformation approach
- Plotly chart composition and responsive UX
- Indicator engineering in JavaScript (SMA, returns, rolling volatility, trend)
- Product copywriting, design polish, and information architecture
- Clear communication of model limitations and roadmap readiness

## Tech Stack
- React + Vite
- TailwindCSS
- JavaScript (no TypeScript)
- Plotly charts (`react-plotly.js` + `plotly.js-dist-min`)
- Twelve Data API (daily series, XNSE)

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env` from the example and set your key:
   ```bash
   cp .env.example .env
   ```
3. Add your Twelve Data key:
   ```env
   VITE_TWELVE_DATA_API_KEY=your_actual_key
   ```
4. Run locally:
   ```bash
   npm run dev
   ```

## Sample NSE Tickers
- RELIANCE
- TCS
- INFY
- HDFCBANK
- ICICIBANK
- SBIN

## Core Features
- Premium hero and control panel
- Candlestick chart with SMA 20 / SMA 50 overlays
- Historical close chart with trend context
- Volume chart
- Key stats: close, day change, volatility, volume, trend
- Educational stock price projection with upper/lower bands
- Learning cards (time series, trend, volatility, moving averages, prediction, LSTM)
- Recruiter notes section highlighting engineering decisions
- Clear disclaimer that predictions are educational and not investment advice

## Limitations
- Educational projection logic is heuristic (not a trained ML model)
- No backend persistence or user auth
- No intraday timeframe support in this version
- API rate limits depend on Twelve Data plan
- Prediction dates advance by calendar days (not exchange trading calendar)

## Future Roadmap
- Backend service for model versioning and caching
- Python-based LSTM/Transformer experimentation pipeline
- Scenario testing (bull/base/bear regimes)
- Watchlists, saved analyses, and portfolio overlays
- Trading-calendar-aware projection timeline
- Enhanced accessibility + keyboard chart controls

## Folder Structure
```
stock-price-predictor/
├─ src/
│  ├─ components/
│  ├─ services/
│  ├─ utils/
│  ├─ App.jsx
│  ├─ main.jsx
│  └─ index.css
├─ .env.example
├─ index.html
├─ package.json
├─ tailwind.config.js
├─ postcss.config.js
└─ vite.config.js
```

Stock Price Predictor is intentionally crafted to be extension-ready for future backend and ML integrations while still being production-presentable as a frontend portfolio piece.
