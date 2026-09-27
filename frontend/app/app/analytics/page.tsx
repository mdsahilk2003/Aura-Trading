"use client";

import { useQuery } from "@tanstack/react-query";
import { TrendingUp, BarChart3, Award, Activity } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { analyticsService } from "@/services/analytics";

export default function AnalyticsPage() {
  const { data: pnlData, isLoading: loadingPnl } = useQuery({
    queryKey: ["analytics", "pnl"],
    queryFn: analyticsService.pnl,
  });

  const { data: perfData, isLoading: loadingPerf } = useQuery({
    queryKey: ["analytics", "performance"],
    queryFn: analyticsService.performance,
  });

  return (
    <AppShell>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-950">
              Trading Analytics & Performance
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Quantitative breakdown of equity growth, monthly P&L, and trade distribution
            </p>
          </div>
        </div>

        {/* 3 Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <Award className="h-4 w-4 text-emerald-600" />
              <span>Overall Win Rate</span>
            </div>
            <p className="font-mono-num text-2xl font-extrabold text-emerald-600">
              {pnlData?.winRate ?? 68.4}%
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <TrendingUp className="h-4 w-4 text-sky-600" />
              <span>Realized Cumulative P&L</span>
            </div>
            <p className="font-mono-num text-2xl font-extrabold text-slate-900">
              ₹{(pnlData?.totalPnl ?? 142500).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <Activity className="h-4 w-4 text-indigo-600" />
              <span>Data Provider Mode</span>
            </div>
            <p className="font-mono-num text-2xl font-extrabold text-indigo-600">
              {pnlData?.mode || "DEMO"}
            </p>
          </div>
        </div>

        {/* Equity Curve Monthly Matrix */}
        {perfData?.monthly && (
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h3 className="font-display text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Monthly P&L Matrix
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {perfData.monthly.map((m) => (
                <div key={m.month} className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500">{m.month}</span>
                  <p className={`font-mono-num font-bold text-sm mt-1 ${m.pnl >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {m.pnl >= 0 ? "+" : ""}₹{m.pnl.toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
