"use client";

import { useEffect, useRef } from "react";
import type { ChartTimeframe, OhlcvBar } from "@aura/shared";
import {
  createChart,
  ColorType,
  CandlestickSeries,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
} from "lightweight-charts";
import { Loader2 } from "lucide-react";

interface CandlestickChartProps {
  symbol: string;
  data: OhlcvBar[];
  timeframe: ChartTimeframe;
  onTimeframeChange?: (tf: ChartTimeframe) => void;
  isLoading?: boolean;
}

const TIMEFRAMES: ChartTimeframe[] = ["1D", "1W", "1M", "3M", "6M", "1Y", "5Y"];

export function CandlestickChart({
  symbol,
  data,
  timeframe,
  onTimeframeChange,
  isLoading = false,
}: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const isInitialFitDone = useRef(false);
  const currentSymbolRef = useRef(symbol);
  const currentTimeframeRef = useRef(timeframe);

  if (currentSymbolRef.current !== symbol || currentTimeframeRef.current !== timeframe) {
    currentSymbolRef.current = symbol;
    currentTimeframeRef.current = timeframe;
    isInitialFitDone.current = false;
  }

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#64748b",
        fontFamily: "'Outfit', sans-serif",
      },
      grid: {
        vertLines: { color: "#f1f5f9" },
        horzLines: { color: "#f1f5f9" },
      },
      crosshair: {
        mode: 1,
        vertLine: { color: "#0284c7", width: 1, style: 2 },
        horzLine: { color: "#0284c7", width: 1, style: 2 },
      },
      rightPriceScale: {
        borderColor: "#e2e8f0",
        scaleMargins: { top: 0.1, bottom: 0.25 },
        autoScale: true,
      },
      timeScale: {
        borderColor: "#e2e8f0",
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 5,
        barSpacing: 8,
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#10b981",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
      priceFormat: { type: "price", precision: 2, minMove: 0.05 },
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: "#94a3b8",
      priceFormat: { type: "volume" },
      priceScaleId: "",
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.75, bottom: 0 },
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries as any;
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

  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || !data.length) return;

    const toTime = (t: number) => (t > 1e11 ? Math.floor(t / 1000) : t);

    // Deduplicate & sort timestamps in ascending order for Lightweight-Charts
    const timeMap = new Map<number, OhlcvBar>();
    for (const b of data) {
      timeMap.set(toTime(b.time), b);
    }
    const sorted = Array.from(timeMap.entries()).sort(([t1], [t2]) => t1 - t2);

    const formattedCandles = sorted.map(([time, d]) => ({
      time: time as any,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    const formattedVolume = sorted.map(([time, d]) => ({
      time: time as any,
      value: d.volume,
      color: d.close >= d.open ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.4)",
    }));

    candleSeriesRef.current.setData(formattedCandles);
    volumeSeriesRef.current.setData(formattedVolume);

    if (chartRef.current && !isInitialFitDone.current) {
      chartRef.current.timeScale().fitContent();
      isInitialFitDone.current = true;
    }
  }, [data]);

  return (
    <div className="flex flex-col w-full h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
      {/* Chart Top Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-slate-900 text-sm sm:text-base">
            {symbol} Candlestick Chart
          </span>
          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
            OHLCV
          </span>
        </div>

        {/* Timeframe Selector Pills */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange?.(tf)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                timeframe === tf
                  ? "bg-slate-950 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative flex-1 min-h-[320px] sm:min-h-[420px] w-full">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-xs">
            <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  );
}
