import ChartCard from './ChartCard';

function VolumeChart({ dates, volume }) {
  const data = [
    {
      x: dates,
      y: volume,
      type: 'bar',
      name: 'Volume',
      marker: { color: '#22c55e', opacity: 0.7 }
    }
  ];

  return (
    <ChartCard
      title="Volume Activity"
      description="Daily traded volume to identify participation spikes around trend shifts."
      data={data}
      layout={{ yaxis: { title: 'Shares Traded' } }}
    />
  );
}

export default VolumeChart;
