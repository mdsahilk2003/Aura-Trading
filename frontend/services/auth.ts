import type { UserDto } from "@aura/shared";
import { apiFetch, googleAuthUrl } from "@/lib/api";

export interface AuthProviders {
  google: boolean;
  emailPassword: boolean;
  testAuth: boolean;
}

export const authService = {
  me: () => apiFetch<UserDto>("/api/auth/me"),

  providers: () => apiFetch<AuthProviders>("/api/auth/providers"),

  logout: () =>
    apiFetch<{ ok: boolean }>("/api/auth/logout", { method: "POST" }),

  testLogin: (payload?: { email?: string; name?: string; role?: string }) =>
    apiFetch<{ id: string; name: string; email: string; role: string }>(
      "/api/auth/test-login",
      {
        method: "POST",
        body: JSON.stringify({
          secret: process.env.NEXT_PUBLIC_TEST_AUTH_SECRET || "dev-test-auth-secret",
          ...payload,
        }),
      }
    ),

  updateProfile: (body: { name?: string; phone?: string | null }) =>
    apiFetch<UserDto>("/api/auth/profile", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  googleUrl: googleAuthUrl,
};
