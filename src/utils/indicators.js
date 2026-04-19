export const calculateSMA = (values, period) =>
  values.map((_, index) => {
    if (index < period - 1) return null;
    const window = values.slice(index - period + 1, index + 1);
    const sum = window.reduce((acc, curr) => acc + curr, 0);
    return sum / period;
  });

export const calculateReturns = (values) => {
  const returns = [];
  for (let i = 1; i < values.length; i += 1) {
    const prev = values[i - 1];
    const curr = values[i];
    if (!prev || !curr) {
      returns.push(0);
      continue;
    }
    returns.push((curr - prev) / prev);
  }
  return returns;
};

export const calculateRollingVolatility = (returns, period = 20) =>
  returns.map((_, index) => {
    if (index < period - 1) return null;
    const segment = returns.slice(index - period + 1, index + 1);
    const mean = segment.reduce((acc, curr) => acc + curr, 0) / period;
    const variance =
      segment.reduce((acc, curr) => acc + (curr - mean) ** 2, 0) / period;
    return Math.sqrt(variance) * Math.sqrt(252) * 100;
  });

export const detectTrendDirection = (closes, shortPeriod = 5, longPeriod = 20) => {
  if (closes.length < longPeriod) return 'Insufficient data';
  const short =
    closes.slice(-shortPeriod).reduce((acc, curr) => acc + curr, 0) / shortPeriod;
  const long = closes.slice(-longPeriod).reduce((acc, curr) => acc + curr, 0) / longPeriod;
  const spread = ((short - long) / long) * 100;

  if (spread > 1) return 'Bullish momentum';
  if (spread < -1) return 'Bearish pressure';
  return 'Sideways consolidation';
};
