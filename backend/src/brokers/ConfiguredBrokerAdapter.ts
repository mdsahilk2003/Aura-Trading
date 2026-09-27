import { ERROR_CODES } from "@aura/shared";
import type {
  HoldingDto,
  ModifyOrderRequest,
  OrderDto,
  PlaceOrderRequest,
  PositionDto,
  QuoteDto,
} from "@aura/shared";
import { env } from "../config/env";
import { AppError } from "../utils/errors";
import type { BrokerAdapter, BrokerFunds, BrokerProfile } from "./BrokerAdapter";

/**
 * Configured live broker adapter.
 * Wire BROKER_API_KEY / BROKER_API_SECRET / BROKER_REDIRECT_URI
 * to your broker's REST API. Credentials stay server-side only.
 */
export class ConfiguredBrokerAdapter implements BrokerAdapter {
  readonly name = "ConfiguredBrokerAdapter";

  private get base(): string {
    if (!env.BROKER_API_KEY || !env.BROKER_API_SECRET) {
      throw new AppError(
        "Broker credentials are not configured",
        503,
        ERROR_CODES.BROKER_ERROR
      );
    }
    return env.BROKER_REDIRECT_URI || "";
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    if (!this.base) {
      throw new AppError(
        "Broker API base URL is not configured. Set BROKER_REDIRECT_URI to the broker API root.",
        503,
        ERROR_CODES.BROKER_ERROR
      );
    }
    const res = await fetch(`${this.base.replace(/\/$/, "")}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": env.BROKER_API_KEY,
        "X-API-SECRET": env.BROKER_API_SECRET,
        ...(init?.headers || {}),
      },
    });
    if (!res.ok) {
      throw new AppError(
        `Broker API error (${res.status})`,
        502,
        ERROR_CODES.BROKER_ERROR
      );
    }
    return (await res.json()) as T;
  }

  getProfile(userId: string): Promise<BrokerProfile> {
    return this.request(`/profile?userId=${userId}`);
  }

  getFunds(userId: string): Promise<BrokerFunds> {
    return this.request(`/funds?userId=${userId}`);
  }

  getHoldings(userId: string): Promise<HoldingDto[]> {
    return this.request(`/holdings?userId=${userId}`);
  }

  getPositions(userId: string): Promise<PositionDto[]> {
    return this.request(`/positions?userId=${userId}`);
  }

  getOrders(userId: string): Promise<OrderDto[]> {
    return this.request(`/orders?userId=${userId}`);
  }

  getOrder(userId: string, id: string): Promise<OrderDto | null> {
    return this.request(`/orders/${id}?userId=${userId}`);
  }

  placeOrder(userId: string, order: PlaceOrderRequest): Promise<OrderDto> {
    return this.request(`/orders?userId=${userId}`, {
      method: "POST",
      body: JSON.stringify(order),
    });
  }

  modifyOrder(
    userId: string,
    id: string,
    order: ModifyOrderRequest
  ): Promise<OrderDto> {
    return this.request(`/orders/${id}?userId=${userId}`, {
      method: "PATCH",
      body: JSON.stringify(order),
    });
  }

  cancelOrder(userId: string, id: string): Promise<OrderDto> {
    return this.request(`/orders/${id}?userId=${userId}`, { method: "DELETE" });
  }

  getQuote(symbol: string): Promise<QuoteDto> {
    return this.request(`/quote?symbol=${encodeURIComponent(symbol)}`);
  }
}
