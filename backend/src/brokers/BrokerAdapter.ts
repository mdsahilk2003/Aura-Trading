import type {
  HoldingDto,
  OrderDto,
  PlaceOrderRequest,
  ModifyOrderRequest,
  PositionDto,
  QuoteDto,
} from "@aura/shared";

export interface BrokerProfile {
  id: string;
  name: string;
  email?: string;
  mode: "LIVE" | "PAPER";
}

export interface BrokerFunds {
  available: number;
  used: number;
  total: number;
  currency: string;
}

export interface BrokerAdapter {
  readonly name: string;
  getProfile(userId: string): Promise<BrokerProfile>;
  getFunds(userId: string): Promise<BrokerFunds>;
  getHoldings(userId: string): Promise<HoldingDto[]>;
  getPositions(userId: string): Promise<PositionDto[]>;
  getOrders(userId: string): Promise<OrderDto[]>;
  getOrder(userId: string, id: string): Promise<OrderDto | null>;
  placeOrder(userId: string, order: PlaceOrderRequest): Promise<OrderDto>;
  modifyOrder(
    userId: string,
    id: string,
    order: ModifyOrderRequest
  ): Promise<OrderDto>;
  cancelOrder(userId: string, id: string): Promise<OrderDto>;
  getQuote(symbol: string): Promise<QuoteDto>;
}
