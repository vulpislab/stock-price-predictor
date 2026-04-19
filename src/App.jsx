import { useMemo, useState } from 'react';
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
import { fetchIndianStockSeries } from './services/twelveData';
import { normalizeTimeSeries } from './utils/dataTransform';
import {
  calculateReturns,
  calculateRollingVolatility,
  calculateSMA,
  detectTrendDirection
} from './utils/indicators';
import { buildEducationalProjection } from './utils/prediction';
import { formatCurrency, formatNumber, formatPercent } from './utils/formatters';

function App() {
  const [ticker, setTicker] = useState('RELIANCE');
  const [horizon, setHorizon] = useState(7);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTicker, setSelectedTicker] = useState('RELIANCE');

  const handleAnalyze = async () => {
    if (!ticker.trim()) {
      setError('Please enter an NSE ticker symbol, such as RELIANCE or INFY.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetchIndianStockSeries(ticker);
      const normalized = normalizeTimeSeries(response.values);

      if (normalized.length < 60) {
        throw new Error('Not enough historical data returned for reliable indicator calculations.');
      }

      setSeries(normalized);
      setSelectedTicker(ticker.toUpperCase());
    } catch (err) {
      setError(err.message || 'Unexpected error while loading data.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTicker('RELIANCE');
    setHorizon(7);
    setSeries([]);
    setError('');
    setSelectedTicker('RELIANCE');
  };

  const analytics = useMemo(() => {
    if (!series.length) return null;

    const dates = series.map((d) => d.date);
    const open = series.map((d) => d.open);
    const high = series.map((d) => d.high);
    const low = series.map((d) => d.low);
    const close = series.map((d) => d.close);
    const volume = series.map((d) => d.volume);

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

    const projection = buildEducationalProjection({
      closes: close,
      dates,
      horizon,
      volatilityPct: volatility || 20
    });

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
      projection
    };
  }, [series, horizon]);

  return (
    <div className="min-h-screen bg-shell text-slate-100">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-8 md:py-12">
        <Hero />

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
            <p className="text-lg font-medium text-slate-200">Run an analysis to unlock premium charts and educational insights.</p>
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

        {analytics ? (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard label="Selected Ticker" value={selectedTicker} hint="Exchange: XNSE" />
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
              <StatCard label="Trend Direction" value={analytics.trend} hint="SMA-based directional interpretation" />
            </section>

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
            />

            <section className="glass-panel border-amber-500/35 bg-amber-500/10 p-4 text-sm text-amber-50">
              Educational disclaimer: This projection is a learning-oriented estimate based on trend smoothing and
              volatility assumptions. It is not financial advice and should not be used for trading decisions.
            </section>
          </>
        ) : null}

        <LearnPanel />
        <RecruiterNotes />
        <Footer />
      </div>
    </div>
  );
}

export default App;
