const DEFAULT_PYTHON_API_URL = 'http://127.0.0.1:8000';

const getDefaultPythonApiUrl = () => {
  if (typeof window === 'undefined') return DEFAULT_PYTHON_API_URL;
  const { hostname, origin } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return DEFAULT_PYTHON_API_URL;
  }
  return `${origin}/_/backend`;
};

const getErrorMessage = (payload, status) => {
  if (!payload) return `Python forecast API returned HTTP ${status}.`;
  if (typeof payload === 'string') return payload;
  if (typeof payload?.detail === 'string') return payload.detail;
  if (Array.isArray(payload?.detail)) {
    return payload.detail.map((item) => item?.msg).filter(Boolean).join(', ') || `Python forecast API returned HTTP ${status}.`;
  }
  return payload.message || `Python forecast API returned HTTP ${status}.`;
};

export const fetchPythonForecast = async ({ ticker, horizon, series }) => {
  const apiBase = import.meta.env.VITE_PYTHON_API_URL || getDefaultPythonApiUrl();
  const payload = {
    ticker: ticker.trim().toUpperCase(),
    horizon,
    dates: series.map((point) => point.date),
    closes: series.map((point) => point.close)
  };

  let response;
  try {
    response = await fetch(`${apiBase}/forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch {
    throw new Error('Python predictor service is unreachable. Using heuristic fallback projection.');
  }

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(data, response.status));
  }

  if (!Array.isArray(data?.projected_dates) || !Array.isArray(data?.projected_closes)) {
    throw new Error('Python predictor returned an invalid forecast payload.');
  }

  return data;
};
