import ChartCard from './ChartCard';

function CandlestickChart({ dates, open, high, low, close, sma20, sma50 }) {
  const data = [
    {
      x: dates,
      open,
      high,
      low,
      close,
      type: 'candlestick',
      name: 'OHLC',
      increasing: { line: { color: '#10b981' } },
      decreasing: { line: { color: '#f43f5e' } }
    },
    {
      x: dates,
      y: sma20,
      type: 'scatter',
      mode: 'lines',
      name: 'SMA 20',
      line: { color: '#22d3ee', width: 2 }
    },
    {
      x: dates,
      y: sma50,
      type: 'scatter',
      mode: 'lines',
      name: 'SMA 50',
      line: { color: '#a78bfa', width: 2 }
    }
  ];

  return (
    <ChartCard
      title="Candlestick + Moving Averages"
      description="Market structure view with daily candles and trend smoothing overlays."
      data={data}
      layout={{ yaxis: { title: 'Price (INR)' } }}
    />
  );
}

export default CandlestickChart;
