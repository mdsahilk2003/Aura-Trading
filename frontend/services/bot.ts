import type { BotDto, BotStartInput } from "@aura/shared";
import { apiFetch } from "@/lib/api";

export interface BotExecutionItem {
  id: string;
  symbol: string;
  signal: string;
  reason: string;
  pnl: number;
  createdAt: string;
}

export interface BotPerformance {
  bot: BotDto;
  executions: BotExecutionItem[];
}

export const botService = {
  get: () => apiFetch<BotDto>("/api/bot"),
  getBot: () => apiFetch<BotDto>("/api/bot"),

  start: (body: Partial<BotStartInput> & { strategy?: string; capital?: number }) =>
    apiFetch<BotDto>("/api/bot/start", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  startBot: (body: Partial<BotStartInput> & { strategy?: string; capital?: number }) =>
    apiFetch<BotDto>("/api/bot/start", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  stop: () => apiFetch<BotDto>("/api/bot/stop", { method: "POST" }),
  stopBot: () => apiFetch<BotDto>("/api/bot/stop", { method: "POST" }),

  performance: () => apiFetch<BotPerformance>("/api/bot/performance"),
  getPerformance: () => apiFetch<BotPerformance>("/api/bot/performance"),
};
