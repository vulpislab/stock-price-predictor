const points = [
  'Real EODHD API integration for NSE equities with client-side quota tracking.',
  'Market data normalization pipeline from raw OHLCV response to chart-ready datasets.',
  'Production-style Python forecasting microservice using FastAPI, pandas, and scikit-learn.',
  'Automatic synthetic-data fallback keeps analysis charts usable when free API quota is exhausted.',
  'Interactive Plotly visualizations for candlesticks, trend lines, volume, and projections.',
  'Indicator engineering in JavaScript: SMA 20/50, daily returns, annualized rolling volatility, trend signal.',
  'Model evaluation surfaced in UI with MAE, RMSE, and MAPE for transparent teaching-first prediction quality.',
  'Teaching-first UX with transparent language and premium dashboard presentation quality.',
  'Honest modeling posture: model outputs are educational and explicitly marked as non-advisory.',
  'Clean architecture with backend-ready boundaries for future model versioning and advanced ML experimentation.'
];

function RecruiterNotes() {
  return (
    <section className="glass-panel p-6 md:p-8">
      <h3 className="section-heading">Why this project is strong for recruiters</h3>
      <p className="section-subtext mt-2">Stock Price Predictor blends product thinking, data handling, and polished frontend execution.</p>
      <ul className="mt-6 grid gap-3 text-sm text-slate-200 md:grid-cols-2">
        {points.map((point) => (
          <li key={point} className="rounded-xl border border-slate-700 bg-panelSoft/70 p-4 leading-relaxed">
            {point}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default RecruiterNotes;
