"use client";

import { BarChart3, TrendingUp, Award, Activity } from "lucide-react";

export function AnalyticsSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 mb-3">
            <BarChart3 className="h-3.5 w-3.5 text-indigo-400" />
            <span>PERFORMANCE ANALYTICS</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
            Data-Driven Performance Breakdown
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400 font-medium">
            Analyze your win rate ratio, trade distribution, profit factor, and monthly returns with clean charts.
          </p>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Award className="h-5 w-5 text-emerald-400" />
              <h3 className="font-display text-sm font-bold text-white">Win Rate Ratio</h3>
            </div>
            <p className="font-mono-num text-4xl font-extrabold text-emerald-400">71.4%</p>
            <p className="text-xs text-slate-400 mt-2">Based on 42 completed executions</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="h-5 w-5 text-sky-400" />
              <h3 className="font-display text-sm font-bold text-white">Profit Factor</h3>
            </div>
            <p className="font-mono-num text-4xl font-extrabold text-sky-400">2.45</p>
            <p className="text-xs text-slate-400 mt-2">Gross Profits / Gross Losses</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="h-5 w-5 text-indigo-400" />
              <h3 className="font-display text-sm font-bold text-white">Avg Hold Time</h3>
            </div>
            <p className="font-mono-num text-4xl font-extrabold text-indigo-400">4.2 Hrs</p>
            <p className="text-xs text-slate-400 mt-2">Intraday & swing execution stats</p>
          </div>
        </div>

      </div>
    </section>
  );
}
