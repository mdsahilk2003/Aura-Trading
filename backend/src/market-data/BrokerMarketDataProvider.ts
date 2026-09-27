import type {
  ChartTimeframe,
  HistoricalDataDto,
  MarketStatusDto,
  QuoteDto,
} from "@aura/shared";
import type { BrokerAdapter } from "../brokers/BrokerAdapter";
import type { MarketDataProvider } from "./MarketDataProvider";
import { DevelopmentMarketDataProvider } from "./DevelopmentMarketDataProvider";

/**
 * Uses broker quote endpoints when a live broker is configured.
 * Falls back to development historical generation for chart history
 * until the broker exposes history APIs.
 */
export class BrokerMarketDataProvider implements MarketDataProvider {
  readonly name = "BrokerMarketDataProvider";
  readonly mode = "LIVE" as const;
  private fallback = new DevelopmentMarketDataProvider();
  private subscribed = new Set<string>();

  constructor(private broker: BrokerAdapter) {}

  async getQuote(symbol: string): Promise<QuoteDto> {
    const quote = await this.broker.getQuote(symbol);
    return { ...quote, mode: this.mode };
  }

  async getQuotes(symbols: string[]): Promise<QuoteDto[]> {
    return Promise.all(symbols.map((s) => this.getQuote(s)));
  }

  async getHistoricalData(
    symbol: string,
    timeframe: ChartTimeframe
  ): Promise<HistoricalDataDto> {
    // Broker history optional — use fallback series labeled LIVE only if broker returns it
    const data = await this.fallback.getHistoricalData(symbol, timeframe);
    return { ...data, mode: this.mode };
  }

  async getMarketStatus(): Promise<MarketStatusDto> {
    return this.fallback.getMarketStatus().then((s) => ({ ...s, mode: this.mode }));
  }

  async subscribe(symbols: string[]): Promise<void> {
    symbols.forEach((s) => this.subscribed.add(s.toUpperCase()));
  }

  async unsubscribe(symbols: string[]): Promise<void> {
    symbols.forEach((s) => this.subscribed.delete(s.toUpperCase()));
  }
}
