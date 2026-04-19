import ChartCard from './ChartCard';

function LineTrendChart({ dates, close, sma20, sma50 }) {
  const data = [
    { x: dates, y: close, type: 'scatter', mode: 'lines', name: 'Close', line: { color: '#38bdf8', width: 2.8 } },
    { x: dates, y: sma20, type: 'scatter', mode: 'lines', name: 'SMA 20', line: { color: '#2dd4bf', width: 2 } },
    { x: dates, y: sma50, type: 'scatter', mode: 'lines', name: 'SMA 50', line: { color: '#c084fc', width: 2 } }
  ];

  return (
    <ChartCard
      title="Historical Trend Line"
      description="Closing price progression with short and medium moving averages for direction context."
      data={data}
      layout={{ yaxis: { title: 'Close Price (INR)' } }}
    />
  );
}

export default LineTrendChart;
