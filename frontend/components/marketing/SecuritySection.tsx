"use client";

import { ShieldCheck, Lock, Key, Server, EyeOff } from "lucide-react";

export function SecuritySection() {
  const securityFeatures = [
    {
      icon: Lock,
      title: "HTTP-Only Secure JWT Cookies",
      desc: "Tokens are never stored in localStorage, preventing XSS token theft.",
    },
    {
      icon: Key,
      title: "Encrypted Server-Side Credentials",
      desc: "Broker API keys and OAuth secrets remain strictly on the backend.",
    },
    {
      icon: EyeOff,
      title: "Strict User Data Isolation",
      desc: "Comprehensive authorization checks prevent unauthorized portfolio or order access.",
    },
    {
      icon: Server,
      title: "Rate Limiting & Helmet Security",
      desc: "DDoS protection, CORS enforcement, and security headers enabled on all API routes.",
    },
  ];

  return (
    <section className="py-20 bg-white border-t border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 mb-3">
            <ShieldCheck className="h-3.5 w-3.5 text-sky-600" />
            <span>SECURITY & ARCHITECTURE</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-950">
            Bank-Grade Security Built In
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 font-medium">
            Architected to safeguard financial data, user sessions, and trading executions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {securityFeatures.map((sec) => {
            const Icon = sec.icon;
            return (
              <div
                key={sec.title}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 hover:bg-white hover:shadow-md transition-all"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-sky-400 mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-sm font-bold text-slate-900 mb-2">{sec.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{sec.desc}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
