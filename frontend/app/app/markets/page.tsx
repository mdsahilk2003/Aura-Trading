"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search, TrendingUp, TrendingDown, ArrowUpRight, BarChart2, Compass } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PriceChange } from "@/components/ui/price-change";
import { Input } from "@/components/ui/input";
import { marketsService } from "@/services/markets";

export default function MarketsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: marketsData, isLoading: loadingMarkets } = useQuery({
    queryKey: ["markets", "list"],
    queryFn: marketsService.list,
  });

  const { data: indicesData } = useQuery({
    queryKey: ["markets", "indices"],
    queryFn: marketsService.indices,
  });

  const { data: moversData } = useQuery({
    queryKey: ["markets", "movers"],
    queryFn: marketsService.movers,
  });

  const instruments = marketsData?.instruments ?? [];
  const filteredInstruments = searchQuery
    ? instruments.filter(
        (inst) =>
          inst.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inst.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : instruments;

  return (
    <AppShell>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-950">
              Markets & Instruments
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Explore equities, benchmark indices, top gainers, and market movers
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search symbol or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs bg-white"
            />
          </div>
        </div>

        {/* Benchmark Indices Row */}
        {indicesData?.indices && indicesData.indices.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {indicesData.indices.map((idx) => (
              <div
                key={idx.symbol}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-xs transition-shadow"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>{idx.symbol}</span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 font-semibold">
                    INDEX
                  </span>
                </div>
                <p className="font-mono-num font-extrabold text-lg text-slate-900 mb-1">
                  ₹{idx.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
                <PriceChange change={idx.change} changePercent={idx.changePercent} />
              </div>
            ))}
          </div>
        )}

        {/* Top Gainers & Losers Row */}
        {moversData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Top Gainers */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <h3 className="font-display text-sm font-bold text-slate-900">Top Market Gainers</h3>
              </div>
              <div className="space-y-2">
                {moversData.gainers.slice(0, 4).map((g) => (
                  <Link
                    key={g.symbol}
                    href={`/app/markets/${g.symbol}`}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <span className="text-xs font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                      {g.symbol}
                    </span>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-900 font-mono-num">₹{g.price.toFixed(2)}</p>
                      <PriceChange change={g.change} changePercent={g.changePercent} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Top Losers */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3">
                <TrendingDown className="h-4 w-4 text-rose-600" />
                <h3 className="font-display text-sm font-bold text-slate-900">Top Market Losers</h3>
              </div>
              <div className="space-y-2">
                {moversData.losers.slice(0, 4).map((l) => (
                  <Link
                    key={l.symbol}
                    href={`/app/markets/${l.symbol}`}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <span className="text-xs font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                      {l.symbol}
                    </span>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-900 font-mono-num">₹{l.price.toFixed(2)}</p>
                      <PriceChange change={l.change} changePercent={l.changePercent} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* All Instruments Grid Table */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-sky-600" />
              <h3 className="font-display text-sm font-bold text-slate-900">
                All Instruments ({filteredInstruments.length})
              </h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="pb-3">Symbol & Company</th>
                  <th className="pb-3">Exchange</th>
                  <th className="pb-3 text-right">LTP (₹)</th>
                  <th className="pb-3 text-right">Change</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {loadingMarkets ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      Loading market instruments...
                    </td>
                  </tr>
                ) : filteredInstruments.length > 0 ? (
                  filteredInstruments.map((inst) => (
                    <tr key={inst.id || inst.symbol} className="hover:bg-slate-50 group">
                      <td className="py-3">
                        <Link href={`/app/markets/${inst.symbol}`} className="block">
                          <p className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                            {inst.symbol}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate max-w-[200px]">{inst.name}</p>
                        </Link>
                      </td>
                      <td className="py-3">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          {inst.exchange || "NSE"}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono-num font-bold text-slate-900">
                        ₹{(inst.quote?.price ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 text-right">
                        {inst.quote ? (
                          <PriceChange change={inst.quote.change} changePercent={inst.quote.changePercent} />
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <Link href={`/app/markets/${inst.symbol}`}>
                          <button className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-950 hover:text-white transition-colors">
                            Trade
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No instruments matching search query "{searchQuery}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
