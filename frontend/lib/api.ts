import type { ApiResponse } from "@aura/shared";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL !== undefined && process.env.NEXT_PUBLIC_API_URL !== ""
    ? process.env.NEXT_PUBLIC_API_URL
    : "";

export class ApiClientError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(message: string, code: string, status: number, details?: unknown) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  let body: ApiResponse<T> | null = null;
  try {
    body = (await res.json()) as ApiResponse<T>;
  } catch {
    throw new ApiClientError("Invalid server response", "INTERNAL_ERROR", res.status);
  }

  if (!body.success) {
    throw new ApiClientError(
      body.message || "Request failed",
      body.code || "INTERNAL_ERROR",
      res.status,
      body.details
    );
  }

  return body.data;
}

export function googleAuthUrl() {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const stateParam = origin ? `?state=${encodeURIComponent(origin)}` : "";
  return `${API_URL}/api/auth/google${stateParam}`;
}
