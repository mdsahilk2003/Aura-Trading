"use client";

import { PieChart as PieIcon, TrendingUp, DollarSign, Layers } from "lucide-react";
import { PnlBadge } from "@/components/ui/pnl-badge";

export function PortfolioPreviewSection() {
  const sampleHoldings = [
    { symbol: "RELIANCE", qty: 25, avgPrice: 2450.00, curPrice: 2525.00, pnl: 1875.00, pnlPercent: 3.06 },
    { symbol: "TCS", qty: 10, avgPrice: 4110.00, curPrice: 4210.50, pnl: 1005.00, pnlPercent: 2.45 },
    { symbol: "INFY", qty: 40, avgPrice: 1850.00, curPrice: 1890.20, pnl: 1608.00, pnlPercent: 2.17 },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white via-emerald-50/20 to-slate-50 border-t border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 mb-3">
            <PieIcon className="h-3.5 w-3.5 text-emerald-600" />
            <span>PORTFOLIO & ASSET ANALYTICS</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-950">
            Clear Insights into Every Holding & Position
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 font-medium">
            Track total invested capital, real-time current value, today's P&L, overall P&L, and asset breakdown at a single glance.
          </p>
        </div>

        {/* Portfolio Visual Showcase */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl max-w-4xl mx-auto">
          {/* Summary Stat Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <span className="text-[11px] font-semibold text-slate-500">Total Portfolio Value</span>
              <p className="font-mono-num text-xl font-extrabold text-slate-900 mt-1">₹11,42,500.00</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <span className="text-[11px] font-semibold text-slate-500">Invested Capital</span>
              <p className="font-mono-num text-xl font-extrabold text-slate-900 mt-1">₹10,00,000.00</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <span className="text-[11px] font-semibold text-slate-500">Today's P&L</span>
              <div className="mt-1">
                <PnlBadge amount={18450} percentage={1.64} />
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <span className="text-[11px] font-semibold text-slate-500">Overall Return</span>
              <div className="mt-1">
                <PnlBadge amount={142500} percentage={14.25} />
              </div>
            </div>
          </div>

          {/* Holdings Mini Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3">Symbol</th>
                  <th className="pb-3 text-right">Qty</th>
                  <th className="pb-3 text-right">Avg Price</th>
                  <th className="pb-3 text-right">LTP</th>
                  <th className="pb-3 text-right">Unrealized P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {sampleHoldings.map((row) => (
                  <tr key={row.symbol} className="hover:bg-slate-50">
                    <td className="py-3 font-bold text-slate-900">{row.symbol}</td>
                    <td className="py-3 text-right font-mono-num">{row.qty}</td>
                    <td className="py-3 text-right font-mono-num">₹{row.avgPrice.toFixed(2)}</td>
                    <td className="py-3 text-right font-mono-num">₹{row.curPrice.toFixed(2)}</td>
                    <td className="py-3 text-right font-mono-num">
                      <PnlBadge amount={row.pnl} percentage={row.pnlPercent} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
}
