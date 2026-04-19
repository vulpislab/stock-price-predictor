import { generateSyntheticSeries } from '../utils/syntheticSeries';

const API_BASE = 'https://eodhd.com/api/eod';
const LOCAL_FREE_REQUEST_LIMIT = 100;
const USAGE_STORAGE_KEY = 'eodhd_daily_usage_v1';

const todayKey = () => new Date().toISOString().slice(0, 10);

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
  return payload.message || payload.error || payload.status || '';
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
  `Failed to reach EODHD live servers right now${
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
  const apiKey = import.meta.env.VITE_EODHD_API_KEY;
  const symbol = normalizeTicker(ticker);
  if (!/^[A-Z0-9]+$/.test(symbol)) {
    throw new Error('Use a valid NSE ticker (letters and numbers only).');
  }

  if (!apiKey) {
    return buildSyntheticFallback(symbol, buildConfigWarning('Missing VITE_EODHD_API_KEY in .env'));
  }

  const usageBeforeRequest = readUsage();
  if (usageBeforeRequest.count >= LOCAL_FREE_REQUEST_LIMIT) {
    return buildSyntheticFallback(symbol, buildQuotaWarning(), { forceQuotaLimit: true });
  }

  const fromDate = new Date();
  fromDate.setUTCDate(fromDate.getUTCDate() - 420);

  const params = new URLSearchParams({
    api_token: apiKey,
    period: 'd',
    order: 'a',
    fmt: 'json',
    from: fromDate.toISOString().slice(0, 10)
  });

  let response;
  try {
    response = await fetch(`${API_BASE}/${symbol}.NSE?${params.toString()}`);
  } catch {
    return buildSyntheticFallback(symbol, buildConnectivityWarning('Failed to reach EODHD. Please retry in a moment.'));
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
    if (response.status >= 500) {
      return buildSyntheticFallback(
        symbol,
        buildConnectivityWarning(providerMessage || `HTTP ${response.status}`)
      );
    }
    if ((providerMessage || '').toLowerCase().includes('api token') || (providerMessage || '').toLowerCase().includes('api key')) {
      return buildSyntheticFallback(symbol, buildConfigWarning(providerMessage));
    }
    return buildSyntheticFallback(symbol, buildProviderWarning(providerMessage || `HTTP ${response.status}`));
  }

  if (!Array.isArray(payload)) {
    if (isQuotaError(response.status, providerMessage)) {
      writeUsage({ date: todayKey(), count: LOCAL_FREE_REQUEST_LIMIT });
      return buildSyntheticFallback(symbol, buildQuotaWarning(providerMessage), { forceQuotaLimit: true });
    }
    return buildSyntheticFallback(symbol, buildProviderWarning(providerMessage || 'Unexpected response format'));
  }

  if (!payload.length) {
    throw new Error('No market data found. Check ticker spelling and try again.');
  }

  const normalizedValues = payload.map((point) => ({
    datetime: point.date,
    open: point.open,
    high: point.high,
    low: point.low,
    close: point.close,
    volume: point.volume ?? 0
  }));

  const usageAfterRequest = incrementUsage();

  return {
    values: normalizedValues,
    meta: {
      source: 'live',
      provider: 'EODHD',
      isSynthetic: false,
      warning: '',
      localQuotaUsed: usageAfterRequest.count,
      localQuotaLimit: LOCAL_FREE_REQUEST_LIMIT
    }
  };
};
