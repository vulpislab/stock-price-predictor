export const buildEducationalProjection = ({ closes, dates, horizon, volatilityPct }) => {
  if (!closes.length || !dates.length) {
    return { projectedDates: [], projectedCloses: [], upperBand: [], lowerBand: [] };
  }

  const projectedDates = [];
  const projectedCloses = [];
  const upperBand = [];
  const lowerBand = [];

  const recentWindow = closes.slice(-10);
  const avgDailyMove =
    recentWindow.slice(1).reduce((acc, curr, idx) => {
      const prev = recentWindow[idx];
      return acc + (curr - prev) / prev;
    }, 0) / Math.max(recentWindow.length - 1, 1);

  const smoothBias = closes.slice(-5).reduce((acc, curr) => acc + curr, 0) / Math.min(5, closes.length);
  let current = closes.at(-1);

  for (let i = 1; i <= horizon; i += 1) {
    const drift = current * avgDailyMove * 0.7;
    const meanReversion = (smoothBias - current) * 0.05;
    current = Math.max(0.1, current + drift + meanReversion);

    const nextDate = new Date(dates.at(-1));
    nextDate.setDate(nextDate.getDate() + i);

    const bandMove = current * ((volatilityPct / 100) / Math.sqrt(252)) * 1.2;

    projectedDates.push(nextDate.toISOString().slice(0, 10));
    projectedCloses.push(current);
    upperBand.push(current + bandMove);
    lowerBand.push(Math.max(0.1, current - bandMove));
  }

  return { projectedDates, projectedCloses, upperBand, lowerBand };
};
