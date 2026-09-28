import { Types } from "mongoose";
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

  private buildUserQuery(userId: string) {
    if (Types.ObjectId.isValid(userId)) {
      const objId = new Types.ObjectId(userId);
      return { $or: [{ userId }, { userId: objId }] };
    }
    return { userId };
  }

  async getProfile(userId: string): Promise<BrokerProfile> {
    return {
      id: userId,
      name: "Paper Trading Account",
      mode: "PAPER",
    };
  }

  async getFunds(userId: string): Promise<BrokerFunds> {
    const userQuery = this.buildUserQuery(userId);
    const wallet = await Wallet.findOne(userQuery);
    const available = Number(wallet?.balance ?? 0);
    return {
      available,
      used: 0,
      total: available,
      currency: wallet?.currency ?? "INR",
    };
  }

  async getHoldings(userId: string) {
    const userQuery = this.buildUserQuery(userId);
    const holdings = await Holding.find({ ...userQuery, quantity: { $gt: 0 } });
    return Promise.all(
      holdings.map(async (h) => {
        const quote = liveQuoteFromSeries(h.symbol);
        const hQuantity = Number(h.quantity);
        const hAvgPrice = Number(h.averagePrice);
        const invested = hQuantity * hAvgPrice;
        const currentValue = hQuantity * quote.price;
        const pnl = currentValue - invested;
        return {
          symbol: h.symbol,
          instrumentId: String(h.instrumentId),
          quantity: hQuantity,
          averagePrice: hAvgPrice,
          currentPrice: quote.price,
          invested,
          currentValue,
          pnl,
          pnlPercent: invested ? (pnl / invested) * 100 : 0,
          dayChange: quote.change * hQuantity,
          dayChangePercent: quote.changePercent,
        };
      })
    );
  }

  async getPositions(userId: string) {
    const userQuery = this.buildUserQuery(userId);
    const positions = await Position.find(userQuery);
    return Promise.all(
      positions.map(async (p) => {
        const quote = liveQuoteFromSeries(p.symbol);
        const pQuantity = Number(p.quantity);
        const pAvgPrice = Number(p.averagePrice);
        const pnl = (quote.price - pAvgPrice) * pQuantity;
        return {
          symbol: p.symbol,
          instrumentId: String(p.instrumentId),
          quantity: pQuantity,
          averagePrice: pAvgPrice,
          currentPrice: quote.price,
          pnl,
          pnlPercent: pAvgPrice
            ? ((quote.price - pAvgPrice) / pAvgPrice) * 100
            : 0,
          side: p.side,
        };
      })
    );
  }

  async getOrders(userId: string): Promise<OrderDto[]> {
    const userQuery = this.buildUserQuery(userId);
    const orders = await Order.find(userQuery).sort({ createdAt: -1 }).limit(100);
    return orders.map(mapOrder);
  }

  async getOrder(userId: string, id: string): Promise<OrderDto | null> {
    const userQuery = this.buildUserQuery(userId);
    const order = await Order.findOne({ _id: id, ...userQuery });
    return order ? mapOrder(order) : null;
  }

  async placeOrder(userId: string, order: PlaceOrderRequest): Promise<OrderDto> {
    const symbol = order.symbol.toUpperCase();
    let instrument = await Instrument.findOne({
      symbol,
      isActive: true,
    });
    if (!instrument) {
      instrument = await Instrument.create({
        symbol,
        name: `${symbol} Ltd`,
        exchange: "NSE",
        segment: "EQ",
        lotSize: 1,
        tickSize: 0.05,
        isActive: true,
      });
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
      filledQuantity: order.quantity,
      price: order.price,
      triggerPrice: order.triggerPrice,
      averagePrice: fillPrice,
      status: "FILLED",
      executedAt: new Date(),
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
