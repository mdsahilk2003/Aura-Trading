"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Wallet,
  TrendingUp,
  PieChart,
  ClipboardList,
  ArrowRight,
  Bookmark,
  Plus,
  Compass,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/ui/stat-card";
import { PnlBadge } from "@/components/ui/pnl-badge";
import { PriceChange } from "@/components/ui/price-change";
import { portfolioService } from "@/services/portfolio";
import { ordersService } from "@/services/orders";
import { watchlistService } from "@/services/watchlist";
import { marketsService } from "@/services/markets";
import { useAuth } from "@/providers/auth-provider";

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: portfolio, isLoading: loadingPortfolio } = useQuery({
    queryKey: ["portfolio"],
    queryFn: portfolioService.getPortfolio,
  });

  const { data: ordersData, isLoading: loadingOrders } = useQuery({
    queryKey: ["orders", { limit: 5 }],
    queryFn: () => ordersService.getOrders({ limit: 5 }),
  });

  const { data: watchlist = [], isLoading: loadingWatchlist } = useQuery({
    queryKey: ["watchlist"],
    queryFn: watchlistService.getWatchlist,
  });

  const { data: indicesData } = useQuery({
    queryKey: ["markets", "indices"],
    queryFn: marketsService.indices,
  });

  const orders = ordersData?.orders ?? [];

  return (
    <AppShell>
      <div className="space-y-6">
        
        {/* Top Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-950">
                Welcome back, {user?.name || "Trader"}
              </h1>
              <span className="rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                DEMO / PAPER
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Live market feed connected • {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "short", day: "numeric" })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/app/markets">
              <button className="flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-colors">
                <Compass className="h-4 w-4" />
                <span>Trade Markets</span>
              </button>
            </Link>
          </div>
        </div>

        {/* 4 Primary Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Portfolio Value"
            value={portfolio?.totalValue ?? 0}
            format="currency"
            icon={PieChart}
            isLoading={loadingPortfolio}
          />
          <StatCard
            title="Today's P&L"
            value={portfolio?.todaysPnl ?? 0}
            format="currency"
            badge={
              portfolio ? (
                <PnlBadge
                  amount={portfolio.todaysPnl}
                  percentage={portfolio.todaysPnlPercent}
                />
              ) : undefined
            }
            icon={TrendingUp}
            isLoading={loadingPortfolio}
          />
          <StatCard
            title="Available Funds"
            value={portfolio?.availableFunds ?? 0}
            format="currency"
            icon={Wallet}
            isLoading={loadingPortfolio}
          />
          <StatCard
            title="Open Positions"
            value={portfolio?.openPositions ?? 0}
            format="number"
            icon={ClipboardList}
            isLoading={loadingPortfolio}
          />
        </div>

        {/* Indices Ticker Row */}
        {indicesData?.indices && indicesData.indices.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {indicesData.indices.map((idx) => (
              <div
                key={idx.symbol}
                className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>{idx.symbol}</span>
                  <PriceChange change={idx.change} changePercent={idx.changePercent} />
                </div>
                <p className="font-mono-num font-extrabold text-sm text-slate-900">
                  ₹{idx.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Grid: Watchlist + Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Watchlist Summary Card */}
          <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Bookmark className="h-4 w-4 text-sky-600" />
                  <h3 className="font-display text-sm font-bold text-slate-900">Your Watchlist</h3>
                </div>
                <Link href="/app/watchlist" className="text-xs font-semibold text-sky-600 hover:underline">
                  Manage
                </Link>
              </div>

              <div className="space-y-2">
                {loadingWatchlist ? (
                  <p className="text-xs text-slate-400 py-6 text-center">Loading watchlist...</p>
                ) : watchlist.length > 0 ? (
                  watchlist.slice(0, 5).map((item) => (
                    <Link
                      key={item.symbol}
                      href={`/app/markets/${item.symbol}`}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                          {item.symbol}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate max-w-[140px]">{item.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-900 font-mono-num">
                          ₹{item.quote.price.toFixed(2)}
                        </p>
                        <PriceChange change={item.quote.change} changePercent={item.quote.changePercent} />
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-xs text-slate-500">No instruments added yet.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <Link
                href="/app/markets"
                className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Plus className="h-4 w-4 text-slate-400" />
                <span>Add Instruments to Watchlist</span>
              </Link>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-sky-600" />
                <h3 className="font-display text-sm font-bold text-slate-900">Recent Orders</h3>
              </div>
              <Link href="/app/orders" className="text-xs font-semibold text-sky-600 hover:underline">
                View All Orders
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="pb-2.5">Symbol</th>
                    <th className="pb-2.5">Side</th>
                    <th className="pb-2.5 text-right">Qty</th>
                    <th className="pb-2.5 text-right">Price</th>
                    <th className="pb-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {loadingOrders ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">Loading recent orders...</td>
                    </tr>
                  ) : orders.length > 0 ? (
                    orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50">
                        <td className="py-3 font-bold text-slate-900">{ord.symbol}</td>
                        <td className="py-3">
                          <span
                            className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${
                              ord.side === "BUY"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {ord.side}
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono-num">{ord.quantity}</td>
                        <td className="py-3 text-right font-mono-num">
                          ₹{(ord.averagePrice || ord.price || 0).toFixed(2)}
                        </td>
                        <td className="py-3 text-right">
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                            {ord.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No orders placed yet. Trade your first market position!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </AppShell>
  );
}
