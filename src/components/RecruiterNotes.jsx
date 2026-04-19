const points = [
  'Real Twelve Data API integration for NSE equities using XNSE exchange context.',
  'Market data normalization pipeline from raw OHLCV response to chart-ready datasets.',
  'Interactive Plotly visualizations for candlesticks, trend lines, volume, and projections.',
  'Indicator engineering in JavaScript: SMA 20/50, daily returns, annualized rolling volatility, trend signal.',
  'Teaching-first UX with transparent language and premium dashboard presentation quality.',
  'Honest modeling posture: educational forecasting only, no false deep-learning claims.',
  'Clean architecture ready for future backend, Python services, and real LSTM/ML experimentation.'
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
