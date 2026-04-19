export const normalizeTimeSeries = (rawValues = []) => {
  const normalized = rawValues
    .map((point) => ({
      date: point.datetime,
      open: Number.parseFloat(point.open),
      high: Number.parseFloat(point.high),
      low: Number.parseFloat(point.low),
      close: Number.parseFloat(point.close),
      volume: Number.parseFloat(point.volume)
    }))
    .filter(
      (point) =>
        Number.isFinite(point.open) &&
        Number.isFinite(point.high) &&
        Number.isFinite(point.low) &&
        Number.isFinite(point.close) &&
        Number.isFinite(point.volume)
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return normalized;
};
