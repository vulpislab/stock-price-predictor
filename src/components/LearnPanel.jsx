const lessons = [
  {
    title: 'What is Time Series Analysis?',
    text: 'Time series analysis studies how stock prices evolve across ordered dates, helping us discover patterns, seasonality, and momentum.'
  },
  {
    title: 'What is Trend Detection?',
    text: 'Trend detection compares recent behavior with longer windows to estimate whether the market is climbing, cooling, or moving sideways.'
  },
  {
    title: 'What are Moving Averages?',
    text: 'Moving averages smooth noisy daily moves. SMA 20 reacts faster; SMA 50 provides a broader directional anchor.'
  },
  {
    title: 'What is Volatility?',
    text: 'Volatility measures the intensity of price swings. Higher volatility means wider uncertainty and bigger potential moves.'
  },
  {
    title: 'What is Stock Price Prediction?',
    text: 'Prediction estimates plausible future paths from historical behavior. It is probabilistic insight, not guaranteed outcomes.'
  },
  {
    title: 'What is LSTM?',
    text: 'LSTM is a neural network architecture for sequence data. It can learn temporal dependencies from long financial histories.'
  },
  {
    title: 'Why honest LSTM positioning matters',
    text: 'This app does not fake deep learning in-browser. It uses transparent educational logic and clearly marks outputs as learning tools.'
  }
];

function LearnPanel() {
  return (
    <section className="glass-panel p-6 md:p-8">
      <h3 className="section-heading">Learning Hub</h3>
      <p className="section-subtext mt-2">Simple, recruiter-friendly explanations of the analytics concepts behind Stock Price Predictor.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {lessons.map((lesson) => (
          <article key={lesson.title} className="rounded-xl border border-slate-700 bg-panelSoft/70 p-4">
            <h4 className="text-sm font-semibold text-cyan-200">{lesson.title}</h4>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{lesson.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default LearnPanel;
