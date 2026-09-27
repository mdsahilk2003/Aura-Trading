"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Search,
  Bell,
  User as UserIcon,
  LogOut,
  ShieldAlert,
  Activity,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useSocket } from "@/providers/socket-provider";
import { SearchCommand } from "./SearchCommand";
import { NotificationCenter } from "./NotificationCenter";
import { Button } from "@/components/ui/button";

export function Header() {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[var(--color-line)] bg-white/90 px-4 backdrop-blur-md sm:px-6">
      {/* Brand & Market Status */}
      <div className="flex items-center gap-4">
        <Link href="/app" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sky-400 shadow-md transition-transform group-hover:scale-105">
            <TrendingUp className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-slate-900">
            AURA<span className="text-sky-600">.</span>
          </span>
        </Link>

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

      {/* Global Command Search Bar Trigger */}
      <div className="flex-1 max-w-md mx-4 hidden sm:block">
        <button
          onClick={() => setSearchOpen(true)}
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-1.5 text-xs text-slate-500 hover:border-slate-300 hover:bg-slate-100/60 transition-all shadow-xs"
        >
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-400" />
            <span>Search stocks, indices, NSE/BSE...</span>
          </div>
          <kbd className="hidden md:inline-block rounded bg-white px-1.5 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-200">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Search Icon */}
        <button
          onClick={() => setSearchOpen(true)}
          className="sm:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>

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
                <div className="absolute right-0 mt-2 z-50 w-56 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900">{user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <span className="inline-block mt-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 uppercase tracking-wider">
                      {user.role}
                    </span>
                  </div>
                  <div className="py-1">
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

      {/* Global Search Dialog Modal */}
      <SearchCommand open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Notification Center Drawer */}
      <NotificationCenter
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </header>
  );
}
