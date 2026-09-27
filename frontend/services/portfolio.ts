import type { HoldingDto, PortfolioDto, PositionDto } from "@aura/shared";
import { apiFetch } from "@/lib/api";

export const portfolioService = {
  get: () => apiFetch<PortfolioDto>("/api/portfolio"),
  getPortfolio: () => apiFetch<PortfolioDto>("/api/portfolio"),
  holdings: () => apiFetch<HoldingDto[]>("/api/portfolio/holdings"),
  getHoldings: () => apiFetch<HoldingDto[]>("/api/portfolio/holdings"),
  positions: () => apiFetch<PositionDto[]>("/api/portfolio/positions"),
  getPositions: () => apiFetch<PositionDto[]>("/api/portfolio/positions"),
};
