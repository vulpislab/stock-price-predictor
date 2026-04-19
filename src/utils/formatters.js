export const formatCurrency = (value) => {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(value);
};

export const formatPercent = (value) => {
  if (!Number.isFinite(value)) return '—';
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

export const formatNumber = (value) => {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en-IN', {
    notation: value > 99999 ? 'compact' : 'standard',
    maximumFractionDigits: 2
  }).format(value);
};

export const formatDateLabel = (dateText) => {
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return dateText;
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};
