"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { ChartTimeframe, OhlcvBar } from "@aura/shared";
import {
  createChart,
  ColorType,
  CandlestickSeries,
  LineSeries,
  AreaSeries,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
} from "lightweight-charts";
import {
  Loader2,
  TrendingUp,
  BarChart2,
  Layers,
  Clock,
} from "lucide-react";

export type ChartDisplayMode = "both" | "candles" | "line";

interface CandlestickChartProps {
  symbol: string;
  initialBars?: OhlcvBar[];
  data?: OhlcvBar[];
  timeframe: ChartTimeframe;
  onTimeframeChange?: (tf: ChartTimeframe) => void;
  isLoading?: boolean;
  onPriceUpdate?: (quote: {
    price: number;
    change: number;
    changePercent: number;
    high: number;
    low: number;
    open: number;
    volume: number;
  }) => void;
}

const TIMEFRAME_CONFIGS: { label: string; value: ChartTimeframe; seconds: number }[] = [
  { label: "1m", value: "1m", seconds: 60 },
  { label: "3m", value: "3m", seconds: 180 },
  { label: "5m", value: "5m", seconds: 300 },
  { label: "15m", value: "15m", seconds: 900 },
  { label: "1D", value: "1D", seconds: 86400 },
  { label: "1W", value: "1W", seconds: 604800 },
];

const BASE_PRICES: Record<string, number> = {
  RELIANCE: 2946.0,
  TCS: 4120.0,
  INFY: 1890.0,
  HDFCBANK: 1680.0,
  ICICIBANK: 1285.0,
  SBIN: 825.0,
  NIFTY50: 24800.0,
  SENSEX: 81500.0,
  BANKNIFTY: 52500.0,
};

function getBasePrice(sym: string): number {
  return BASE_PRICES[sym.toUpperCase()] || 2500.0;
}

const STORAGE_KEY_PREFIX = "aura_candles_history_v1_";
const getStorageKey = (sym: string, tf: string) =>
  `${STORAGE_KEY_PREFIX}${sym.toUpperCase()}_${tf}`;

