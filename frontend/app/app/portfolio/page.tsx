"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Wallet, TrendingUp, Layers, PlusCircle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/ui/stat-card";
import { PnlBadge } from "@/components/ui/pnl-badge";
import { PriceChange } from "@/components/ui/price-change";
import { AddMoneyModal } from "@/components/funds/AddMoneyModal";
import { portfolioService } from "@/services/portfolio";
import { Button } from "@/components/ui/button";

export default function PortfolioPage() {
  const [tab, setTab] = useState<"holdings" | "positions">("holdings");
  const [addMoneyOpen, setAddMoneyOpen] = useState(false);

  const { data: portfolio, isLoading: loadingPortfolio } = useQuery({
    queryKey: ["portfolio"],
    queryFn: portfolioService.getPortfolio,
    refetchInterval: 3000,
  });

  const { data: holdings = [], isLoading: loadingHoldings } = useQuery({
    queryKey: ["portfolio", "holdings"],
    queryFn: portfolioService.getHoldings,
    refetchInterval: 3000,
  });

  const { data: positions = [], isLoading: loadingPositions } = useQuery({
    queryKey: ["portfolio", "positions"],
    queryFn: portfolioService.getPositions,
    refetchInterval: 3000,
  });

  return (
    <AppShell>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-950">
              Portfolio Holdings & Positions
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Real-time evaluation of long-term holdings and active intraday positions
            </p>
          </div>
          <Button
            onClick={() => setAddMoneyOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Money to Wallet</span>
          </Button>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Value"
            value={portfolio?.totalValue ?? 0}
            format="currency"
            icon={PieChart}
            isLoading={loadingPortfolio}
          />
          <StatCard
            title="Invested Capital"
            value={portfolio?.invested ?? 0}
            format="currency"
            icon={Wallet}
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
            title="Overall P&L"
            value={portfolio?.overallPnl ?? 0}
            format="currency"
            badge={
              portfolio ? (
                <PnlBadge
                  amount={portfolio.overallPnl}
                  percentage={portfolio.overallPnlPercent}
                />
              ) : undefined
            }
            icon={Layers}
            isLoading={loadingPortfolio}
          />
        </div>

        {/* Portfolio Asset Allocation Visualizer */}
        {holdings.length > 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-sky-600" />
                <h3 className="font-display text-sm font-bold text-slate-900">Asset Allocation Breakdown</h3>
              </div>
              <span className="text-xs text-slate-500 font-mono-num font-bold">
                {holdings.length} Active Stock{holdings.length > 1 ? "s" : ""}
              </span>
            </div>

            {/* Proportional Distribution Bar */}
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 flex">
              {holdings.map((h, i) => {
                const totalVal = portfolio?.currentValue || 1;
                const pct = Math.max(3, Math.round((h.currentValue / totalVal) * 100));
                const colors = [
                  "bg-sky-500",
                  "bg-emerald-500",
                  "bg-purple-500",
                  "bg-amber-500",
                  "bg-indigo-500",
                  "bg-rose-500",
                ];
                return (
                  <div
                    key={h.symbol}
                    style={{ width: `${pct}%` }}
                    className={`h-full ${colors[i % colors.length]} transition-all`}
                    title={`${h.symbol}: ${pct}%`}
                  />
                );
              })}
            </div>

            {/* Legend Pills */}
            <div className="flex flex-wrap gap-3 pt-1">
              {holdings.map((h, i) => {
                const totalVal = portfolio?.currentValue || 1;
                const pct = totalVal ? ((h.currentValue / totalVal) * 100).toFixed(1) : "0.0";
                const dotColors = [
                  "bg-sky-500",
                  "bg-emerald-500",
                  "bg-purple-500",
                  "bg-amber-500",
                  "bg-indigo-500",
                  "bg-rose-500",
                ];
                return (
                  <div key={h.symbol} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5 border border-slate-100 text-xs">
                    <span className={`h-2.5 w-2.5 rounded-full ${dotColors[i % dotColors.length]}`} />
                    <span className="font-bold text-slate-800">{h.symbol}</span>
                    <span className="text-slate-400 font-mono-num text-[11px]">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Holdings / Positions Tab Switcher */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex gap-2 rounded-xl bg-slate-100 p-1">
              <button
                onClick={() => setTab("holdings")}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                  tab === "holdings"
                    ? "bg-slate-950 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Holdings ({holdings.length})
              </button>
              <button
                onClick={() => setTab("positions")}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                  tab === "positions"
                    ? "bg-slate-950 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Positions ({positions.length})
              </button>
            </div>
          </div>

          {/* Table */}
          {tab === "holdings" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="pb-3">Instrument</th>
                    <th className="pb-3 text-right">Quantity</th>
                    <th className="pb-3 text-right">Avg Price</th>
                    <th className="pb-3 text-right">LTP</th>
                    <th className="pb-3 text-right">Current Value</th>
                    <th className="pb-3 text-right">Total P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {loadingHoldings ? (
                    <tr><td colSpan={6} className="py-12 text-center text-slate-400">Loading holdings...</td></tr>
                  ) : holdings.length > 0 ? (
                    holdings.map((h) => (
                      <tr key={h.symbol} className="hover:bg-slate-50">
                        <td className="py-3 font-bold text-slate-900">
                          <Link href={`/app/markets/${h.symbol}`} className="hover:text-sky-600">
                            {h.symbol}
                          </Link>
                        </td>
                        <td className="py-3 text-right font-mono-num">{h.quantity}</td>
                        <td className="py-3 text-right font-mono-num">₹{h.averagePrice.toFixed(2)}</td>
                        <td className="py-3 text-right font-mono-num">₹{h.currentPrice.toFixed(2)}</td>
                        <td className="py-3 text-right font-mono-num font-bold text-slate-900">
                          ₹{h.currentValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 text-right font-mono-num">
                          <PnlBadge amount={h.pnl} percentage={h.pnlPercent} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center space-y-3 py-4">
                          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                            <PieChart className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">No portfolio holdings found</p>
                            <p className="text-xs text-slate-500 mt-0.5">Explore live market prices and buy stocks to start building your portfolio!</p>
                          </div>
                          <Link href="/app/markets">
                            <Button className="bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs h-9 px-4 rounded-xl mt-1">
                              Explore Markets to Buy Stocks
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="pb-3">Symbol</th>
                    <th className="pb-3">Side</th>
                    <th className="pb-3 text-right">Quantity</th>
                    <th className="pb-3 text-right">Avg Price</th>
                    <th className="pb-3 text-right">LTP</th>
                    <th className="pb-3 text-right">P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {loadingPositions ? (
                    <tr><td colSpan={6} className="py-12 text-center text-slate-400">Loading open positions...</td></tr>
                  ) : positions.length > 0 ? (
                    positions.map((p) => (
                      <tr key={p.symbol} className="hover:bg-slate-50">
                        <td className="py-3 font-bold text-slate-900">{p.symbol}</td>
                        <td className="py-3">
                          <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${p.side === "BUY" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                            {p.side}
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono-num">{p.quantity}</td>
                        <td className="py-3 text-right font-mono-num">₹{p.averagePrice.toFixed(2)}</td>
                        <td className="py-3 text-right font-mono-num">₹{p.currentPrice.toFixed(2)}</td>
                        <td className="py-3 text-right font-mono-num">
                          <PnlBadge amount={p.pnl} percentage={p.pnlPercent} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No open positions active.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Money Modal */}
        <AddMoneyModal
          open={addMoneyOpen}
          onClose={() => setAddMoneyOpen(false)}
        />
      </div>
    </AppShell>
  );
}
