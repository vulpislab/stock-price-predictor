const badges = ['React', 'TailwindCSS', 'JavaScript', 'Python FastAPI', 'Real API Data', 'Time Series Learning'];

function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-700/70 bg-panel/80 bg-hero p-8 md:p-12 shadow-glow">
      <div className="max-w-3xl space-y-6">
        <p className="inline-flex rounded-full border border-cyan-400/40 bg-cyan-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
          Premium Teaching Experience
        </p>
        <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl">
          Stock Price Predictor
        </h1>
        <div className="space-y-3 text-base text-slate-200 md:text-lg">
          <p>
            <span className="font-semibold text-cyan-200">Problem Statement:</span> People who are new to stock markets
            often see raw price data but cannot easily understand trend, risk, or possible next movement.
          </p>
          <p>
            <span className="font-semibold text-cyan-200">What This App Does:</span> It converts NSE stock data into
            simple charts, clear signals, and a Python-based price forecast with accuracy scores shown in plain view.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-violet-300/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-100"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Hero;
