const focusAreas = [
  {
    title: 'Problem We Solve',
    detail:
      'Market data is hard for non-analysts to interpret quickly. Leaders need a clear way to move from raw numbers to understandable business signals.'
  },
  {
    title: 'Who This Is For',
    detail:
      'Product managers, founders, leadership teams, and business stakeholders who want faster stock insight conversations without deep quant background.'
  },
  {
    title: 'Core Product Promise',
    detail:
      'Give one screen where users can understand what happened, what is changing, and what might happen next with transparent confidence ranges.'
  }
];

const leadershipLens = [
  'Reduces decision friction by turning complex market movement into plain-language insights.',
  'Supports faster review cycles through consistent ticker-to-insight workflow.',
  'Improves stakeholder trust by showing forecast quality metrics beside predictions.',
  'Protects continuity with fallback behavior so insight workflows continue during data disruptions.'
];

const successMetrics = [
  { label: 'Insight Time', value: '< 2 min', note: 'From ticker entry to usable summary' },
  { label: 'Fallback Continuity', value: '100%', note: 'Charts remain available when live feed fails' },
  { label: 'Decision Readiness', value: 'High', note: 'Trend, volatility, and projection shown together' }
];

function ProjectBriefSidebar() {
  return (
    <aside className="glass-panel border-amber-300/25 bg-gradient-to-b from-amber-500/10 via-panel/80 to-cyan-500/10 p-5 md:p-6">
      <div className="space-y-2">
        <p className="inline-flex rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-100">
          Product Brief
        </p>
        <h3 className="text-xl font-semibold text-white">Leadership View</h3>
        <p className="text-sm leading-relaxed text-slate-200">
          This sidebar explains the product in business language: what problem it solves, who benefits, and how value is measured.
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {focusAreas.map((item) => (
          <article key={item.title} className="rounded-xl border border-slate-700/80 bg-panelSoft/70 p-4">
            <h4 className="text-sm font-semibold uppercase tracking-[0.1em] text-cyan-100">{item.title}</h4>
            <p className="mt-2 text-sm leading-relaxed text-slate-200">{item.detail}</p>
          </article>
        ))}
      </div>

      <article className="mt-5 rounded-xl border border-cyan-300/30 bg-cyan-500/10 p-4">
        <h4 className="text-sm font-semibold uppercase tracking-[0.1em] text-cyan-100">Why Leadership Cares</h4>
        <ul className="mt-3 space-y-2 text-sm text-slate-100">
          {leadershipLens.map((point) => (
            <li key={point} className="flex gap-2 leading-relaxed">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-300" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </article>

      <article className="mt-5 rounded-xl border border-amber-300/35 bg-amber-400/10 p-4">
        <h4 className="text-sm font-semibold uppercase tracking-[0.1em] text-amber-100">Outcome Scorecard</h4>
        <div className="mt-3 space-y-3">
          {successMetrics.map((metric) => (
            <div key={metric.label} className="rounded-lg border border-slate-700/70 bg-panel/70 p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-400">{metric.label}</p>
              <p className="mt-1 text-lg font-semibold text-white">{metric.value}</p>
              <p className="mt-1 text-xs text-slate-300">{metric.note}</p>
            </div>
          ))}
        </div>
      </article>
    </aside>
  );
}

export default ProjectBriefSidebar;
