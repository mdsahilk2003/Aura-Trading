"use client";

import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Trash2, ArrowRight, Plus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PriceChange } from "@/components/ui/price-change";
import { watchlistService } from "@/services/watchlist";

export default function WatchlistPage() {
  const queryClient = useQueryClient();

  const { data: watchlist = [], isLoading } = useQuery({
    queryKey: ["watchlist"],
    queryFn: watchlistService.getWatchlist,
  });

  const removeMutation = useMutation({
    mutationFn: (symbol: string) => watchlistService.removeSymbol(symbol),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });

  return (
    <AppShell>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-950">
              Personal Watchlist
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Customized list of instruments tracked in real-time via Socket stream
            </p>
          </div>

          <Link href="/app/markets">
            <button className="flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-colors">
              <Plus className="h-4 w-4" />
              <span>Add Symbols</span>
            </button>
          </Link>
        </div>

        {/* Watchlist Cards Grid */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
          {isLoading ? (
            <p className="py-12 text-center text-xs text-slate-400">Loading watchlist...</p>
          ) : watchlist.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {watchlist.map((item) => (
                <div
                  key={item.symbol}
                  className="rounded-2xl border border-slate-200/80 bg-white p-4 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Link
                          href={`/app/markets/${item.symbol}`}
                          className="font-display font-bold text-slate-900 text-sm group-hover:text-sky-600 transition-colors"
                        >
                          {item.symbol}
                        </Link>
                        <p className="text-[11px] text-slate-500 truncate max-w-[180px]">{item.name}</p>
                      </div>

                      <button
                        onClick={() => removeMutation.mutate(item.symbol)}
                        className="text-slate-300 hover:text-rose-600 p-1 transition-colors"
                        title="Remove from watchlist"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="my-3 border-t border-slate-100 pt-3 flex items-center justify-between">
                      <span className="font-mono-num font-extrabold text-lg text-slate-900">
                        ₹{item.quote.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                      <PriceChange change={item.quote.change} changePercent={item.quote.changePercent} />
                    </div>
                  </div>

                  <Link href={`/app/markets/${item.symbol}`}>
                    <button className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-950 hover:text-white transition-colors mt-2">
                      <span>Trade Instrument</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 mx-auto">
                <Bookmark className="h-6 w-6" />
              </div>
              <p className="font-display font-bold text-slate-800 text-sm">Your watchlist is currently empty</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Search instruments from the Markets page and click "Add Watchlist" to track prices here.
              </p>
              <div className="pt-2">
                <Link href="/app/markets">
                  <button className="rounded-xl bg-slate-950 px-5 py-2 text-xs font-bold text-white">
                    Explore Markets
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>

      </div>
    </AppShell>
  );
}
