const badges = ['React', 'TailwindCSS', 'JavaScript', 'Real API Data', 'Time Series Learning'];

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
        <p className="text-base text-slate-200 md:text-lg">
          A recruiter-facing, teaching-first analytics app that turns raw NSE stock data into meaningful charts,
          trends, and an educational forward projection with honest modeling boundaries.
        </p>
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
