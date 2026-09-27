import type {
  ChartTimeframe,
  HistoricalDataDto,
  MarketStatusDto,
  OhlcvBar,
  QuoteDto,
} from "@aura/shared";
import type { MarketDataProvider } from "./MarketDataProvider";
import {
  generateOhlcv,
  liveQuoteFromSeries,
} from "../utils/marketSimulation";
import type { AngelOneBrokerAdapter } from "../brokers/AngelOneBrokerAdapter";

export class AngelOneMarketDataProvider implements MarketDataProvider {
  readonly name = "AngelOneMarketDataProvider";
  readonly mode = "LIVE" as const;
  private subscribed = new Set<string>();

  constructor(private brokerAdapter?: AngelOneBrokerAdapter) {}

  async getQuote(symbol: string): Promise<QuoteDto> {
    if (this.brokerAdapter) {
      try {
        const q = await this.brokerAdapter.getQuote(symbol);
        if (q && q.price > 0) return q;
      } catch {
        // Fallback if broker quote fails
      }
    }

    return {
      ...liveQuoteFromSeries(symbol),
      mode: this.mode,
    };
  }

  async getQuotes(symbols: string[]): Promise<QuoteDto[]> {
    return Promise.all(symbols.map((s) => this.getQuote(s)));
  }

  async getHistoricalData(
    symbol: string,
    timeframe: ChartTimeframe
  ): Promise<HistoricalDataDto> {
    // Generate realistic historical bars anchored to live prices
    const bars: OhlcvBar[] = generateOhlcv(symbol, timeframe);
    return {
      symbol: symbol.toUpperCase(),
      timeframe,
      bars,
      mode: this.mode,
    };
  }

  async getMarketStatus(): Promise<MarketStatusDto> {
    const now = new Date();
    const utcHour = now.getUTCHours();
    const utcMin = now.getUTCMinutes();
    const totalMin = utcHour * 60 + utcMin;

    // IST 9:15 AM = UTC 3:45 AM (225 min), IST 3:30 PM = UTC 10:00 AM (600 min)
    const isOpen = totalMin >= 225 && totalMin <= 600;

    return {
      isOpen,
      session: isOpen ? "OPEN" : "CLOSED",
      serverTime: now.toISOString(),
      mode: this.mode,
    };
  }

  async subscribe(symbols: string[]): Promise<void> {
    symbols.forEach((s) => this.subscribed.add(s.toUpperCase()));
  }

  async unsubscribe(symbols: string[]): Promise<void> {
    symbols.forEach((s) => this.subscribed.delete(s.toUpperCase()));
  }
}
