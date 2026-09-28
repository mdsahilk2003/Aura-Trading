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
                        No portfolio holdings found. Buy shares from the Markets page!
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
