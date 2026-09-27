"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "Is Aura a paper trading platform or real broker?",
      a: "Aura supports both! Out of the box, every user receives ₹10,00,000 in paper trading funds. When ready, you can configure your real broker API credentials to route orders directly to live markets.",
    },
    {
      q: "Does Google Login work out of the box?",
      a: "Yes! Google OAuth is fully implemented. When configured with client ID & secret, Google sign-in handles user creation, secure JWT cookie issuance, and profile synchronization seamlessly.",
    },
    {
      q: "Are my broker credentials safe?",
      a: "Absolutely. Broker API keys and secrets are stored server-side only and never exposed to client browser JavaScript.",
    },
    {
      q: "Can I run automated trading bot strategies?",
      a: "Yes. Aura includes quantitative strategies (MA Crossover, RSI, Momentum) with built-in RiskManager validation to control position size and daily loss caps.",
    },
  ];

  return (
    <section className="py-20 bg-slate-50 border-t border-slate-200/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 mb-3">
            <HelpCircle className="h-3.5 w-3.5 text-sky-600" />
            <span>FREQUENTLY ASKED QUESTIONS</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-950">
            Got Questions? We Have Answers.
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs transition-all"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between p-5 text-left font-display font-bold text-slate-900 text-sm sm:text-base"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${
                      isOpen ? "rotate-180 text-sky-600" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
