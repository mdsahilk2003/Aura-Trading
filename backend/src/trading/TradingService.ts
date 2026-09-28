import { DEFAULT_PAPER_FUNDS, ERROR_CODES, type ModifyOrderRequest, type PlaceOrderRequest } from "@aura/shared";
import type { BrokerManager } from "../brokers/BrokerManager";
import type { MarketDataService } from "../market-data/MarketDataService";
import { AppError } from "../utils/errors";
import { RiskManager } from "./RiskManager";
import { Instrument } from "../models/Instrument";
import { Holding } from "../models/Holding";
import { Position } from "../models/Position";
import { Trade } from "../models/Trade";
import { Wallet } from "../models/Wallet";
import { WalletTransaction } from "../models/WalletTransaction";
import { Portfolio } from "../models/Portfolio";
import { Order } from "../models/Order";
import { AuditLog } from "../models/AuditLog";
import { Notification } from "../models/Notification";
import type { Server as SocketServer } from "socket.io";
import { WS_EVENTS } from "@aura/shared";

export class TradingService {
  private risk = new RiskManager();

  constructor(
    private brokerManager: BrokerManager,
    private marketData: MarketDataService,
    private io?: SocketServer
  ) {}

  setIo(io: SocketServer) {
    this.io = io;
  }

  async ensureWallet(userId: string) {
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await Wallet.create({
        userId,
        balance: DEFAULT_PAPER_FUNDS,
        currency: "INR",
      });
      await WalletTransaction.create({
        userId,
        walletId: wallet._id,
        type: "CREDIT",
        amount: DEFAULT_PAPER_FUNDS,
        balanceAfter: DEFAULT_PAPER_FUNDS,
        reference: "PAPER_SEED",
        meta: { mode: "PAPER" },
      });
      await Portfolio.create({ userId, invested: 0, snapshotValue: 0 });
    }
    return wallet;
  }

  async placeOrder(
    userId: string,
    input: PlaceOrderRequest,
    options?: { isBot?: boolean }
  ) {
    const symbol = input.symbol.toUpperCase();
    let instrument = await Instrument.findOne({ symbol, isActive: true });
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

    const quote = await this.marketData.getQuote(symbol);
    const unitPrice =
      input.orderType === "MARKET" ? quote.price : input.price ?? quote.price;
    const estimatedValue = unitPrice * input.quantity;

    const wallet = await this.ensureWallet(userId);

    if (input.side === "SELL") {
      const holding = await Holding.findOne({ userId, symbol });
      const position = await Position.findOne({ userId, symbol });
      const availableQty = holding?.quantity || position?.quantity || 0;
      if (availableQty < input.quantity) {
        throw new AppError(
          "Insufficient holdings to sell",
          422,
          ERROR_CODES.INSUFFICIENT_HOLDINGS
        );
      }
    }

    await this.risk.validate({
      userId,
      order: { ...input, symbol },
      estimatedValue,
      availableFunds: wallet.balance,
      isBot: options?.isBot,
    });

    const broker = this.brokerManager.getAdapter();
    const orderDto = await broker.placeOrder(userId, { ...input, symbol });

    // Sync local order for paper fills (broker may have created it)
    const order = await Order.findById(orderDto.id);
    if (!order) {
      throw new AppError("Order persistence failed", 500, ERROR_CODES.INTERNAL_ERROR);
    }

    if (order.status === "FILLED") {
      await this.settleFill(userId, order);
      await this.notify(userId, {
        type: "ORDER_FILLED",
        title: "Order filled",
        message: `${order.side} ${order.quantity} ${order.symbol} @ ${order.averagePrice}`,
        meta: { orderId: order.id },
      });
    }

    await AuditLog.create({
      userId,
      action: "ORDER_PLACE",
      resource: "Order",
      resourceId: order.id,
      meta: { symbol, side: order.side, quantity: order.quantity },
    });

    this.io?.to(`user:${userId}`).emit(WS_EVENTS.ORDER_UPDATE, orderDto);
    return orderDto;
  }

  private async settleFill(
    userId: string,
    order: InstanceType<typeof Order>
  ) {
    const fillPrice = order.averagePrice ?? 0;
    const value = fillPrice * order.quantity;
    const wallet = await this.ensureWallet(userId);

    if (order.side === "BUY") {
      if (wallet.balance < value) {
        order.status = "FAILED";
        order.rejectionReason = "Insufficient funds at settlement";
        await order.save();
        throw new AppError("Insufficient funds", 422, ERROR_CODES.INSUFFICIENT_FUNDS);
      }
      wallet.balance -= value;
      await wallet.save();
      await WalletTransaction.create({
        userId,
        walletId: wallet._id,
        type: "TRADE_SETTLE",
        amount: -value,
        balanceAfter: wallet.balance,
        reference: order.id,
      });

      let totalQty = order.quantity;
      let newAvgPrice = fillPrice;

      const existing = await Holding.findOne({ userId, symbol: order.symbol });
      if (existing) {
        totalQty = existing.quantity + order.quantity;
        newAvgPrice = (existing.averagePrice * existing.quantity + value) / totalQty;
        existing.averagePrice = newAvgPrice;
        existing.quantity = totalQty;
        await existing.save();
      } else {
        await Holding.create({
          userId,
          instrumentId: order.instrumentId,
          symbol: order.symbol,
          quantity: totalQty,
          averagePrice: fillPrice,
        });
      }

      await Position.findOneAndUpdate(
        { userId, symbol: order.symbol },
        {
          userId,
          instrumentId: order.instrumentId,
          symbol: order.symbol,
          quantity: totalQty,
          averagePrice: newAvgPrice,
          side: "BUY",
        },
        { upsert: true }
      );
    } else {
      const holding = await Holding.findOne({ userId, symbol: order.symbol });
      if (!holding || holding.quantity < order.quantity) {
        order.status = "FAILED";
        await order.save();
        throw new AppError(
          "Insufficient holdings",
          422,
          ERROR_CODES.INSUFFICIENT_HOLDINGS
        );
      }
      holding.quantity -= order.quantity;
      if (holding.quantity <= 0) {
        await holding.deleteOne();
        await Position.deleteOne({ userId, symbol: order.symbol });
      } else {
        await holding.save();
        await Position.findOneAndUpdate(
          { userId, symbol: order.symbol },
          { quantity: holding.quantity, averagePrice: holding.averagePrice }
        );
      }
      wallet.balance += value;
      await wallet.save();
      await WalletTransaction.create({
        userId,
        walletId: wallet._id,
        type: "TRADE_SETTLE",
        amount: value,
        balanceAfter: wallet.balance,
        reference: order.id,
      });
    }

    await Trade.create({
      userId,
      orderId: order._id,
      instrumentId: order.instrumentId,
      symbol: order.symbol,
      side: order.side,
      quantity: order.quantity,
      price: fillPrice,
      value,
      executedAt: new Date(),
    });

    const portfolio = await Portfolio.findOne({ userId });
    if (portfolio) {
      const holdings = await Holding.find({ userId });
      portfolio.invested = holdings.reduce(
        (sum, h) => sum + h.quantity * h.averagePrice,
        0
      );
      await portfolio.save();
    }
  }

  async modifyOrder(userId: string, id: string, patch: ModifyOrderRequest) {
    const existing = await Order.findOne({ _id: id, userId });
    if (!existing) {
      throw new AppError("Order not found", 404, ERROR_CODES.NOT_FOUND);
    }
    const updated = await this.brokerManager.getAdapter().modifyOrder(userId, id, patch);
    await AuditLog.create({
      userId,
      action: "ORDER_MODIFY",
      resource: "Order",
      resourceId: id,
      meta: { patch },
    });
    this.io?.to(`user:${userId}`).emit(WS_EVENTS.ORDER_UPDATE, updated);
    return updated;
  }

  async cancelOrder(userId: string, id: string) {
    const existing = await Order.findOne({ _id: id, userId });
    if (!existing) {
      throw new AppError("Order not found", 404, ERROR_CODES.NOT_FOUND);
    }
    const cancelled = await this.brokerManager.getAdapter().cancelOrder(userId, id);
    await AuditLog.create({
      userId,
      action: "ORDER_CANCEL",
      resource: "Order",
      resourceId: id,
      meta: { symbol: cancelled.symbol, side: cancelled.side },
    });
    await this.notify(userId, {
      type: "ORDER_CANCELLED",
      title: "Order cancelled",
      message: `Cancelled ${cancelled.side} ${cancelled.symbol}`,
      meta: { orderId: cancelled.id },
    });
    this.io?.to(`user:${userId}`).emit(WS_EVENTS.ORDER_UPDATE, cancelled);
    return cancelled;
  }

  async getOrders(
    userId: string,
    filters: {
      page: number;
      limit: number;
      side?: string;
      status?: string;
      search?: string;
    }
  ) {
    const query: Record<string, unknown> = { userId };
    if (filters.side) query.side = filters.side;
    if (filters.status) query.status = filters.status;
    if (filters.search) {
      query.symbol = { $regex: filters.search, $options: "i" };
    }
    const skip = (filters.page - 1) * filters.limit;
    const [items, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(filters.limit),
      Order.countDocuments(query),
    ]);
    return {
      items: items.map((o) => ({
        id: o.id,
        brokerOrderId: o.brokerOrderId,
        instrumentId: String(o.instrumentId),
        symbol: o.symbol,
        side: o.side,
        orderType: o.orderType,
        quantity: o.quantity,
        filledQuantity: o.filledQuantity,
        price: o.price,
        triggerPrice: o.triggerPrice,
        averagePrice: o.averagePrice,
        status: o.status,
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
        executedAt: o.executedAt?.toISOString() ?? null,
      })),
      total,
      page: filters.page,
      limit: filters.limit,
    };
  }

  async getOrder(userId: string, id: string) {
    const order = await Order.findOne({ _id: id, userId });
    if (!order) throw new AppError("Order not found", 404, ERROR_CODES.NOT_FOUND);
    return {
      id: order.id,
      brokerOrderId: order.brokerOrderId,
      instrumentId: String(order.instrumentId),
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

  private async notify(
    userId: string,
    payload: {
      type: "ORDER_FILLED" | "ORDER_REJECTED" | "ORDER_CANCELLED" | "BOT_STARTED" | "BOT_STOPPED" | "BROKER_CONNECTION" | "SYSTEM_ALERT";
      title: string;
      message: string;
      meta?: Record<string, unknown>;
    }
  ) {
    const n = await Notification.create({ userId, ...payload, read: false });
    this.io?.to(`user:${userId}`).emit(WS_EVENTS.NOTIFICATION, {
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
      meta: n.meta,
    });
  }
}
