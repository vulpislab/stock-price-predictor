import { useEffect, useMemo, useState } from 'react';
import Hero from './components/Hero';
import TickerInputPanel from './components/TickerInputPanel';
import StatCard from './components/StatCard';
import CandlestickChart from './components/CandlestickChart';
import LineTrendChart from './components/LineTrendChart';
import VolumeChart from './components/VolumeChart';
import PredictionChart from './components/PredictionChart';
import LearnPanel from './components/LearnPanel';
import RecruiterNotes from './components/RecruiterNotes';
import Footer from './components/Footer';
import ProjectBriefSidebar from './components/ProjectBriefSidebar';
import { fetchIndianStockSeries } from './services/marketData';
import { fetchPythonForecast } from './services/pythonForecast';
import { normalizeTimeSeries } from './utils/dataTransform';
import {
  calculateReturns,
  calculateRollingVolatility,
  calculateSMA,
  detectTrendDirection
} from './utils/indicators';
import { buildEducationalProjection } from './utils/prediction';
import { formatCurrency, formatNumber, formatPercent } from './utils/formatters';

const initialStatusMeta = {
  source: 'none',
  provider: '',
  isSynthetic: false,
  warning: '',
  localQuotaUsed: 0,
  localQuotaLimit: 100
};

const initialForecastState = {
  loading: false,
  warning: '',
  source: 'none',
  modelName: '',
  metrics: null,
  response: null
};

const tabOptions = [
  { id: 'demo', label: 'Running Demo' },
  { id: 'architecture', label: 'Architecture View' },
  { id: 'about', label: 'About Project' }
];

