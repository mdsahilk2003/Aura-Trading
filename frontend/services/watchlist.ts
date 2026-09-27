import type { WatchlistItemDto } from "@aura/shared";
import { apiFetch } from "@/lib/api";

export const watchlistService = {
  list: () => apiFetch<WatchlistItemDto[]>("/api/watchlist"),
  getWatchlist: () => apiFetch<WatchlistItemDto[]>("/api/watchlist"),

  add: (symbol: string) =>
    apiFetch<{ symbols: string[] }>("/api/watchlist", {
      method: "POST",
      body: JSON.stringify({ symbol }),
    }),
  addSymbol: (symbol: string) =>
    apiFetch<{ symbols: string[] }>("/api/watchlist", {
      method: "POST",
      body: JSON.stringify({ symbol }),
    }),

  remove: (symbol: string) =>
    apiFetch<{ symbols: string[] }>(
      `/api/watchlist/${encodeURIComponent(symbol)}`,
      { method: "DELETE" }
    ),
  removeSymbol: (symbol: string) =>
    apiFetch<{ symbols: string[] }>(
      `/api/watchlist/${encodeURIComponent(symbol)}`,
      { method: "DELETE" }
    ),
};
