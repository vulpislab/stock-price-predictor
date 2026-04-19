const sampleTickers = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN'];

function TickerInputPanel({
  ticker,
  horizon,
  loading,
  onTickerChange,
  onHorizonChange,
  onAnalyze,
  onReset,
  error
}) {
  return (
    <section className="glass-panel p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="section-heading">Analyze Indian Stock Data</h2>
          <p className="section-subtext">Enter an NSE ticker and build charts, indicators, and a learning-based projection.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-200">Ticker Symbol (XNSE)</span>
          <input
            value={ticker}
            onChange={(event) => onTickerChange(event.target.value.toUpperCase())}
            placeholder="e.g. RELIANCE"
            className="rounded-xl border border-slate-600 bg-slate-900/70 px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-cyan-400"
            disabled={loading}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-200">Prediction Horizon: {horizon} days</span>
          <input
            type="range"
            min="3"
            max="15"
            step="1"
            value={horizon}
            onChange={(event) => onHorizonChange(Number(event.target.value))}
            className="h-10 accent-cyan-400"
            disabled={loading}
          />
        </label>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={onAnalyze}
          disabled={loading}
          className="rounded-xl bg-cyan-500 px-5 py-2.5 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Analyzing...' : 'Analyze Stock'}
        </button>
        <button
          onClick={onReset}
          disabled={loading}
          className="rounded-xl border border-slate-500 px-5 py-2.5 font-semibold text-slate-100 transition hover:border-slate-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          Reset
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-slate-300">
        <span className="font-medium text-slate-100">Quick tickers:</span>
        {sampleTickers.map((item) => (
          <button
            key={item}
            onClick={() => onTickerChange(item)}
            className="rounded-full border border-slate-600 px-3 py-1 transition hover:border-cyan-400 hover:text-cyan-200"
          >
            {item}
          </button>
        ))}
      </div>

      {error ? (
        <div className="mt-5 rounded-xl border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-100">{error}</div>
      ) : null}
    </section>
  );
}

export default TickerInputPanel;
