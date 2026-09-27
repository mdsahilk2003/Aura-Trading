import type {
  ChartTimeframe,
  HistoricalDataDto,
  MarketStatusDto,
  QuoteDto,
} from "@aura/shared";
import { AppError } from "../utils/errors";
import { ERROR_CODES } from "@aura/shared";
import { env } from "../config/env";
import type { MarketDataProvider } from "./MarketDataProvider";

/**
 * External HTTP market-data provider.
 * Configure MARKET_DATA_API_URL + MARKET_DATA_API_KEY to enable.
 * Expected upstream endpoints (adapter-friendly):
 *   GET {base}/quote?symbol=
 *   GET {base}/quotes?symbols=
 *   GET {base}/history?symbol=&timeframe=
 *   GET {base}/status
 */
export class ExternalMarketDataProvider implements MarketDataProvider {
  readonly name = "ExternalMarketDataProvider";
  readonly mode = "LIVE" as const;
  private subscribed = new Set<string>();

  private get baseUrl(): string {
    if (!env.MARKET_DATA_API_URL || !env.MARKET_DATA_API_KEY) {
      throw new AppError(
        "External market data is not configured",
        503,
        ERROR_CODES.BROKER_ERROR
      );
    }
    return env.MARKET_DATA_API_URL.replace(/\/$/, "");
  }

  private async request<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        Authorization: `Bearer ${env.MARKET_DATA_API_KEY}`,
        Accept: "application/json",
      },
    });
    if (!res.ok) {
      throw new AppError(
        `Market data provider error (${res.status})`,
        502,
        ERROR_CODES.BROKER_ERROR
      );
    }
    return (await res.json()) as T;
  }

  async getQuote(symbol: string): Promise<QuoteDto> {
    const data = await this.request<QuoteDto>(
      `/quote?symbol=${encodeURIComponent(symbol)}`
    );
    return { ...data, mode: this.mode };
  }

  async getQuotes(symbols: string[]): Promise<QuoteDto[]> {
    const data = await this.request<QuoteDto[]>(
      `/quotes?symbols=${encodeURIComponent(symbols.join(","))}`
    );
    return data.map((q) => ({ ...q, mode: this.mode }));
  }

  async getHistoricalData(
    symbol: string,
    timeframe: ChartTimeframe
  ): Promise<HistoricalDataDto> {
    const data = await this.request<HistoricalDataDto>(
      `/history?symbol=${encodeURIComponent(symbol)}&timeframe=${timeframe}`
    );
    return { ...data, mode: this.mode };
  }

  async getMarketStatus(): Promise<MarketStatusDto> {
    const data = await this.request<MarketStatusDto>("/status");
    return { ...data, mode: this.mode };
  }

  async subscribe(symbols: string[]): Promise<void> {
    symbols.forEach((s) => this.subscribed.add(s.toUpperCase()));
  }

  async unsubscribe(symbols: string[]): Promise<void> {
    symbols.forEach((s) => this.subscribed.delete(s.toUpperCase()));
  }
}
