export type UserRole = "user" | "admin";

export type OrderSide = "BUY" | "SELL";
export type OrderType = "MARKET" | "LIMIT" | "STOP_LOSS" | "STOP_LOSS_LIMIT";
export type OrderStatus =
  | "PENDING"
  | "OPEN"
  | "PARTIALLY_FILLED"
  | "FILLED"
  | "CANCELLED"
  | "REJECTED"
  | "FAILED";

export type ChartTimeframe = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "5Y";

export type DataMode = "LIVE" | "DEMO" | "PAPER";

export type BotStatus = "IDLE" | "RUNNING" | "STOPPED" | "ERROR";
export type BotStrategy = "MA_CROSSOVER" | "RSI" | "MOMENTUM";

export type NotificationType =
  | "ORDER_FILLED"
  | "ORDER_REJECTED"
  | "ORDER_CANCELLED"
  | "BOT_STARTED"
  | "BOT_STOPPED"
  | "BROKER_CONNECTION"
  | "SYSTEM_ALERT";

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  code: string;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface UserDto {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  phone?: string | null;
  role: UserRole;
  providers: string[];
  createdAt: string;
  updatedAt: string;
}

export interface InstrumentDto {
  id: string;
  symbol: string;
  name: string;
  exchange: string;
  segment: string;
  lotSize: number;
  tickSize: number;
  isin?: string;
  sector?: string;
}

export interface QuoteDto {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  volume: number;
  timestamp: string;
  mode: DataMode;
}

export interface OhlcvBar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface HistoricalDataDto {
  symbol: string;
  timeframe: ChartTimeframe;
  bars: OhlcvBar[];
  mode: DataMode;
}

export interface MarketStatusDto {
  isOpen: boolean;
  session: "PRE_OPEN" | "OPEN" | "CLOSED" | "POST_CLOSE";
  serverTime: string;
  mode: DataMode;
}

export interface OrderDto {
  id: string;
  brokerOrderId?: string | null;
  instrumentId: string;
  symbol: string;
  side: OrderSide;
  orderType: OrderType;
  quantity: number;
  filledQuantity: number;
  price?: number | null;
  triggerPrice?: number | null;
  averagePrice?: number | null;
  status: OrderStatus;
  estimatedValue?: number;
  createdAt: string;
  updatedAt: string;
  executedAt?: string | null;
}

export interface HoldingDto {
  symbol: string;
  instrumentId: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  invested: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
  dayChange: number;
  dayChangePercent: number;
}

export interface PositionDto {
  symbol: string;
  instrumentId: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  side: OrderSide;
}

export interface PortfolioDto {
  totalValue: number;
  invested: number;
  currentValue: number;
  availableFunds: number;
  todaysPnl: number;
  todaysPnlPercent: number;
  overallPnl: number;
  overallPnlPercent: number;
  returnPercent: number;
  openPositions: number;
  mode: DataMode;
}

export interface WatchlistItemDto {
  symbol: string;
  name: string;
  quote: QuoteDto;
}

export interface WalletDto {
  balance: number;
  currency: string;
  mode: DataMode;
}

export interface NotificationDto {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  meta?: Record<string, unknown>;
}

export interface BotDto {
  id: string;
  status: BotStatus;
  strategy: BotStrategy;
  capital: number;
  trades: number;
  winRate: number;
  pnl: number;
  maxDailyLoss: number;
  mode: DataMode;
  symbols: string[];
  updatedAt: string;
}

export interface AnalyticsPnlDto {
  labels: string[];
  values: number[];
  totalPnl: number;
  winRate: number;
  mode: DataMode;
}

export interface AnalyticsPerformanceDto {
  equityCurve: { date: string; value: number }[];
  monthly: { month: string; pnl: number }[];
  tradeDistribution: { label: string; value: number }[];
  mode: DataMode;
}

export interface PlaceOrderRequest {
  symbol: string;
  side: OrderSide;
  orderType: OrderType;
  quantity: number;
  price?: number;
  triggerPrice?: number;
}

export interface ModifyOrderRequest {
  quantity?: number;
  price?: number;
  triggerPrice?: number;
}

export interface AngelOneSessionDto {
  authenticated: boolean;
  clientCode?: string;
  loginTime?: string;
  feedTokenConfigured: boolean;
  staticIp: string;
}

export interface BrokerSyncDto {
  ordersSynced: number;
  holdingsSynced: number;
  positionsSynced: number;
  timestamp: string;
}

