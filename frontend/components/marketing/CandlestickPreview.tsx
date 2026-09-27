"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import { marketsService } from "@/services/markets";
import type { ChartTimeframe, OhlcvBar, QuoteDto } from "@aura/shared";

interface CandlestickPreviewProps {
  symbol?: string;
}

export function CandlestickPreview({ symbol = "RELIANCE" }: CandlestickPreviewProps) {
  const [selectedTf, setSelectedTf] = useState<ChartTimeframe>("1D");
  const [bars, setBars] = useState<OhlcvBar[]>([]);
  const [quote, setQuote] = useState<QuoteDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [historyData, symbolData] = await Promise.all([
          marketsService.history(symbol, selectedTf),
          marketsService.getSymbol(symbol),
        ]);
        if (isMounted) {
          if (historyData && historyData.bars) {
            setBars(historyData.bars.slice(-10));
          }
          if (symbolData && symbolData.quote) {
            setQuote(symbolData.quote);
          }
        }
      } catch {
        // Handle error gracefully
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [symbol, selectedTf]);

  const prices = bars.flatMap((b) => [b.open, b.high, b.low, b.close]);
  const minPrice = prices.length ? Math.min(...prices) * 0.998 : 2400;
  const maxPrice = prices.length ? Math.max(...prices) * 1.002 : 2600;
  const range = maxPrice - minPrice || 1;

  const currentPrice = quote?.price ?? (bars.length ? bars[bars.length - 1].close : 2525.0);
  const change = quote?.change ?? 75.0;
  const changePercent = quote?.changePercent ?? 3.06;
  const isUp = change >= 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-display font-bold text-slate-900 text-sm">{symbol} / INR</h4>
            <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold text-sky-800 flex items-center gap-1">
              {loading && <RefreshCw className="h-2.5 w-2.5 animate-spin" />}
              {quote?.mode || "LIVE"}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono-num font-extrabold text-slate-900 text-base">
              ₹{currentPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
            <span
              className={`inline-flex items-center text-xs font-bold ${
                isUp ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {isUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {isUp ? "+" : ""}
              {change.toFixed(2)} ({isUp ? "+" : ""}
              {changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Timeframes */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          {(["1D", "1W", "1M", "1Y"] as ChartTimeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setSelectedTf(tf)}
              className={`px-2 py-0.5 text-[11px] font-bold rounded ${
                selectedTf === tf ? "bg-slate-950 text-white" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Realistic Candlestick Visual Chart Container */}
      <div className="relative h-48 sm:h-60 w-full flex items-end justify-between gap-1.5 px-2 pt-6 pb-2 bg-slate-50/50 rounded-xl border border-slate-100">
        <svg className="absolute inset-0 h-full w-full pointer-events-none stroke-sky-500 stroke-[2] fill-none opacity-60">
          <path d="M 10 140 Q 60 120, 110 110 T 210 80 T 310 50 T 410 30" />
        </svg>

        {bars.map((bar, idx) => {
          const barUp = bar.close >= bar.open;
          const openY = ((bar.open - minPrice) / range) * 100;
          const closeY = ((bar.close - minPrice) / range) * 100;
          const highY = ((bar.high - minPrice) / range) * 100;
          const lowY = ((bar.low - minPrice) / range) * 100;

          const bodyBottom = Math.min(openY, closeY);
          const bodyHeight = Math.max(Math.abs(closeY - openY), 2);

          return (
            <div key={idx} className="relative flex-1 flex flex-col items-center h-full justify-end group">
              <div className="relative w-full flex justify-center h-full">
                <div
                  className={`absolute w-[2px] ${barUp ? "bg-emerald-500" : "bg-rose-500"}`}
                  style={{
                    bottom: `${Math.max(0, Math.min(100, lowY))}%`,
                    height: `${Math.max(2, Math.min(100, highY - lowY))}%`,
                  }}
                />
                <div
                  className={`absolute w-3 sm:w-4 rounded-xs transition-all ${
                    barUp ? "bg-emerald-500 group-hover:bg-emerald-400" : "bg-rose-500 group-hover:bg-rose-400"
                  }`}
                  style={{
                    bottom: `${Math.max(0, Math.min(100, bodyBottom))}%`,
                    height: `${Math.max(2, Math.min(100, bodyHeight))}%`,
                  }}
                />
              </div>

              <div
                className={`w-full max-w-[10px] rounded-t-xs mt-2 ${
                  barUp ? "bg-emerald-200" : "bg-rose-200"
                }`}
                style={{ height: `${Math.min(40, Math.max(4, (bar.volume / 50000) * 40))}px` }}
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-2 px-1">
        <span>09:15 AM</span>
        <span>12:15 PM</span>
        <span>03:30 PM</span>
      </div>
    </div>
  );
}
