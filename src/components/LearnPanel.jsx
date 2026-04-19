import { useEffect, useState } from 'react';

const architectureFlow = [
  {
    id: 'input',
    layer: 'Presentation Layer',
    title: 'User Input + Controls',
    library: 'React',
    purpose: 'State-driven form controls and event handling for ticker/horizon input.',
    whyChosen:
      'React gives predictable UI state transitions and makes it easy to coordinate loading, warning, and fallback states without imperative DOM logic.',
    boeEstimate:
      'Back-of-envelope: controlled state avoids UI mismatch bugs and can cut debugging time by ~30-40% for multi-state screens compared with ad-hoc event wiring.',
    summary:
      'Ticker and forecast horizon are captured in controlled React state. This is the trigger point for the full analysis pipeline.',
    input: 'Ticker + horizon from UI',
    output: 'Analyze action with validated symbol'
  },
  {
    id: 'service',
    layer: 'Data Access Layer',
    title: 'Market Data Service',
    library: 'Fetch API + EODHD REST',
    purpose: 'Retrieve market candles and apply quota-aware synthetic fallback behavior.',
    whyChosen:
      'Native Fetch keeps runtime lean, while direct REST integration avoids adding a server tier for simple market retrieval in this version.',
    boeEstimate:
      'Back-of-envelope: skipping an extra proxy service saves one network hop (~40-120 ms typical LAN/ISP variance) and avoids backend hosting cost for the data adapter.',
    summary:
      'Service fetches EODHD prices, tracks request usage, and automatically switches to synthetic series when live API is unavailable.',
    input: 'Ticker symbol',
    output: 'Live or synthetic OHLCV response'
  },
  {
    id: 'transform',
    layer: 'Data Preparation Layer',
    title: 'Normalization Pipeline',
    library: 'Vanilla JavaScript',
    purpose: 'Normalize and type-cast raw OHLCV fields into chart-ready time series arrays.',
    whyChosen:
      'Vanilla JavaScript is enough for deterministic transforms (parse, validate, sort). No heavy utility dependency is needed for this scope.',
    boeEstimate:
      'Back-of-envelope: avoiding an additional data-manipulation library can keep ~20-80 KB out of the bundle and reduce first-load parse/eval time on mid devices.',
    summary:
      'Raw responses are normalized to typed numeric fields, sorted by date, and prepared for chart-safe analytics calculations.',
    input: 'Raw OHLCV payload',
    output: 'Clean chronological time series'
  },
  {
    id: 'analytics',
    layer: 'Feature Engineering Layer',
    title: 'Indicators + Feature Build',
    library: 'Vanilla JavaScript',
    purpose: 'Compute SMA, volatility, returns, and chart-ready analytic context from normalized data.',
    whyChosen:
      'Indicator formulas are transparent and interview-friendly in plain JS, which improves teaching clarity and keeps business logic easy to audit.',
    boeEstimate:
      'Back-of-envelope: custom indicator code removes dependency lock-in and keeps iteration cycles fast, usually minutes instead of dependency migration work.',
    summary:
      'Client analytics produce trend diagnostics and feature context used alongside model-based prediction output.',
    input: 'Normalized close and volume arrays',
    output: 'Derived metrics for cards and charts'
  },
  {
    id: 'python-model',
    layer: 'Prediction Layer',
    title: 'Python Forecast API',
    library: 'FastAPI + scikit-learn + pandas',
    purpose: 'Train a no-DB RandomForest model per request and return forecast path with error bands.',
    whyChosen:
      'RandomForestRegressor is strong for tabular lag/indicator features, robust to non-linear behavior, and gives useful results without GPU or deep-learning overhead.',
    boeEstimate:
      'Back-of-envelope: on ~100-250 rows and ~9 engineered features, CPU training/inference is typically sub-second to a few seconds, giving high demo ROI without infra cost.',
    summary:
      'Frontend posts historical closes to FastAPI; Python builds time-series features, trains RandomForestRegressor, and performs walk-forward inference.',
    input: 'Dates + close series + horizon',
    output: 'Predicted closes, bands, and MAE/RMSE/MAPE'
  },
  {
    id: 'visual',
    layer: 'Visualization Layer',
    title: 'Interactive Charts',
    library: 'Plotly.js + react-plotly.js',
    purpose: 'Render interactive financial charts for candlestick, trend, volume, and projection.',
    whyChosen:
      'Plotly provides high-value finance chart types out of the box (candlestick, overlays, bands) with minimal custom chart-engine work.',
    boeEstimate:
      'Back-of-envelope: feature-rich charting library can save days to weeks of bespoke visualization implementation versus building advanced chart primitives manually.',
    summary:
      'Plotly components render candlestick, trend, volume, and projection views while status cards explain source and model context.',
    input: 'Analytics and metadata',
    output: 'Dashboard visuals for exploration'
  }
];

