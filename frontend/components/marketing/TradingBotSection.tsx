"use client";

import Link from "next/link";
import { Bot, Play, ShieldAlert, Cpu, Activity, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TradingBotSection() {
  const strategies = [
    {
      name: "Moving Average Crossover",
      code: "MA_CROSSOVER",
      desc: "Executes BUY signals when 9-EMA crosses above 21-EMA, and SELL when crossing below.",
      winRate: "68.5%",
    },
    {
      name: "RSI Mean Reversion",
      code: "RSI",
      desc: "Triggers BUY when RSI drops below 30 (Oversold), and SELL when RSI exceeds 70 (Overbought).",
      winRate: "72.1%",
    },
    {
      name: "Momentum Breakout",
      code: "MOMENTUM",
      desc: "Detects volume surge breakouts above 20-day high resistance levels.",
      winRate: "65.4%",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 via-slate-900 to-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-400 mb-3">
            <Bot className="h-3.5 w-3.5 text-sky-400" />
            <span>ALGORITHMIC TRADING BOT</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
            Automated Strategy Execution
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400 font-medium">
            Run quantitative trading strategies with built-in risk management, position size caps, and daily loss limits.
          </p>
        </div>

        {/* Strategies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {strategies.map((strat) => (
            <Link
              key={strat.code}
              href="/app/trading-bot"
              className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md flex flex-col justify-between hover:border-sky-500/80 hover:bg-slate-900 hover:shadow-sky-500/10 transition-all group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 group-hover:bg-sky-500 group-hover:text-slate-950 transition-colors">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
                    {strat.winRate} Win Rate
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-white mb-2 group-hover:text-sky-400 transition-colors">{strat.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-normal mb-4">{strat.desc}</p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <span>Execution Mode</span>
                <span className="font-mono text-sky-400 font-bold group-hover:underline flex items-center gap-1">
                  <span>Launch Bot Strategy</span>
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Bot Controls Banner */}
        <div className="rounded-3xl border border-sky-500/30 bg-gradient-to-r from-sky-950/60 via-slate-900 to-indigo-950/60 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500 text-slate-950 font-bold shadow-lg shadow-sky-500/20">
              <Play className="h-6 w-6 fill-current" />
            </div>
            <div>
              <h4 className="font-display text-base font-bold text-white">Test Automated Strategies Now</h4>
              <p className="text-xs text-slate-400">Run paper trading bot loops with zero manual intervention required.</p>
            </div>
          </div>
          <Link href="/app/trading-bot">
            <Button size="lg" className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-7 rounded-xl">
              <span>Open Bot Strategy Options</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
}
