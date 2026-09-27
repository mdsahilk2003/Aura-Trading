import { v4 as uuid } from "uuid";
import { ERROR_CODES, type PlaceOrderRequest, type ModifyOrderRequest, type OrderDto, type QuoteDto } from "@aura/shared";
import { AppError } from "../utils/errors";
import { liveQuoteFromSeries } from "../utils/marketSimulation";
import type { BrokerAdapter, BrokerFunds, BrokerProfile } from "./BrokerAdapter";
import { Order } from "../models/Order";
import { Holding } from "../models/Holding";
import { Position } from "../models/Position";
import { Wallet } from "../models/Wallet";
import { Instrument } from "../models/Instrument";

/**
 * Paper broker — executes against local DB / simulated quotes.
 * Real money never moves. Explicitly PAPER mode.
 */
export class PaperBrokerAdapter implements BrokerAdapter {
  readonly name = "PaperBrokerAdapter";

  async getProfile(userId: string): Promise<BrokerProfile> {
    return {
      id: userId,
      name: "Paper Trading Account",
      mode: "PAPER",
    };
  }

  async getFunds(userId: string): Promise<BrokerFunds> {
    const wallet = await Wallet.findOne({ userId });
    const available = wallet?.balance ?? 0;
    return {
      available,
      used: 0,
      total: available,
      currency: wallet?.currency ?? "INR",
    };
  }

  async getHoldings(userId: string) {
    const holdings = await Holding.find({ userId, quantity: { $gt: 0 } });
    return Promise.all(
      holdings.map(async (h) => {
        const quote = liveQuoteFromSeries(h.symbol);
        const invested = h.quantity * h.averagePrice;
        const currentValue = h.quantity * quote.price;
        const pnl = currentValue - invested;
        return {
          symbol: h.symbol,
          instrumentId: String(h.instrumentId),
          quantity: h.quantity,
          averagePrice: h.averagePrice,
          currentPrice: quote.price,
          invested,
          currentValue,
          pnl,
          pnlPercent: invested ? (pnl / invested) * 100 : 0,
          dayChange: quote.change * h.quantity,
          dayChangePercent: quote.changePercent,
        };
      })
    );
  }

  async getPositions(userId: string) {
    const positions = await Position.find({ userId });
    return Promise.all(
      positions.map(async (p) => {
        const quote = liveQuoteFromSeries(p.symbol);
        const pnl = (quote.price - p.averagePrice) * p.quantity;
        return {
          symbol: p.symbol,
          instrumentId: String(p.instrumentId),
          quantity: p.quantity,
          averagePrice: p.averagePrice,
          currentPrice: quote.price,
          pnl,
          pnlPercent: p.averagePrice
            ? ((quote.price - p.averagePrice) / p.averagePrice) * 100
            : 0,
          side: p.side,
        };
      })
    );
  }

  async getOrders(userId: string): Promise<OrderDto[]> {
    const orders = await Order.find({ userId }).sort({ createdAt: -1 }).limit(100);
    return orders.map(mapOrder);
  }

  async getOrder(userId: string, id: string): Promise<OrderDto | null> {
    const order = await Order.findOne({ _id: id, userId });
    return order ? mapOrder(order) : null;
  }

  async placeOrder(userId: string, order: PlaceOrderRequest): Promise<OrderDto> {
    const instrument = await Instrument.findOne({
      symbol: order.symbol.toUpperCase(),
      isActive: true,
    });
    if (!instrument) {
      throw new AppError("Instrument not found", 404, ERROR_CODES.NOT_FOUND);
    }

    const quote = liveQuoteFromSeries(order.symbol);
    const fillPrice =
      order.orderType === "MARKET"
        ? quote.price
        : order.price ?? quote.price;

    const created = await Order.create({
      userId,
      brokerOrderId: `PAPER-${uuid()}`,
      instrumentId: instrument._id,
      symbol: instrument.symbol,
      side: order.side,
      orderType: order.orderType,
      quantity: order.quantity,
      filledQuantity: order.orderType === "MARKET" ? order.quantity : 0,
      price: order.price,
      triggerPrice: order.triggerPrice,
      averagePrice: order.orderType === "MARKET" ? fillPrice : undefined,
      status: order.orderType === "MARKET" ? "FILLED" : "OPEN",
      executedAt: order.orderType === "MARKET" ? new Date() : undefined,
    });

    return mapOrder(created);
  }

  async modifyOrder(
    userId: string,
    id: string,
    patch: ModifyOrderRequest
  ): Promise<OrderDto> {
    const order = await Order.findOne({ _id: id, userId });
    if (!order) throw new AppError("Order not found", 404, ERROR_CODES.NOT_FOUND);
    if (!["OPEN", "PENDING"].includes(order.status)) {
      throw new AppError("Order cannot be modified", 409, ERROR_CODES.CONFLICT);
    }
    if (patch.quantity != null) order.quantity = patch.quantity;
    if (patch.price != null) order.price = patch.price;
    if (patch.triggerPrice != null) order.triggerPrice = patch.triggerPrice;
    await order.save();
    return mapOrder(order);
  }

  async cancelOrder(userId: string, id: string): Promise<OrderDto> {
    const order = await Order.findOne({ _id: id, userId });
    if (!order) throw new AppError("Order not found", 404, ERROR_CODES.NOT_FOUND);
    if (!["OPEN", "PENDING", "PARTIALLY_FILLED"].includes(order.status)) {
      throw new AppError("Order cannot be cancelled", 409, ERROR_CODES.CONFLICT);
    }
    order.status = "CANCELLED";
    await order.save();
    return mapOrder(order);
  }

  async getQuote(symbol: string): Promise<QuoteDto> {
    return { ...liveQuoteFromSeries(symbol), mode: "PAPER" };
  }
}

function mapOrder(order: {
  _id: { toString(): string };
  brokerOrderId?: string;
  instrumentId: { toString(): string };
  symbol: string;
  side: OrderDto["side"];
  orderType: OrderDto["orderType"];
  quantity: number;
  filledQuantity: number;
  price?: number;
  triggerPrice?: number;
  averagePrice?: number;
  status: OrderDto["status"];
  createdAt: Date;
  updatedAt: Date;
  executedAt?: Date;
}): OrderDto {
  return {
    id: order._id.toString(),
    brokerOrderId: order.brokerOrderId,
    instrumentId: order.instrumentId.toString(),
    symbol: order.symbol,
    side: order.side,
    orderType: order.orderType,
    quantity: order.quantity,
    filledQuantity: order.filledQuantity,
    price: order.price,
    triggerPrice: order.triggerPrice,
    averagePrice: order.averagePrice,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    executedAt: order.executedAt?.toISOString() ?? null,
  };
}
