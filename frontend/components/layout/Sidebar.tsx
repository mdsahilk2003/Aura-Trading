"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart2,
  PieChart,
  ClipboardList,
  Bookmark,
  Bot,
  TrendingUp,
  Bell,
  User,
  ShieldAlert,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    { label: "Dashboard", href: "/app", icon: LayoutDashboard },
    { label: "Markets", href: "/app/markets", icon: BarChart2 },
    { label: "Portfolio", href: "/app/portfolio", icon: PieChart },
    { label: "Orders", href: "/app/orders", icon: ClipboardList },
    { label: "Watchlist", href: "/app/watchlist", icon: Bookmark },
    { label: "Trading Bot", href: "/app/trading-bot", icon: Bot },
    { label: "Analytics", href: "/app/analytics", icon: TrendingUp },
    { label: "Notifications", href: "/app/notifications", icon: Bell },
    { label: "Profile", href: "/app/profile", icon: User },
  ];

  if (user?.role === "admin") {
    navItems.push({ label: "Admin Console", href: "/app/admin", icon: ShieldAlert });
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-[var(--color-line)] bg-white min-h-[calc(100vh-4rem)] p-4 justify-between">
      <div className="space-y-6">
        {/* Navigation Group Header */}
        <div>
          <p className="px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">
            Main Menu
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/app"
                  ? pathname === "/app"
                  : Boolean(pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-slate-950 text-white shadow-md shadow-slate-950/10 font-semibold"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-sky-400" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Card */}
      <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-indigo-50/40 p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-xs font-bold text-slate-900">Paper Trading Active</p>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
          Simulate trades with ₹10,00,000 virtual balance with zero financial risk.
        </p>
        <Link
          href="/app/trading-bot"
          className="inline-flex w-full items-center justify-center rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-sky-700 transition-colors"
        >
          Launch Bot Strategy
        </Link>
      </div>
    </aside>
  );
}
