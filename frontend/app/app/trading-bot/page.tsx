"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bot, Play, Square, Cpu, ShieldAlert, Activity, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { botService } from "@/services/bot";

export default function TradingBotPage() {
  const queryClient = useQueryClient();
  const [strategy, setStrategy] = useState<"MA_CROSSOVER" | "RSI" | "MOMENTUM">("MA_CROSSOVER");
  const [capital, setCapital] = useState(100000);

  const { data: bot, isLoading } = useQuery({
    queryKey: ["bot"],
    queryFn: botService.getBot,
  });

  const startMutation = useMutation({
    mutationFn: () => botService.startBot({ strategy, capital }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bot"] });
    },
  });

  const stopMutation = useMutation({
    mutationFn: () => botService.stopBot(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bot"] });
    },
  });

  const isRunning = bot?.status === "RUNNING";

  return (
    <AppShell>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-950">
                Automated Trading Bot
              </h1>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  isRunning
                    ? "bg-emerald-100 text-emerald-800 animate-pulse"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {bot?.status || "IDLE"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Algorithmic execution engine operating in Paper Simulation mode
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isRunning ? (
              <Button
                disabled={stopMutation.isPending}
                onClick={() => stopMutation.mutate()}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-10 px-5 rounded-xl"
              >
                <Square className="h-4 w-4 fill-current mr-1.5" />
                <span>STOP BOT STRATEGY</span>
              </Button>
            ) : (
              <Button
                disabled={startMutation.isPending}
                onClick={() => startMutation.mutate()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-md"
              >
                <Play className="h-4 w-4 fill-current mr-1.5" />
                <span>START BOT STRATEGY</span>
              </Button>
            )}
          </div>
        </div>

        {/* Bot Live Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500">Capital Allocated</span>
            <p className="font-mono-num text-xl font-extrabold text-slate-900 mt-1">
              ₹{(bot?.capital ?? capital).toLocaleString("en-IN")}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500">Executed Trades</span>
            <p className="font-mono-num text-xl font-extrabold text-slate-900 mt-1">
              {bot?.trades ?? 0}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500">Historical Win Rate</span>
            <p className="font-mono-num text-xl font-extrabold text-emerald-600 mt-1">
              {bot?.winRate ?? 68.5}%
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500">Max Daily Loss Cap</span>
            <p className="font-mono-num text-xl font-extrabold text-rose-600 mt-1">
              ₹{(bot?.maxDailyLoss ?? 5000).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Strategy Selector Configuration */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <h3 className="font-display text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Strategy Parameters & Rules
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                id: "MA_CROSSOVER",
                title: "Moving Average Crossover",
                desc: "BUY on 9-EMA / 21-EMA golden cross, SELL on death cross.",
              },
              {
                id: "RSI",
                title: "RSI Mean Reversion",
                desc: "BUY on RSI < 30 (Oversold), SELL on RSI > 70 (Overbought).",
              },
              {
                id: "MOMENTUM",
                title: "Momentum Breakout",
                desc: "Detects volume spikes breaking resistance levels.",
              },
            ].map((strat) => (
              <button
                key={strat.id}
                type="button"
                disabled={isRunning}
                onClick={() => setStrategy(strat.id as any)}
                className={`text-left rounded-2xl border p-4 transition-all ${
                  strategy === strat.id
                    ? "border-sky-500 bg-sky-50/50 shadow-xs ring-2 ring-sky-500/20"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display font-bold text-xs text-slate-900">{strat.title}</span>
                  {strategy === strat.id && <CheckCircle2 className="h-4 w-4 text-sky-600" />}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{strat.desc}</p>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-500" />
              <span>RiskManager actively monitors all automated order limits.</span>
            </div>
            <span className="font-mono text-slate-400">Mode: PAPER_TRADING</span>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
