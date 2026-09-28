"use client";

import Link from "next/link";
import { ShieldCheck, Coins, CheckCircle, ArrowRight, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PaperTradingSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-indigo-50/30 via-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              <Coins className="h-3.5 w-3.5 text-indigo-600" />
              <span>PAPER TRADING & SIMULATION</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-950">
              Master the Markets <br />
              <span className="text-indigo-600">Without Risking Real Capital</span>
            </h2>

            <p className="text-base text-slate-600 font-medium leading-relaxed">
              Every new Aura account comes pre-funded with ₹10,00,000 in virtual paper trading capital. Test your strategies, get comfortable placing orders, and track your P&L before connecting live broker credentials.
            </p>

            <ul className="space-y-3 text-sm font-semibold text-slate-700">
              <li className="flex items-center gap-2.5">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Instant ₹10,00,000 paper trading wallet allocation</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Identical order types: MARKET, LIMIT, STOP LOSS, STOP LOSS LIMIT</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Isolated dev & paper broker execution pipeline</span>
              </li>
            </ul>

            <div className="pt-2">
              <Link href="/markets">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-7 rounded-xl shadow-md">
                  <span>START PAPER TRADING</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Virtual Wallet Graphic Card */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-6 text-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-white">Paper Trading Wallet</h3>
                    <p className="text-xs text-slate-400">Risk-Free Environment</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400">
                  ACTIVE
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Available Funds</span>
                  <p className="font-mono-num text-3xl font-extrabold text-white mt-1">₹10,00,000.00</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                    <span className="text-[11px] text-slate-400">Max Daily Risk Limit</span>
                    <p className="font-mono-num text-sm font-bold text-slate-200 mt-0.5">₹50,000.00</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                    <span className="text-[11px] text-slate-400">Broker Execution</span>
                    <p className="font-mono-num text-sm font-bold text-emerald-400 mt-0.5">Paper Adapter</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
