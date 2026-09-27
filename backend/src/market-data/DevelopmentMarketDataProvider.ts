import type {
  ChartTimeframe,
  HistoricalDataDto,
  MarketStatusDto,
  QuoteDto,
} from "@aura/shared";
import type { MarketDataProvider } from "./MarketDataProvider";
import {
  generateOhlcv,
  liveQuoteFromSeries,
} from "../utils/marketSimulation";

/**
 * Isolated development provider. Generates realistic OHLCV from seeded
 * simulation — never presented as live market data.
 */
export class DevelopmentMarketDataProvider implements MarketDataProvider {
  readonly name = "DevelopmentMarketDataProvider";
  readonly mode = "DEMO" as const;
  private subscribed = new Set<string>();

  async getQuote(symbol: string): Promise<QuoteDto> {
    return { ...liveQuoteFromSeries(symbol), mode: this.mode };
  }

  async getQuotes(symbols: string[]): Promise<QuoteDto[]> {
    return Promise.all(symbols.map((s) => this.getQuote(s)));
  }

  async getHistoricalData(
    symbol: string,
    timeframe: ChartTimeframe
  ): Promise<HistoricalDataDto> {
    return {
      symbol: symbol.toUpperCase(),
      timeframe,
      bars: generateOhlcv(symbol, timeframe),
      mode: this.mode,
    };
  }

  async getMarketStatus(): Promise<MarketStatusDto> {
    const hour = new Date().getUTCHours();
    // Approximate IST market hours in UTC (3:45–10:00 UTC)
    const isOpen = hour >= 3 && hour < 10;
    return {
      isOpen,
      session: isOpen ? "OPEN" : "CLOSED",
      serverTime: new Date().toISOString(),
      mode: this.mode,
    };
  }

  async subscribe(symbols: string[]): Promise<void> {
    symbols.forEach((s) => this.subscribed.add(s.toUpperCase()));
  }

  async unsubscribe(symbols: string[]): Promise<void> {
    symbols.forEach((s) => this.subscribed.delete(s.toUpperCase()));
  }

  getSubscribed(): string[] {
    return [...this.subscribed];
  }
}
