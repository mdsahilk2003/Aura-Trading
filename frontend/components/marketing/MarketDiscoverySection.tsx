"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Compass, TrendingUp } from "lucide-react";
import { PriceChange } from "@/components/ui/price-change";
import { marketsService } from "@/services/markets";
import type { QuoteDto } from "@aura/shared";

export function MarketDiscoverySection() {
  const [indices, setIndices] = useState<QuoteDto[]>([]);
  const [gainers, setGainers] = useState<QuoteDto[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      try {
        const [indicesData, moversData] = await Promise.all([
          marketsService.indices(),
          marketsService.movers(),
        ]);
        if (isMounted) {
          if (indicesData && indicesData.indices) {
            setIndices(indicesData.indices);
          }
          if (moversData && moversData.gainers) {
            setGainers(moversData.gainers);
          }
        }
      } catch {
        // Fallback gracefully if backend is offline during initial load
      }
    }
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const displayIndices = indices.length
    ? indices
    : [
        { symbol: "NIFTY 50", price: 24320.5, change: 185.3, changePercent: 0.77, open: 24200, high: 24400, low: 24150, previousClose: 24135.2, volume: 1000, timestamp: "", mode: "LIVE" as const },
        { symbol: "SENSEX", price: 79890.15, change: 540.2, changePercent: 0.68, open: 79400, high: 80000, low: 79300, previousClose: 79349.95, volume: 1000, timestamp: "", mode: "LIVE" as const },
        { symbol: "BANK NIFTY", price: 52110.8, change: -120.4, changePercent: -0.23, open: 52300, high: 52400, low: 52000, previousClose: 52231.2, volume: 1000, timestamp: "", mode: "LIVE" as const },
      ];

  const displayGainers = gainers.length
    ? gainers
    : [
        { symbol: "RELIANCE", price: 2525.0, change: 75.0, changePercent: 3.06, open: 2450, high: 2530, low: 2445, previousClose: 2450, volume: 36500, timestamp: "", mode: "LIVE" as const },
        { symbol: "TCS", price: 4210.5, change: 100.5, changePercent: 2.45, open: 4110, high: 4230, low: 4100, previousClose: 4110, volume: 20000, timestamp: "", mode: "LIVE" as const },
        { symbol: "INFY", price: 1890.2, change: 38.9, changePercent: 2.1, open: 1850, high: 1900, low: 1845, previousClose: 1851.3, volume: 15000, timestamp: "", mode: "LIVE" as const },
        { symbol: "ICICIBANK", price: 1240.0, change: 22.5, changePercent: 1.85, open: 1218, high: 1245, low: 1215, previousClose: 1217.5, volume: 18000, timestamp: "", mode: "LIVE" as const },
      ];

  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 via-sky-50/50 to-indigo-50/30 border-y border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 mb-3">
            <Compass className="h-3.5 w-3.5 text-sky-600" />
            <span>MARKET DISCOVERY</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-950">
            Real-Time Intelligence Across All Markets
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 font-medium">
            Monitor Indian & Global benchmark indices, sector heatmaps, top gainers, and high-volume movers in real time.
          </p>
        </div>

        {/* Index Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {displayIndices.map((idx) => (
            <div
              key={idx.symbol}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-display font-bold text-slate-900 text-sm">{idx.symbol}</span>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                  {idx.mode || "LIVE"}
                </span>
              </div>
              <p className="font-mono-num text-xl font-extrabold text-slate-950 mb-2">
                ₹{idx.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
              <PriceChange change={idx.change} changePercent={idx.changePercent} />
            </div>
          ))}
        </div>

        {/* Top Gainers Showcase */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <h3 className="font-display text-base font-bold text-slate-900">Today's Top Market Gainers</h3>
            </div>
            <Link
              href="/markets"
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              <span>Explore All Markets</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayGainers.map((stk) => (
              <Link
                key={stk.symbol}
                href={`/markets/${stk.symbol}`}
                className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 hover:bg-slate-100/80 hover:border-slate-200 transition-all group"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 group-hover:text-sky-600 transition-colors">
                      {stk.symbol}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate max-w-[130px]">{stk.symbol} EQ</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                    +{stk.changePercent.toFixed(2)}%
                  </span>
                </div>
                <p className="font-mono-num text-sm font-bold text-slate-900">
                  ₹{stk.price.toFixed(2)}
                </p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