/** Retrieve persistent candles from localStorage so generated history is never lost */
function loadStoredCandles(sym: string, tf: string): OhlcvBar[] | null {
  try {
    if (typeof window === "undefined") return null;
    const item = localStorage.getItem(getStorageKey(sym, tf));
    if (item) {
      const parsed = JSON.parse(item);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return null;
}

/** Persist updated candles into localStorage so new candles are permanently stored */
function persistCandles(sym: string, tf: string, bars: OhlcvBar[]) {
  try {
    if (typeof window === "undefined" || !bars.length) return;
    const toStore = bars.slice(-300);
    localStorage.setItem(getStorageKey(sym, tf), JSON.stringify(toStore));
  } catch {
    // fallback
  }
}

/** Generates realistic baseline simulated bars if server data is unavailable */
function generateFallbackBars(
  symbol: string,
  timeframe: ChartTimeframe,
  count = 60
): OhlcvBar[] {
  const cfg =
    TIMEFRAME_CONFIGS.find((c) => c.value === timeframe) || TIMEFRAME_CONFIGS[0];
  const intervalSec = cfg.seconds;
  const nowSec = Math.floor(Date.now() / 1000);
  const currentIntervalTime = Math.floor(nowSec / intervalSec) * intervalSec;
  const base = getBasePrice(symbol);
  const bars: OhlcvBar[] = [];

  let currentPrice = base;

  for (let i = count; i >= 0; i -= 1) {
    const time = currentIntervalTime - i * intervalSec;
    const delta = (Math.random() - 0.495) * 0.015;
    const open = currentPrice;
    let close = Number(Math.max(1, open * (1 + delta)).toFixed(2));

    // Keep close within 3% of baseline for historical anchor
    if (Math.abs(close - base) / base > 0.03) {
      close = Number((base + (close - base) * 0.4).toFixed(2));
    }
    currentPrice = close;

    const high = Number((Math.max(open, close) * (1 + Math.random() * 0.006)).toFixed(2));
    const low = Number((Math.min(open, close) * (1 - Math.random() * 0.006)).toFixed(2));
    const volume = Math.floor(50_000 + Math.random() * 850_000);

    bars.push({ time, open, high, low, close, volume });
  }

  return bars;
}

export function CandlestickChart({
  symbol,
  initialBars,
  data,
  timeframe,
  onTimeframeChange,
  isLoading = false,
  onPriceUpdate,
}: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const areaSeriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  // Chart view mode: 'both' shows Candlesticks + Line Overlay simultaneously!
  const [chartMode, setChartMode] = useState<ChartDisplayMode>("both");

  // Active duration configuration for selected timeframe (1m = 60s, 3m = 180s, 5m = 300s)
  const activeTfConfig =
    TIMEFRAME_CONFIGS.find((c) => c.value === timeframe) || TIMEFRAME_CONFIGS[0];
  const intervalSeconds = activeTfConfig.seconds;

  // Countdown timer in seconds until next automated candle forms
  const [countdown, setCountdown] = useState(intervalSeconds);

  // Canonical mutable bars array that persists in memory across ticks
  const barsRef = useRef<OhlcvBar[]>([]);
  // Key to prevent re-initializing and overwriting active live simulation
  const loadedKeyRef = useRef<string>("");
  const tickCounterRef = useRef<number>(0);
  // Organic momentum tracking for smooth ₹1 to ₹4 gradual price movement
  const trendDirectionRef = useRef<number>(1);
  const trendRemainingStepsRef = useRef<number>(3);

  // Format seconds countdown helper (mm:ss)
  const formatCountdown = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // 1. Initialize Lightweight-Charts canvas with perfect alignment
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#64748b",
        fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif",
      },
      grid: {
        vertLines: { color: "#f8fafc" },
        horzLines: { color: "#f8fafc" },
      },
      crosshair: {
        mode: 1,
        vertLine: { color: "#0284c7", width: 1, style: 2 },
        horzLine: { color: "#0284c7", width: 1, style: 2 },
      },
      rightPriceScale: {
        borderColor: "#e2e8f0",
        scaleMargins: { top: 0.08, bottom: 0.22 },
        autoScale: true,
        alignLabels: true,
      },
      timeScale: {
        borderColor: "#e2e8f0",
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 12,
        barSpacing: 9,
        minBarSpacing: 3,
      },
    });

    // 1. Candlestick Series (Green / Red)
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#10b981",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
      priceFormat: { type: "price", precision: 2, minMove: 0.05 },
    });

    // 2. Line Series (Smooth vibrant blue overlay for "both" mode)
    const lineSeries = chart.addSeries(LineSeries, {
      color: "#0284c7",
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      priceFormat: { type: "price", precision: 2, minMove: 0.05 },
    });

    // 3. Area Series (Glow gradient for "line" mode)
    const areaSeries = chart.addSeries(AreaSeries, {
      topColor: "rgba(2, 132, 199, 0.3)",
      bottomColor: "rgba(2, 132, 199, 0.0)",
      lineColor: "#0284c7",
      lineWidth: 2,
      priceFormat: { type: "price", precision: 2, minMove: 0.05 },
    });

    // 4. Volume Series (Histogram at bottom 20% margin)
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: "#94a3b8",
      priceFormat: { type: "volume" },
      priceScaleId: "",
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries as any;
    lineSeriesRef.current = lineSeries as any;
    areaSeriesRef.current = areaSeries as any;
    volumeSeriesRef.current = volumeSeries as any;

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  // 2. Manage Series Visibility according to chartMode ("both", "candles", "line")
  useEffect(() => {
    if (
      !candleSeriesRef.current ||
      !lineSeriesRef.current ||
      !areaSeriesRef.current
    )
      return;

    if (chartMode === "both") {
      candleSeriesRef.current.applyOptions({ visible: true });
      lineSeriesRef.current.applyOptions({ visible: true });
      areaSeriesRef.current.applyOptions({ visible: false });
    } else if (chartMode === "candles") {
      candleSeriesRef.current.applyOptions({ visible: true });
      lineSeriesRef.current.applyOptions({ visible: false });
      areaSeriesRef.current.applyOptions({ visible: false });
    } else if (chartMode === "line") {
      candleSeriesRef.current.applyOptions({ visible: false });
      lineSeriesRef.current.applyOptions({ visible: false });
      areaSeriesRef.current.applyOptions({ visible: true });
    }
  }, [chartMode]);

  // 3. Load / Sync Baseline Data with localStorage Persistence
  // Ensures all new candles generated remain permanently stored in history
  useEffect(() => {
    if (
      !candleSeriesRef.current ||
      !lineSeriesRef.current ||
      !areaSeriesRef.current ||
      !volumeSeriesRef.current ||
      !chartRef.current
    )
      return;

    const currentKey = `${symbol}:${timeframe}`;
    if (loadedKeyRef.current === currentKey) return;

    // Check localStorage first so any previously formed candles remain as history
    const stored = loadStoredCandles(symbol, timeframe);
    let sourceBars: OhlcvBar[] = [];

    if (stored && stored.length > 0) {
      sourceBars = stored;
    } else {
      const rawBars = initialBars || data || [];
      const toTime = (t: number | string) => {
        const num = typeof t === "string" ? new Date(t).getTime() : t;
        return num > 1e11 ? Math.floor(num / 1000) : Number(num);
      };

      if (rawBars.length > 0) {
        const timeMap = new Map<number, OhlcvBar>();
        for (const b of rawBars) {
          const t = toTime(b.time);
          timeMap.set(t, { ...b, time: t });
        }
        sourceBars = Array.from(timeMap.entries())
          .sort(([t1], [t2]) => t1 - t2)
          .map(([, bar]) => bar);
      }

      if (sourceBars.length === 0) {
        sourceBars = generateFallbackBars(symbol, timeframe, 60);
      }

      // Save initial dataset to localStorage
      persistCandles(symbol, timeframe, sourceBars);
    }

    barsRef.current = sourceBars;
    loadedKeyRef.current = currentKey;

    const formattedCandles = sourceBars.map((d) => ({
      time: d.time as any,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    const formattedLine = sourceBars.map((d) => ({
      time: d.time as any,
      value: d.close,
    }));

    const formattedVolume = sourceBars.map((d) => ({
      time: d.time as any,
      value: d.volume,
      color:
        d.close >= d.open
          ? "rgba(16, 185, 129, 0.4)"
          : "rgba(239, 68, 68, 0.4)",
    }));

    candleSeriesRef.current.setData(formattedCandles);
    lineSeriesRef.current.setData(formattedLine);
    areaSeriesRef.current.setData(formattedLine);
    volumeSeriesRef.current.setData(formattedVolume);

    chartRef.current.timeScale().fitContent();
    setCountdown(intervalSeconds);
  }, [symbol, timeframe, initialBars, data, intervalSeconds]);

  // 4. Automated New Candle Generation Function
  const createNewCandle = useCallback(() => {
    if (!barsRef.current.length || !candleSeriesRef.current) return;
    const currentBars = barsRef.current;
    const lastBar = currentBars[currentBars.length - 1];

    const lastTime =
      typeof lastBar.time === "number"
        ? lastBar.time
        : Math.floor(Date.now() / 1000);
    const nextTime = lastTime + intervalSeconds;

    // The new candle opens at previous candle's close price
    const newBar: OhlcvBar = {
      time: nextTime,
      open: lastBar.close,
      high: lastBar.close,
      low: lastBar.close,
      close: lastBar.close,
      volume: Math.floor(10_000 + Math.random() * 30_000),
    };

    currentBars.push(newBar);

    candleSeriesRef.current.update(newBar as any);
    lineSeriesRef.current?.update({ time: newBar.time as any, value: newBar.close });
    areaSeriesRef.current?.update({ time: newBar.time as any, value: newBar.close });
    volumeSeriesRef.current?.update({
      time: newBar.time as any,
      value: newBar.volume,
      color: "rgba(16, 185, 129, 0.4)",
    });

    // Permanently store newly formed candle in history
    persistCandles(symbol, timeframe, currentBars);

    // Keep newly formed candle in view
    try {
      chartRef.current?.timeScale().scrollToPosition(3, false);
    } catch {
      // ignore
    }

    setCountdown(intervalSeconds);
  }, [intervalSeconds, symbol, timeframe]);

  // 5. Automated 10% Market Up and Down Fluctuation
  // Moves active candle dynamically between -10% and +10% of candle open
  useEffect(() => {
    const tickInterval = setInterval(() => {
      if (!barsRef.current.length || !candleSeriesRef.current) return;
      const currentBars = barsRef.current;
      const lastIdx = currentBars.length - 1;
      const bar = { ...currentBars[lastIdx] };

      // Anchor 10% bounds around the current candle's open price
      const candleOpen = bar.open;
      const maxAllowed = Number((candleOpen * 1.10).toFixed(2)); // +10% max boundary
      const minAllowed = Number((candleOpen * 0.90).toFixed(2)); // -10% min boundary

      // Organic momentum: trend gently persists for 2 to 5 ticks so the stock breathes naturally
      trendRemainingStepsRef.current -= 1;
      if (trendRemainingStepsRef.current <= 0) {
        if (bar.close >= maxAllowed - 10) {
          trendDirectionRef.current = -1;
        } else if (bar.close <= minAllowed + 10) {
          trendDirectionRef.current = 1;
        } else {
          trendDirectionRef.current = Math.random() < 0.5 ? 1 : -1;
        }
        trendRemainingStepsRef.current = Math.floor(2 + Math.random() * 4);
      }

      // Smooth realistic movement: shifts by ₹0.80 to ₹3.60 (average ₹1 to ₹3, max ~₹4)
      const stepDeltaRupees = Number((0.80 + Math.random() * 2.80).toFixed(2));
      let nextPrice = Number((bar.close + trendDirectionRef.current * stepDeltaRupees).toFixed(2));

      // Clamp strictly within +/-10% of candle open
      nextPrice = Math.max(minAllowed, Math.min(maxAllowed, nextPrice));
      nextPrice = Number(nextPrice.toFixed(2));

      bar.close = nextPrice;
      bar.high = Number(Math.max(bar.high, nextPrice).toFixed(2));
      bar.low = Number(Math.min(bar.low, nextPrice).toFixed(2));
      bar.volume += Math.floor(80 + Math.random() * 250);

      currentBars[lastIdx] = bar;

      // Update lightweight charts series in place
      candleSeriesRef.current.update(bar as any);
      lineSeriesRef.current?.update({
        time: bar.time as any,
        value: bar.close,
      });
      areaSeriesRef.current?.update({
        time: bar.time as any,
        value: bar.close,
      });
      volumeSeriesRef.current?.update({
        time: bar.time as any,
        value: bar.volume,
        color:
          bar.close >= bar.open
            ? "rgba(16, 185, 129, 0.4)"
            : "rgba(239, 68, 68, 0.4)",
      });

      // Periodically persist active candle state to history storage
      tickCounterRef.current += 1;
      if (tickCounterRef.current % 5 === 0) {
        persistCandles(symbol, timeframe, currentBars);
      }

      // Synchronize live market quote with parent page
      if (onPriceUpdate) {
        const firstBar = currentBars[0] || bar;
        const change = Number((bar.close - firstBar.open).toFixed(2));
        const changePercent = Number(((change / firstBar.open) * 100).toFixed(2));
        onPriceUpdate({
          price: bar.close,
          change,
          changePercent,
          high: bar.high,
          low: bar.low,
          open: bar.open,
          volume: bar.volume,
        });
      }
    }, 1000);

    return () => clearInterval(tickInterval);
  }, [onPriceUpdate, symbol, timeframe]);

  // 6. Automated Timeframe Countdown (1m = 60s, 3m = 180s, 5m = 300s)
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Automated new candle creation at the exact interval
          createNewCandle();
          return intervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [intervalSeconds, createNewCandle]);

  return (
    <div className="flex flex-col w-full h-full rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
      {/* Chart Top Control Header */}
      <div className="flex-none px-4 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand Logo + Title + OHLCV Tag + Chart View Toggle */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2">
            <span className="font-display font-extrabold text-slate-900 text-sm sm:text-base">
              {symbol} Chart
            </span>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
              OHLCV
            </span>
          </div>

          {/* Graph / Candle / Both Selector */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100/90 p-0.5 border border-slate-200/60">
            <button
              onClick={() => setChartMode("both")}
              title="Show Candlesticks and Line Graph simultaneously"
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                chartMode === "both"
                  ? "bg-sky-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Both</span>
            </button>
            <button
              onClick={() => setChartMode("candles")}
              title="Show Candlestick chart only"
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                chartMode === "candles"
                  ? "bg-slate-950 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              <BarChart2 className="h-3.5 w-3.5" />
              <span>Candles</span>
            </button>
            <button
              onClick={() => setChartMode("line")}
              title="Show Line / Area Graph only"
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                chartMode === "line"
                  ? "bg-slate-950 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Graph</span>
            </button>
          </div>
        </div>

        {/* Right: Automated Countdown + Timeframe Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Automated Candle Interval Countdown Indicator */}
          <div className="flex items-center gap-1.5 rounded-xl bg-slate-50 border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
            <Clock className="h-3.5 w-3.5 text-sky-600 animate-pulse" />
            <span className="text-slate-500 font-medium">{activeTfConfig.label} Candle:</span>
            <span className="font-mono-num font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200/80">
              {formatCountdown(countdown)}
            </span>
          </div>

          {/* Timeframe Selector Pills (1m, 3m, 5m, 15m, 1D, 1W) */}
          <div className="flex items-center gap-0.5 rounded-xl bg-slate-100 p-0.5 border border-slate-200/50">
            {TIMEFRAME_CONFIGS.map((tf) => (
              <button
                key={tf.value}
                onClick={() => onTimeframeChange?.(tf.value)}
                className={`rounded-lg px-2 py-1 text-xs font-bold transition-all ${
                  timeframe === tf.value
                    ? "bg-slate-950 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Canvas Area: min-h-0 ensures clean flex sizing without leaking */}
      <div className="relative flex-1 w-full min-h-0 bg-white">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-xs">
            <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  );
}
