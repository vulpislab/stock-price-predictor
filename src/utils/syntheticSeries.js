const createSeedFromTicker = (ticker) =>
  ticker.split('').reduce((acc, char, index) => acc + char.charCodeAt(0) * (index + 1), 97);

const createDeterministicRng = (seed) => {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
};

const getRecentTradingDates = (count) => {
  const dates = [];
  const cursor = new Date();
  cursor.setUTCHours(0, 0, 0, 0);

  while (dates.length < count) {
    const day = cursor.getUTCDay();
    if (day !== 0 && day !== 6) {
      dates.push(cursor.toISOString().slice(0, 10));
    }
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return dates.reverse();
};

export const generateSyntheticSeries = (ticker, points = 220) => {
  const symbol = ticker.trim().toUpperCase();
  const rng = createDeterministicRng(createSeedFromTicker(symbol));
  const dates = getRecentTradingDates(points);

  const basePrice = 80 + rng() * 2200;
  const drift = (rng() - 0.5) * 0.0014;
  const seasonalAmplitude = 0.006 + rng() * 0.01;

  let prevClose = basePrice;

  return dates.map((date, index) => {
    const seasonal = Math.sin(index / 12) * seasonalAmplitude;
    const noise = (rng() - 0.5) * 0.03;
    const dailyReturn = drift + seasonal + noise;

    const open = prevClose * (1 + (rng() - 0.5) * 0.01);
    const close = Math.max(10, prevClose * (1 + dailyReturn));
    const intradayRange = Math.max(0.4, close * (0.004 + rng() * 0.018));

    const high = Math.max(open, close) + intradayRange * rng();
    const low = Math.max(0.1, Math.min(open, close) - intradayRange * rng());

    const baseVolume = 600000 + rng() * 4500000;
    const volume = Math.round(baseVolume * (1 + Math.abs(dailyReturn) * 12));

    prevClose = close;

    return {
      datetime: date,
      open: open.toFixed(2),
      high: high.toFixed(2),
      low: low.toFixed(2),
      close: close.toFixed(2),
      volume: String(volume)
    };
  });
};