function LearnPanel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const activeStep = architectureFlow[activeIndex];

  useEffect(() => {
    if (!autoPlay) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % architectureFlow.length);
    }, 2600);
    return () => window.clearInterval(timer);
  }, [autoPlay]);

  return (
    <section className="glass-panel p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <h3 className="section-heading">Interactive Architecture Walkthrough</h3>
          <p className="section-subtext mt-2">
            Click any stage to inspect the system design. Auto-play animates runtime flow from input through Python model inference.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAutoPlay((value) => !value)}
          className="rounded-xl border border-slate-500 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-300 hover:text-cyan-100"
        >
          {autoPlay ? 'Pause Flow' : 'Play Flow'}
        </button>
      </div>

      <div className="arch-flow-track mt-6 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {architectureFlow.map((step, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`arch-node ${isActive ? 'arch-node-active' : ''}`}
              aria-pressed={isActive}
            >
              <span className={`arch-node-index ${isActive ? 'arch-node-index-active' : ''}`}>{index + 1}</span>
              <p className="mt-3 text-sm font-semibold text-slate-100">{step.title}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-400">{step.layer}</p>
            </button>
          );
        })}
      </div>

      <article key={activeStep.id} className="arch-detail-enter mt-6 rounded-2xl border border-cyan-400/30 bg-cyan-500/5 p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">
            Active Stage {activeIndex + 1}/{architectureFlow.length}
          </p>
          <p className="text-xs text-slate-300">Auto Flow: {autoPlay ? 'On' : 'Off'}</p>
        </div>

        <h4 className="mt-3 text-lg font-semibold text-white">{activeStep.title}</h4>
        <p className="mt-2 text-sm leading-relaxed text-slate-200">{activeStep.summary}</p>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-slate-700 bg-panelSoft/70 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Primary Library</p>
            <p className="mt-2 text-sm font-medium text-cyan-100">{activeStep.library}</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-panelSoft/70 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Purpose</p>
            <p className="mt-2 text-sm font-medium text-slate-100">{activeStep.purpose}</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-panelSoft/70 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Data Handoff</p>
            <p className="mt-2 text-sm font-medium text-slate-100">
              {activeStep.input} {'->'} {activeStep.output}
            </p>
          </div>
        </div>
      </article>

      <section className="arch-benefits-panel mt-6 rounded-2xl p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-lg font-semibold text-white">Engineering Rationale + ROI Snapshot</h4>
          <span className="rounded-full border border-amber-300/60 bg-amber-300/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-100">
            Back-Of-Envelope
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-100">
          For the active stage, this explains why the chosen technology was selected and what practical return it gives.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <article className="arch-benefit-card rounded-xl p-4">
            <h5 className="text-sm font-semibold uppercase tracking-[0.12em] text-amber-100">Why This Choice</h5>
            <p className="mt-2 text-sm leading-relaxed text-slate-100">{activeStep.whyChosen}</p>
          </article>
          <article className="arch-benefit-card rounded-xl p-4">
            <h5 className="text-sm font-semibold uppercase tracking-[0.12em] text-amber-100">ROI / Envelope Estimate</h5>
            <p className="mt-2 text-sm leading-relaxed text-slate-100">{activeStep.boeEstimate}</p>
          </article>
        </div>
      </section>
    </section>
  );
}

export default LearnPanel;
