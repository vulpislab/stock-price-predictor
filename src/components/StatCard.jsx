function StatCard({ label, value, hint }) {
  return (
    <article className="glass-panel p-5 transition hover:-translate-y-0.5 hover:border-cyan-400/50">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      {hint ? <p className="mt-2 text-sm text-slate-300">{hint}</p> : null}
    </article>
  );
}

export default StatCard;
