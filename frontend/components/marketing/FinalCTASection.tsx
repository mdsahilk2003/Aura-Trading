"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinalCTASection() {
  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-sky-200 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 p-10 sm:p-16 text-center text-white shadow-2xl relative overflow-hidden">
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3.5 py-1 text-xs font-semibold text-sky-400">
              <Sparkles className="h-3.5 w-3.5 text-sky-400" />
              <span>START TRADING TODAY</span>
            </div>

            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Ready to Upgrade Your Trading Workflow?
            </h2>

            <p className="text-sm sm:text-base text-slate-300 font-medium">
              Join thousands of traders using Aura for paper trading, candlestick analytics, and automated strategy execution.
            </p>

            <div className="pt-2">
              <Link href="/markets">
                <Button size="lg" className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-8 h-12 rounded-xl shadow-lg shadow-sky-500/20">
                  <span>START TRADING NOW</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
