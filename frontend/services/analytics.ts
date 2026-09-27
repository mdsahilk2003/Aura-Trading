import type { AnalyticsPerformanceDto, AnalyticsPnlDto } from "@aura/shared";
import { apiFetch } from "@/lib/api";

export const analyticsService = {
  pnl: () => apiFetch<AnalyticsPnlDto>("/api/analytics/pnl"),
  performance: () =>
    apiFetch<AnalyticsPerformanceDto>("/api/analytics/performance"),
};
