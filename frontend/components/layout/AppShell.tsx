"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { MobileBottomNav } from "./MobileBottomNav";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const isPrivateRoute = [
    "/app/portfolio",
    "/app/orders",
    "/app/watchlist",
    "/app/profile",
    "/app/analytics",
    "/app/trading-bot",
    "/app/admin",
  ].some((route) => pathname?.startsWith(route));

  useEffect(() => {
    if (!isLoading && !user && isPrivateRoute) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/app")}`);
    }
  }, [user, isLoading, isPrivateRoute, pathname, router]);

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)] flex flex-col">
      <Header />
      <div className="flex flex-1 relative">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-12">
          {children}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
