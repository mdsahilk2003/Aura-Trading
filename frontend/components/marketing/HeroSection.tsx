"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck, Zap } from "lucide-react";
import { CandlestickPreview } from "./CandlestickPreview";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 bg-gradient-to-b from-white via-sky-50/40 to-slate-50">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-sky-200/30 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            
            {/* Small Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1 text-xs font-semibold text-sky-700 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-sky-600" />
              <span>SMARTER TRADING. BETTER INSIGHTS.</span>
            </div>

            {/* Large Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.1]">
              Trade Smarter. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-indigo-600 to-slate-900">
                Understand Every Move.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Explore markets, analyze price action, track your portfolio and connect your trading workflow in one modern API-driven platform.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-slate-950 text-white hover:bg-slate-800 font-bold px-8 h-12 shadow-lg shadow-slate-950/20 rounded-xl">
                  <span>START TRADING</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/markets" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold px-6 h-12 rounded-xl">
                  EXPLORE MARKETS
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 border-t border-slate-200/60 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-emerald-500" />
                <span>Zero Latency Socket Stream</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-sky-500" />
                <span>Bank-grade Auth & Encryption</span>
              </div>
            </div>

          </div>

          {/* Right Hero Product Preview Mockup */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              
              {/* Laptop Glass Frame */}
              <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-3 shadow-2xl backdrop-blur-md">
                <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-100 mb-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-[10px] font-mono text-slate-400">aura-trading.internal/app</span>
                </div>

                {/* Candlestick Chart Product Visual */}
                <CandlestickPreview symbol="RELIANCE" />
              </div>

              {/* Floating Mobile Smartphone Card Overlay */}
              <div className="absolute -bottom-8 -left-6 hidden sm:block w-56 rounded-2xl border border-slate-100 bg-slate-950 p-4 text-white shadow-xl">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                  <span>Portfolio Value</span>
                  <span className="text-emerald-400 font-bold">+14.2%</span>
                </div>
                <p className="font-mono-num text-lg font-bold text-white">₹11,42,500.00</p>
                <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-900 p-2 text-xs">
                  <span className="text-slate-400">Today P&L</span>
                  <span className="text-emerald-400 font-bold font-mono-num">+₹18,450.00</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
