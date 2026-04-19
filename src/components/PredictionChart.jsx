import ChartCard from './ChartCard';

function PredictionChart({ dates, close, projectedDates, projectedCloses, upperBand, lowerBand }) {
  const data = [
    {
      x: dates,
      y: close,
      type: 'scatter',
      mode: 'lines',
      name: 'Historical Close',
      line: { color: '#38bdf8', width: 2.5 }
    },
    {
      x: projectedDates,
      y: projectedCloses,
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Educational Projection',
      line: { color: '#f59e0b', dash: 'dot', width: 3 }
    },
    {
      x: projectedDates,
      y: upperBand,
      type: 'scatter',
      mode: 'lines',
      name: 'Upper Band',
      line: { color: 'rgba(16,185,129,0.8)', width: 1.6 }
    },
    {
      x: projectedDates,
      y: lowerBand,
      type: 'scatter',
      mode: 'lines',
      name: 'Lower Band',
      line: { color: 'rgba(244,63,94,0.8)', width: 1.6 }
    }
  ];

  return (
    <ChartCard
      title="Educational Stock Price Prediction"
      description="A teaching-first projection built from trend + smoothing + volatility bands, not a production trading model."
      data={data}
      layout={{ yaxis: { title: 'Projected Price (INR)' } }}
    />
  );
}

export default PredictionChart;
