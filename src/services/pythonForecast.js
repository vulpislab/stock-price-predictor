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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchPythonForecast = async ({ ticker, horizon, series }) => {
  const apiBase = import.meta.env.VITE_PYTHON_API_URL || getDefaultPythonApiUrl();
  const payload = {
    ticker: ticker.trim().toUpperCase(),
    horizon,
    dates: series.map((point) => point.date),
    closes: series.map((point) => point.close)
  };

  let lastError = null;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    let response;
    try {
      response = await fetch(`${apiBase}/forecast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch {
      lastError = new Error('Python predictor service is unreachable. Using heuristic fallback projection.');
      if (attempt < 2) {
        await sleep(1200);
        continue;
      }
      throw lastError;
    }

    let data;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      const message = getErrorMessage(data, response.status);
      lastError = new Error(message);

      if ((response.status === 502 || response.status === 503 || response.status === 504) && attempt < 2) {
        await sleep(1200);
        continue;
      }

      throw lastError;
    }

    if (!Array.isArray(data?.projected_dates) || !Array.isArray(data?.projected_closes)) {
      lastError = new Error('Python predictor returned an invalid forecast payload.');
      if (attempt < 2) {
        await sleep(1200);
        continue;
      }
      throw lastError;
    }

    return data;
  }

  throw lastError || new Error('Python predictor service is unavailable.');
};