function App() {
  const [activeTab, setActiveTab] = useState('demo');
  const [ticker, setTicker] = useState('RELIANCE');
  const [horizon, setHorizon] = useState(7);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTicker, setSelectedTicker] = useState('RELIANCE');
  const [statusMeta, setStatusMeta] = useState(initialStatusMeta);
  const [forecastState, setForecastState] = useState(initialForecastState);

  const handleAnalyze = async () => {
    if (!ticker.trim()) {
      setError('Please enter an NSE ticker symbol, such as RELIANCE or INFY.');
      return;
    }

    setLoading(true);
    setError('');
    setStatusMeta((prev) => ({ ...prev, warning: '' }));
    setForecastState(initialForecastState);

    try {
      const response = await fetchIndianStockSeries(ticker);
      const normalized = normalizeTimeSeries(response.values);

      if (normalized.length < 60) {
        throw new Error('Not enough historical data returned for reliable indicator calculations.');
      }

      const uppercaseTicker = ticker.toUpperCase();
      setSeries(normalized);
      setSelectedTicker(uppercaseTicker);
      setStatusMeta(response.meta || initialStatusMeta);
    } catch (err) {
      setError(err.message || 'Unexpected error while loading data.');
      setStatusMeta(initialStatusMeta);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!series.length) return undefined;

    let cancelled = false;

    const loadPythonForecast = async () => {
      setForecastState((prev) => ({
        ...prev,
        loading: true,
        warning: '',
        source: prev.source === 'python' ? 'python' : 'none'
      }));

      try {
        const response = await fetchPythonForecast({
          ticker: selectedTicker,
          horizon,
          series
        });

        if (cancelled) return;

        setForecastState({
          loading: false,
          warning: '',
          source: 'python',
          modelName: response.model_name || 'RandomForestRegressor',
          metrics: response.metrics || null,
          response
        });
      } catch (err) {
        if (cancelled) return;

        setForecastState({
          loading: false,
          warning: `Python model unavailable (${err.message || 'unknown error'}). Using heuristic projection for now.`,
          source: 'heuristic',
          modelName: '',
          metrics: null,
          response: null
        });
      }
    };

    loadPythonForecast();

    return () => {
      cancelled = true;
    };
  }, [series, horizon, selectedTicker]);

  const handleReset = () => {
    setTicker('RELIANCE');
    setHorizon(7);
    setSeries([]);
    setError('');
    setSelectedTicker('RELIANCE');
    setStatusMeta(initialStatusMeta);
    setForecastState(initialForecastState);
  };

  const analytics = useMemo(() => {
    if (!series.length) return null;

    const dates = series.map((point) => point.date);
    const open = series.map((point) => point.open);
    const high = series.map((point) => point.high);
    const low = series.map((point) => point.low);
    const close = series.map((point) => point.close);
    const volume = series.map((point) => point.volume);

    const sma20 = calculateSMA(close, 20);
    const sma50 = calculateSMA(close, 50);
    const returns = calculateReturns(close);
    const rollingVol = calculateRollingVolatility(returns, 20);
    const latestClose = close.at(-1);
    const prevClose = close.at(-2);
    const dayChangePct = ((latestClose - prevClose) / prevClose) * 100;
    const volatility = rollingVol.at(-1) || 0;
    const avgVolume = volume.slice(-20).reduce((acc, curr) => acc + curr, 0) / 20;
    const trend = detectTrendDirection(close);

    const heuristicProjection = buildEducationalProjection({
      closes: close,
      dates,
      horizon,
      volatilityPct: volatility || 20
    });

    const pythonReady =
      forecastState.source === 'python' &&
      forecastState.response?.horizon === horizon &&
      forecastState.response?.projected_closes?.length > 0;

    const projection = pythonReady
      ? {
          projectedDates: forecastState.response.projected_dates,
          projectedCloses: forecastState.response.projected_closes,
          upperBand: forecastState.response.upper_band,
          lowerBand: forecastState.response.lower_band
        }
      : heuristicProjection;

    return {
      dates,
      open,
      high,
      low,
      close,
      volume,
      sma20,
      sma50,
      latestClose,
      dayChangePct,
      volatility,
      avgVolume,
      trend,
      projection,
      projectionSource: pythonReady ? 'python' : 'heuristic'
    };
  }, [series, horizon, forecastState]);

  const renderDemoTab = () => (
    <section className="space-y-8">
      <TickerInputPanel
        ticker={ticker}
        horizon={horizon}
        loading={loading}
        onTickerChange={setTicker}
        onHorizonChange={setHorizon}
        onAnalyze={handleAnalyze}
        onReset={handleReset}
        error={error}
      />

      {!analytics && !loading ? (
        <section className="glass-panel p-10 text-center">
          <p className="text-lg font-medium text-slate-200">Run an analysis to unlock premium charts and model outputs.</p>
          <p className="mt-2 text-sm text-slate-400">
            Tip: Start with RELIANCE, TCS, INFY, HDFCBANK, ICICIBANK, or SBIN.
          </p>
        </section>
      ) : null}

      {loading ? (
        <section className="glass-panel p-10 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" />
          <p className="mt-4 text-slate-200">Fetching market data and building analytics...</p>
        </section>
      ) : null}

      {forecastState.loading && analytics ? (
        <section className="glass-panel border-cyan-500/35 bg-cyan-500/10 p-4 text-sm text-cyan-50">
          Python model service is training and generating a fresh forecast for the selected horizon...
        </section>
      ) : null}

      {statusMeta.warning ? (
        <section className="glass-panel border-amber-500/35 bg-amber-500/10 p-4 text-sm text-amber-50">
          {statusMeta.warning}
        </section>
      ) : null}

      {forecastState.warning ? (
        <section className="glass-panel border-amber-500/35 bg-amber-500/10 p-4 text-sm text-amber-50">
          {forecastState.warning}
        </section>
      ) : null}

      {analytics ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard label="Selected Ticker" value={selectedTicker} hint="Exchange: NSE" />
            <StatCard
              label="Data Source"
              value={statusMeta.isSynthetic ? 'Synthetic fallback' : 'Live market data'}
              hint={
                statusMeta.isSynthetic
                  ? 'Fallback keeps charts active when live quota is exhausted.'
                  : `Provider: ${statusMeta.provider || 'EODHD'}`
              }
            />
            <StatCard
              label="Prediction Engine"
              value={
                forecastState.loading
                  ? 'Python model loading'
                  : analytics.projectionSource === 'python'
                    ? 'Python ML model'
                    : 'Heuristic fallback'
              }
              hint={
                forecastState.loading
                  ? 'Generating fresh forecast from backend model. This can take a few seconds.'
                  : analytics.projectionSource === 'python'
                    ? `Model: ${forecastState.modelName || 'RandomForestRegressor'}`
                    : 'Using client-side projection because Python API is unavailable.'
              }
            />
            <StatCard label="Latest Close" value={formatCurrency(analytics.latestClose)} />
            <StatCard
              label="1-Day Change"
              value={formatPercent(analytics.dayChangePct)}
              hint="Compared with previous trading session"
            />
            <StatCard
              label="20-Day Annualized Volatility"
              value={formatPercent(analytics.volatility)}
              hint="Estimated from rolling daily returns"
            />
            <StatCard
              label="Average Recent Volume"
              value={formatNumber(analytics.avgVolume)}
              hint="Mean over latest 20 sessions"
            />
            <StatCard
              label="Requests Used Today"
              value={`${statusMeta.localQuotaUsed}/${statusMeta.localQuotaLimit}`}
              hint="Tracked in browser local storage for the free-tier quota guard."
            />
            <StatCard label="Trend Direction" value={analytics.trend} hint="SMA-based directional interpretation" />
          </section>

          {forecastState.metrics && analytics.projectionSource === 'python' ? (
            <section className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Model MAE" value={formatCurrency(forecastState.metrics.mae)} hint="Lower is better" />
              <StatCard label="Model RMSE" value={formatCurrency(forecastState.metrics.rmse)} hint="Penalizes larger errors" />
              <StatCard
                label="Model MAPE"
                value={`${Number(forecastState.metrics.mape).toFixed(2)}%`}
                hint="Average percentage error"
              />
            </section>
          ) : null}

          <CandlestickChart
            dates={analytics.dates}
            open={analytics.open}
            high={analytics.high}
            low={analytics.low}
            close={analytics.close}
            sma20={analytics.sma20}
            sma50={analytics.sma50}
          />

          <LineTrendChart
            dates={analytics.dates}
            close={analytics.close}
            sma20={analytics.sma20}
            sma50={analytics.sma50}
          />

          <VolumeChart dates={analytics.dates} volume={analytics.volume} />

          <PredictionChart
            dates={analytics.dates}
            close={analytics.close}
            projectedDates={analytics.projection.projectedDates}
            projectedCloses={analytics.projection.projectedCloses}
            upperBand={analytics.projection.upperBand}
            lowerBand={analytics.projection.lowerBand}
            projectionSource={analytics.projectionSource}
          />

          <section className="glass-panel border-amber-500/35 bg-amber-500/10 p-4 text-sm text-amber-50">
            Model disclaimer: Forecast output is for learning and product demonstration only. It is not financial advice
            and should not be used as the sole basis for trading decisions.
          </section>
        </>
      ) : null}
    </section>
  );

  const renderArchitectureTab = () => (
    <section className="space-y-8">
      <LearnPanel />
      <RecruiterNotes />
    </section>
  );

  const renderAboutTab = () => (
    <section className="space-y-8">
      <section className="glass-panel p-6 md:p-8">
        <h2 className="section-heading">About This Project</h2>
        <p className="section-subtext mt-2">
          This product is designed for business and product stakeholders who need quick market understanding without
          deep technical analysis.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <article className="rounded-xl border border-slate-700 bg-panelSoft/70 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-cyan-100">Business Goal</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-200">
              Help teams move from raw stock data to decision-ready discussion in minutes, with clear risk and trend visibility.
            </p>
          </article>
          <article className="rounded-xl border border-slate-700 bg-panelSoft/70 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-cyan-100">Product Outcome</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-200">
              Create a consistent analysis workflow that stays available during outages and keeps trust through transparent forecast metrics.
            </p>
          </article>
        </div>
      </section>
      <ProjectBriefSidebar />
    </section>
  );

  return (
    <div className="min-h-screen bg-shell text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        <Hero />

        <section className="glass-panel mt-8 p-2">
          <div className="grid gap-2 sm:grid-cols-3">
            {tabOptions.map((tab) => {
              const isActive = activeTab === tab.id;
              const isDemoTab = tab.id === 'demo';
              const demoStyle = isDemoTab
                ? isActive
                  ? {
                      background: 'linear-gradient(90deg, #16a34a, #10b981)',
                      borderColor: '#6ee7b7',
                      color: '#ffffff',
                      boxShadow: '0 0 0 2px rgba(110,231,183,0.45), 0 14px 30px rgba(16,185,129,0.45)'
                    }
                  : {
                      background: 'linear-gradient(90deg, rgba(5,150,105,0.45), rgba(16,185,129,0.25))',
                      borderColor: 'rgba(52,211,153,0.9)',
                      color: '#d1fae5'
                    }
                : undefined;
              const className = isDemoTab
                ? isActive
                  ? 'rounded-xl px-4 py-2.5 text-sm font-semibold transition border'
                  : 'rounded-xl px-4 py-2.5 text-sm font-semibold transition border hover:opacity-95'
                : isActive
                  ? 'rounded-xl px-4 py-2.5 text-sm font-semibold transition border border-amber-300/70 bg-gradient-to-r from-amber-300/30 to-cyan-400/20 text-white'
                  : 'rounded-xl px-4 py-2.5 text-sm font-semibold transition border border-slate-600 bg-slate-900/65 text-slate-200 hover:border-cyan-400/60 hover:text-white';
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={className}
                  style={demoStyle}
                  aria-pressed={isActive}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </section>

        <div className="mt-8">
          {activeTab === 'demo' ? renderDemoTab() : null}
          {activeTab === 'architecture' ? renderArchitectureTab() : null}
          {activeTab === 'about' ? renderAboutTab() : null}
        </div>

        <div className="mt-8">
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default App;
