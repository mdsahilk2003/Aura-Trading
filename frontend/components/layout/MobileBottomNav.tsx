"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart2,
  PieChart,
  ClipboardList,
  User,
} from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/app", icon: LayoutDashboard },
    { label: "Markets", href: "/app/markets", icon: BarChart2 },
    { label: "Portfolio", href: "/app/portfolio", icon: PieChart },
    { label: "Orders", href: "/app/orders", icon: ClipboardList },
    { label: "Profile", href: "/app/profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-[var(--color-line)] bg-white/95 backdrop-blur-md px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
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
              className={`flex flex-col items-center gap-1 min-w-[56px] py-1 text-center transition-all ${
                isActive
                  ? "text-sky-600 font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <div className={`relative p-1 rounded-xl transition-all ${isActive ? "bg-sky-50" : ""}`}>
                <Icon className={`h-5 w-5 ${isActive ? "text-sky-600 stroke-[2.5]" : "text-slate-400 stroke-[1.75]"}`} />
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
