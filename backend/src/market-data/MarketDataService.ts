import type {
  ChartTimeframe,
  HistoricalDataDto,
  MarketStatusDto,
  QuoteDto,
} from "@aura/shared";
import {
  env,
  isLiveBrokerConfigured,
  isLiveMarketDataConfigured,
} from "../config/env";
import type { MarketDataProvider } from "./MarketDataProvider";
import { DevelopmentMarketDataProvider } from "./DevelopmentMarketDataProvider";
import { ExternalMarketDataProvider } from "./ExternalMarketDataProvider";
import { BrokerMarketDataProvider } from "./BrokerMarketDataProvider";
import { AngelOneMarketDataProvider } from "./AngelOneMarketDataProvider";
import { AngelOneBrokerAdapter } from "../brokers/AngelOneBrokerAdapter";
import type { BrokerManager } from "../brokers/BrokerManager";

export class MarketDataService {
  private provider: MarketDataProvider;

  constructor(brokerManager?: BrokerManager) {
    this.provider = this.resolveProvider(brokerManager);
  }

  private resolveProvider(brokerManager?: BrokerManager): MarketDataProvider {
    if (env.MARKET_DATA_PROVIDER === "angelone") {
      const adapter = brokerManager?.getAdapter();
      return new AngelOneMarketDataProvider(
        adapter instanceof AngelOneBrokerAdapter ? adapter : undefined
      );
    }
    if (env.MARKET_DATA_PROVIDER === "external" && isLiveMarketDataConfigured) {
      return new ExternalMarketDataProvider();
    }
    if (
      env.MARKET_DATA_PROVIDER === "broker" &&
      isLiveBrokerConfigured &&
      brokerManager
    ) {
      return new BrokerMarketDataProvider(brokerManager.getAdapter());
    }
    return new DevelopmentMarketDataProvider();
  }

  getProviderName(): string {
    return this.provider.name;
  }

  getMode() {
    return this.provider.mode;
  }

  getQuote(symbol: string): Promise<QuoteDto> {
    return this.provider.getQuote(symbol.toUpperCase());
  }

  getQuotes(symbols: string[]): Promise<QuoteDto[]> {
    return this.provider.getQuotes(symbols.map((s) => s.toUpperCase()));
  }

  getHistoricalData(
    symbol: string,
    timeframe: ChartTimeframe
  ): Promise<HistoricalDataDto> {
    return this.provider.getHistoricalData(symbol.toUpperCase(), timeframe);
  }

  getMarketStatus(): Promise<MarketStatusDto> {
    return this.provider.getMarketStatus();
  }

  subscribe(symbols: string[]): Promise<void> {
    return this.provider.subscribe(symbols.map((s) => s.toUpperCase()));
  }

  unsubscribe(symbols: string[]): Promise<void> {
    return this.provider.unsubscribe(symbols.map((s) => s.toUpperCase()));
  }
}
