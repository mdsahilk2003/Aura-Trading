import type {
  ChartTimeframe,
  HistoricalDataDto,
  MarketStatusDto,
  QuoteDto,
} from "@aura/shared";

export interface MarketDataProvider {
  readonly name: string;
  readonly mode: "LIVE" | "DEMO" | "PAPER";
  getQuote(symbol: string): Promise<QuoteDto>;
  getQuotes(symbols: string[]): Promise<QuoteDto[]>;
  getHistoricalData(
    symbol: string,
    timeframe: ChartTimeframe
  ): Promise<HistoricalDataDto>;
  getMarketStatus(): Promise<MarketStatusDto>;
  subscribe(symbols: string[]): Promise<void>;
  unsubscribe(symbols: string[]): Promise<void>;
}
