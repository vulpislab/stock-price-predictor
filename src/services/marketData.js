import { generateSyntheticSeries } from '../utils/syntheticSeries';

const DEFAULT_BACKEND_API_URL = 'http://127.0.0.1:8000';
const LOCAL_FREE_REQUEST_LIMIT = 100;
const USAGE_STORAGE_KEY = 'eodhd_daily_usage_v1';

const todayKey = () => new Date().toISOString().slice(0, 10);

const getDefaultBackendApiUrl = () => {
  if (typeof window === 'undefined') return DEFAULT_BACKEND_API_URL;
  const { hostname, origin } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return DEFAULT_BACKEND_API_URL;
  }
  return `${origin}/_/backend`;
};

const getStorage = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
};

const readUsage = () => {
  const storage = getStorage();
  const fallback = { date: todayKey(), count: 0 };
  if (!storage) return fallback;

  try {
    const raw = storage.getItem(USAGE_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (parsed?.date !== fallback.date) return fallback;
    if (!Number.isInteger(parsed?.count) || parsed.count < 0) return fallback;
    return parsed;
  } catch {
    return fallback;
  }
};

const writeUsage = (usage) => {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(USAGE_STORAGE_KEY, JSON.stringify(usage));
};

const incrementUsage = () => {
  const current = readUsage();
  const next = { date: todayKey(), count: current.count + 1 };
  writeUsage(next);
  return next;
};

const extractApiMessage = (payload) => {
  if (!payload) return '';
  if (typeof payload === 'string') return payload;
  if (Array.isArray(payload)) return '';
  return payload.detail || payload.message || payload.error || payload.status || '';
};

const isQuotaError = (status, message) => {
  if (status === 429) return true;
  const value = (message || '').toLowerCase();
  return (
    value.includes('quota') ||
    value.includes('limit') ||
    value.includes('too many') ||
    value.includes('exceeded') ||
    value.includes('100 request')
  );
};

const buildQuotaWarning = (providerMessage = '') =>
  `Daily request quota (${LOCAL_FREE_REQUEST_LIMIT} requests) has been completed. Live data is unavailable right now${
    providerMessage ? ` (${providerMessage})` : ''
  }. Showing synthetic data so charts and analysis stay available.`;

const buildConnectivityWarning = (providerMessage = '') =>
  `Failed to reach the live market-data service right now${
    providerMessage ? ` (${providerMessage})` : ''
  }. Showing synthetic data so charts and analysis stay available.`;

const buildConfigWarning = (providerMessage = '') =>
  `Live API configuration is incomplete or invalid${
    providerMessage ? ` (${providerMessage})` : ''
  }. Showing synthetic data so charts and analysis stay available.`;

const buildProviderWarning = (providerMessage = '') =>
  `Live API returned an error${
    providerMessage ? ` (${providerMessage})` : ''
  }. Showing synthetic data so charts and analysis stay available.`;

const buildSyntheticFallback = (symbol, warning, options = {}) => {
  const { forceQuotaLimit = false } = options;
  const usage = readUsage();
  return {
    values: generateSyntheticSeries(symbol, 220),
    meta: {
      source: 'synthetic',
      provider: 'Synthetic fallback',
      isSynthetic: true,
      warning,
      localQuotaUsed: forceQuotaLimit ? Math.max(usage.count, LOCAL_FREE_REQUEST_LIMIT) : usage.count,
      localQuotaLimit: LOCAL_FREE_REQUEST_LIMIT
    }
  };
};

const normalizeTicker = (ticker) => ticker.trim().toUpperCase();

export const fetchIndianStockSeries = async (ticker) => {
  const symbol = normalizeTicker(ticker);
  if (!/^[A-Z0-9]+$/.test(symbol)) {
    throw new Error('Use a valid NSE ticker (letters and numbers only).');
  }

  const usageBeforeRequest = readUsage();
  if (usageBeforeRequest.count >= LOCAL_FREE_REQUEST_LIMIT) {
    return buildSyntheticFallback(symbol, buildQuotaWarning(), { forceQuotaLimit: true });
  }

  const backendApiBase = import.meta.env.VITE_BACKEND_API_URL || getDefaultBackendApiUrl();
  const requestUrl = `${backendApiBase}/market-data?ticker=${encodeURIComponent(symbol)}&outputsize=220`;

  let response;
  try {
    response = await fetch(requestUrl);
  } catch {
    return buildSyntheticFallback(symbol, buildConnectivityWarning('Failed to reach backend service.'));
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  const providerMessage = extractApiMessage(payload);

  if (!response.ok) {
    if (isQuotaError(response.status, providerMessage)) {
      writeUsage({ date: todayKey(), count: LOCAL_FREE_REQUEST_LIMIT });
      return buildSyntheticFallback(symbol, buildQuotaWarning(providerMessage), { forceQuotaLimit: true });
    }

    if (response.status === 503 || response.status >= 500) {
      return buildSyntheticFallback(symbol, buildConnectivityWarning(providerMessage || `HTTP ${response.status}`));
    }

    const lowerMessage = (providerMessage || '').toLowerCase();
    if (
      lowerMessage.includes('missing eodhd_api_key') ||
      lowerMessage.includes('api token') ||
      lowerMessage.includes('api key')
    ) {
      return buildSyntheticFallback(symbol, buildConfigWarning(providerMessage));
    }

    return buildSyntheticFallback(symbol, buildProviderWarning(providerMessage || `HTTP ${response.status}`));
  }

  if (!Array.isArray(payload?.values)) {
    return buildSyntheticFallback(symbol, buildProviderWarning('Unexpected response format from backend.'));
  }

  if (!payload.values.length) {
    throw new Error('No market data found. Check ticker spelling and try again.');
  }

  const usageAfterRequest = incrementUsage();

  return {
    values: payload.values,
    meta: {
      source: 'live',
      provider: payload.provider || 'Backend proxy',
      isSynthetic: false,
      warning: '',
      localQuotaUsed: usageAfterRequest.count,
      localQuotaLimit: LOCAL_FREE_REQUEST_LIMIT
    }
  };
};
