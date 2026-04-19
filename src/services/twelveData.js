const API_BASE = 'https://api.twelvedata.com/time_series';

export const fetchIndianStockSeries = async (ticker) => {
  const apiKey = import.meta.env.VITE_TWELVE_DATA_API_KEY;
  if (!apiKey) {
    throw new Error('Missing API key. Add VITE_TWELVE_DATA_API_KEY to your .env file.');
  }

  const symbol = ticker.trim().toUpperCase();
  if (!/^[A-Z0-9]+$/.test(symbol)) {
    throw new Error('Use a valid NSE ticker (letters and numbers only).');
  }

  const params = new URLSearchParams({
    symbol,
    interval: '1day',
    outputsize: '220',
    exchange: 'XNSE',
    apikey: apiKey
  });

  const response = await fetch(`${API_BASE}?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to reach Twelve Data. Please retry in a moment.');
  }

  const data = await response.json();
  if (data.status === 'error') {
    throw new Error(data.message || 'Twelve Data returned an error for this ticker.');
  }

  if (!data.values?.length) {
    throw new Error('No market data found. Check ticker spelling and try again.');
  }

  return data;
};
