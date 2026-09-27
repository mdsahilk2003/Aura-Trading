"use client";

import Link from "next/link";
import { TrendingUp } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white pt-16 pb-12 text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 text-sky-400">
                <TrendingUp className="h-4 w-4" />
              </div>
              <span className="font-display text-lg font-bold text-slate-900">
                AURA<span className="text-sky-600">.</span>
              </span>
            </Link>
            <p className="text-slate-500 text-xs leading-relaxed">
              Production-grade API-driven commercial trading platform for modern fintech workflows.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-display font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">Product</h4>
            <ul className="space-y-2">
              <li><Link href="/markets" className="hover:text-slate-900">Live Markets</Link></li>
              <li><Link href="/register" className="hover:text-slate-900">Paper Trading</Link></li>
              <li><Link href="/register" className="hover:text-slate-900">Trading Bot</Link></li>
              <li><Link href="/register" className="hover:text-slate-900">Analytics</Link></li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-display font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">Architecture</h4>
            <ul className="space-y-2">
              <li><span className="text-slate-500">Next.js 15 & React 19</span></li>
              <li><span className="text-slate-500">Express & MongoDB</span></li>
              <li><span className="text-slate-500">Socket.IO WebSockets</span></li>
              <li><span className="text-slate-500">Google OAuth & JWT</span></li>
            </ul>
          </div>

          {/* Legal / Disclaimer */}
          <div>
            <h4 className="font-display font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">Regulatory Disclaimer</h4>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Aura Trading platform operates in Paper Trading / Demo simulation mode unless configured with an authorized broker API integration. Real trading carries substantial risk of loss.
            </p>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} Aura Trading Systems Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-600">Privacy Policy</span>
            <span className="hover:text-slate-600">Terms of Service</span>
            <span className="hover:text-slate-600">Security Audit</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
