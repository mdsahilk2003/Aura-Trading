import { BrokerManager } from "../brokers/BrokerManager";
import { MarketDataService } from "../market-data/MarketDataService";
import { TradingService } from "../trading/TradingService";
import { PortfolioService } from "../trading/PortfolioService";
import { BotService } from "../trading/BotService";
import type { Server as SocketServer } from "socket.io";

export class AppContext {
  readonly brokerManager: BrokerManager;
  readonly marketData: MarketDataService;
  readonly trading: TradingService;
  readonly portfolio: PortfolioService;
  readonly bot: BotService;

  constructor() {
    this.brokerManager = new BrokerManager();
    this.marketData = new MarketDataService(this.brokerManager);
    this.trading = new TradingService(this.brokerManager, this.marketData);
    this.portfolio = new PortfolioService(
      this.marketData,
      this.brokerManager,
      this.trading
    );
    this.bot = new BotService(this.marketData, this.trading);
  }

  bindIo(io: SocketServer) {
    this.trading.setIo(io);
    this.bot.setIo(io);
  }
}

export const appContext = new AppContext();
