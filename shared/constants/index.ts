export const APP_NAME = "Aura";
export const APP_TAGLINE = "Smarter trading. Better insights.";

export const ORDER_SIDES = ["BUY", "SELL"] as const;
export const ORDER_TYPES = [
  "MARKET",
  "LIMIT",
  "STOP_LOSS",
  "STOP_LOSS_LIMIT",
] as const;
export const ORDER_STATUSES = [
  "PENDING",
  "OPEN",
  "PARTIALLY_FILLED",
  "FILLED",
  "CANCELLED",
  "REJECTED",
  "FAILED",
] as const;

export const CHART_TIMEFRAMES = [
  "1D",
  "1W",
  "1M",
  "3M",
  "6M",
  "1Y",
  "5Y",
] as const;

export const DEFAULT_PAPER_FUNDS = 1_000_000;

export const RISK_DEFAULTS = {
  maxPositionPercent: 25,
  maxDailyLossPercent: 5,
  maxTradesPerDay: 50,
  defaultStopLossPercent: 2,
  defaultTakeProfitPercent: 4,
} as const;

export const WS_EVENTS = {
  QUOTE: "market:quote",
  ORDER_UPDATE: "order:update",
  NOTIFICATION: "notification:new",
  BOT_UPDATE: "bot:update",
  SUBSCRIBE: "market:subscribe",
  UNSUBSCRIBE: "market:unsubscribe",
} as const;

export const ERROR_CODES = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  CONFLICT: "CONFLICT",
  RATE_LIMITED: "RATE_LIMITED",
  INSUFFICIENT_FUNDS: "INSUFFICIENT_FUNDS",
  INSUFFICIENT_HOLDINGS: "INSUFFICIENT_HOLDINGS",
  RISK_REJECTED: "RISK_REJECTED",
  BROKER_ERROR: "BROKER_ERROR",
  MARKET_CLOSED: "MARKET_CLOSED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;
