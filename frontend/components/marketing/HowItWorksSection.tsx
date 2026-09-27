"use client";

import { UserPlus, Cpu, Zap } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      icon: UserPlus,
      title: "Sign Up in Seconds",
      desc: "One-click Google authentication or secure email sign in with instant session initialization.",
    },
    {
      num: "02",
      icon: Cpu,
      title: "Explore & Paper Trade",
      desc: "Practice placing buy and sell orders with ₹10,00,000 in virtual funds in real-time market simulations.",
    },
    {
      num: "03",
      icon: Zap,
      title: "Connect Broker & Automate",
      desc: "Plug in your broker API credentials and launch automated trading bot strategies.",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-50 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
            How Aura Works
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400 font-medium">
            3 simple steps from registration to automated market trading.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-xl"
              >
                <span className="font-display text-4xl font-extrabold text-slate-800 absolute top-4 right-6">
                  {step.num}
                </span>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-6">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
