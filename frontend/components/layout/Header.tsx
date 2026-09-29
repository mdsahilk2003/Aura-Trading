"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  Search,
  Bell,
  User as UserIcon,
  LogOut,
  ShieldAlert,
  Activity,
  Wallet,
  PlusCircle,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useSocket } from "@/providers/socket-provider";
import { HeaderSearch } from "./HeaderSearch";
import { NotificationCenter } from "./NotificationCenter";
import { AddMoneyModal } from "@/components/funds/AddMoneyModal";
import { portfolioService } from "@/services/portfolio";
import { AuraLogo } from "@/components/ui/AuraLogo";
import { Button } from "@/components/ui/button";

export function Header() {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [addMoneyOpen, setAddMoneyOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: portfolio } = useQuery({
    queryKey: ["portfolio"],
    queryFn: portfolioService.getPortfolio,
    enabled: Boolean(user),
    refetchInterval: 5000,
  });

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[var(--color-line)] bg-white/90 px-4 backdrop-blur-md sm:px-6">
      {/* Brand & Market Status */}
      <div className="flex items-center gap-4">
        <AuraLogo />

        {/* Live Market Socket Status Pill */}
        <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
          <span
            className={`h-2 w-2 rounded-full ${
              connected ? "bg-emerald-500 animate-pulse-dot" : "bg-amber-500"
            }`}
          />
          <span>{connected ? "LIVE TICKER CONNECTED" : "RECONNECTING TICKER"}</span>
        </div>
      </div>

      {/* Inline Header Search Bar */}
      <HeaderSearch />

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Add Money Button */}
        <Link
          href="/app/profile?addMoney=true"
          className="flex items-center gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:shadow-md transition-all active:scale-95"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add Money</span>
        </Link>

        {/* Mobile Search Icon */}
        <Link
          href="/app/markets"
          className="sm:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </Link>

        {/* Notifications */}
        <button
          onClick={() => setNotificationsOpen(true)}
          className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-sky-600" />
        </button>

        {/* User Account Menu */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2.5 rounded-full border border-slate-200 p-1 pr-3 hover:bg-slate-50 transition-colors"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 font-semibold text-xs text-white">
                {user.name ? user.name[0].toUpperCase() : "U"}
              </div>
              <span className="hidden md:inline-block text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                {user.name}
              </span>
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 z-50 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/60 rounded-xl mb-1">
                    <p className="text-xs font-bold text-slate-900">{user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    
                    {/* Wallet Balance Amount */}
                    <div className="mt-2.5 flex items-center justify-between bg-emerald-50 border border-emerald-200/80 px-2.5 py-1.5 rounded-lg">
                      <span className="text-[11px] font-semibold text-emerald-800">Wallet Balance</span>
                      <span className="text-xs font-extrabold text-emerald-700 font-mono-num">
                        ₹{(portfolio?.availableFunds ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  <div className="py-1 space-y-0.5">
                    <Link
                      href="/app/profile?addMoney=true"
                      onClick={() => setMenuOpen(false)}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs text-emerald-800 bg-emerald-50/50 hover:bg-emerald-100/80 font-bold transition-colors border border-emerald-200/60"
                    >
                      <div className="flex items-center gap-2">
                        <PlusCircle className="h-4 w-4 text-emerald-600" />
                        <span>Add Money</span>
                      </div>
                      <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                        + Deposit
                      </span>
                    </Link>
                    <Link
                      href="/app/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      <UserIcon className="h-4 w-4 text-slate-400" />
                      <span>Account Profile</span>
                    </Link>
                    <Link
                      href="/app/portfolio"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      <Wallet className="h-4 w-4 text-slate-400" />
                      <span>Funds & Wallet</span>
                    </Link>
                    {user.role === "admin" && (
                      <Link
                        href="/app/admin"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-amber-700 hover:bg-amber-50 font-medium"
                      >
                        <ShieldAlert className="h-4 w-4 text-amber-500" />
                        <span>Admin Console</span>
                      </Link>
                    )}
                  </div>
                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-600 hover:bg-red-50 font-medium"
                    >
                      <LogOut className="h-4 w-4 text-red-500" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link href="/login">
            <Button size="sm" className="bg-slate-950 text-white hover:bg-slate-800">
              Sign In
            </Button>
          </Link>
        )}
      </div>

      {/* Notification Center Drawer */}
      <NotificationCenter
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      {/* Add Money Deposit Modal */}
      <AddMoneyModal
        open={addMoneyOpen}
        onClose={() => setAddMoneyOpen(false)}
      />
    </header>
  );
}
