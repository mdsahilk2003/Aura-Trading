import type { HoldingDto, PortfolioDto, PositionDto } from "@aura/shared";
import { apiFetch } from "@/lib/api";

export interface FundsDto {
  available: number;
  used: number;
  total: number;
  currency: string;
}

export const portfolioService = {
  get: () => apiFetch<PortfolioDto>("/api/portfolio"),
  getPortfolio: () => apiFetch<PortfolioDto>("/api/portfolio"),
  holdings: () => apiFetch<HoldingDto[]>("/api/portfolio/holdings"),
  getHoldings: () => apiFetch<HoldingDto[]>("/api/portfolio/holdings"),
  positions: () => apiFetch<PositionDto[]>("/api/portfolio/positions"),
  getPositions: () => apiFetch<PositionDto[]>("/api/portfolio/positions"),
  getFunds: () => apiFetch<FundsDto>("/api/broker/funds"),
  depositFunds: (amount: number) =>
    apiFetch<{ available: number; deposited: number; message: string }>(
      "/api/broker/funds/deposit",
      {
        method: "POST",
        body: JSON.stringify({ amount }),
      }
    ),
};
