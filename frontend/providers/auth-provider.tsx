"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserDto } from "@aura/shared";
import { ApiClientError } from "@/lib/api";
import { authService } from "@/services/auth";

interface AuthContextValue {
  user: UserDto | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  protect = false,
}: {
  children: ReactNode;
  protect?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [bootstrapped, setBootstrapped] = useState(false);

  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      try {
        return await authService.me();
      } catch (err) {
        if (err instanceof ApiClientError && err.status === 401) {
          return null;
        }
        throw err;
      }
    },
    retry: false,
  });

  useEffect(() => {
    if (!query.isLoading) setBootstrapped(true);
  }, [query.isLoading]);

  useEffect(() => {
    if (!protect || !bootstrapped) return;
    if (!query.data) {
      const next = encodeURIComponent(pathname || "/app");
      router.replace(`/login?next=${next}`);
    }
  }, [protect, bootstrapped, query.data, pathname, router]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // ignore network errors on logout
    }
    queryClient.setQueryData(["auth", "me"], null);
    queryClient.clear();
    router.replace("/");
  }, [queryClient, router]);

  const refresh = useCallback(async () => {
    await query.refetch();
  }, [query]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: query.data ?? null,
      isLoading: query.isLoading || !bootstrapped,
      isAuthenticated: Boolean(query.data),
      refresh,
      logout,
    }),
    [query.data, query.isLoading, bootstrapped, refresh, logout]
  );

  if (protect && (value.isLoading || !value.user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-canvas)]">
        <div className="rounded-2xl border border-[var(--color-line)] bg-white px-8 py-6 shadow-[var(--shadow-soft)]">
          <p className="font-display text-lg">Aura</p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Checking your session…
          </p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
