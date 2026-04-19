import Plot from 'react-plotly.js';

const baseLayout = {
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(0,0,0,0)',
  autosize: true,
  margin: { l: 45, r: 20, t: 40, b: 45 },
  font: { color: '#cbd5e1' },
  xaxis: { gridcolor: '#1e293b', tickfont: { color: '#94a3b8' } },
  yaxis: { gridcolor: '#1e293b', tickfont: { color: '#94a3b8' } },
  legend: { orientation: 'h', y: 1.1 }
};

function ChartCard({ title, description, data, layout }) {
  return (
    <section className="glass-panel p-5 md:p-6">
      <div className="mb-4">
        <h3 className="section-heading">{title}</h3>
        <p className="section-subtext">{description}</p>
      </div>
      <Plot
        data={data}
        layout={{ ...baseLayout, ...layout }}
        config={{ displaylogo: false, responsive: true }}
        useResizeHandler
        style={{ width: '100%', height: '100%' }}
        className="h-[360px]"
      />
    </section>
  );
}

export default ChartCard;
