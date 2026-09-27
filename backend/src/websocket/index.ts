import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { WS_EVENTS } from "@aura/shared";
import { env } from "../config/env";
import { verifyToken, hashToken } from "../utils/jwt";
import { Session } from "../models/Session";
import { User } from "../models/User";
import { appContext } from "../config/context";

/** Per-symbol subscriber counts across sockets */
const symbolRefCounts = new Map<string, number>();
const socketSymbols = new Map<string, Set<string>>();

export function createWebsocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN.split(",").map((s) => s.trim()),
      credentials: true,
    },
  });

  appContext.bindIo(io);

  io.use(async (socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie || "";
      const match = cookieHeader
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith(`${env.JWT_COOKIE_NAME}=`));
      const token =
        match?.split("=")[1] ||
        (socket.handshake.auth?.token as string | undefined);

      if (token) {
        const payload = verifyToken(token);
        const session = await Session.findOne({
          tokenHash: hashToken(token),
          revokedAt: { $exists: false },
        });
        if (session && session.expiresAt >= new Date()) {
          const user = await User.findById(payload.sub);
          if (user) {
            socket.data.userId = user.id;
          }
        }
      }
    } catch {
      // Allow connection as guest for public market data
    }
    return next();
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId as string | undefined;
    if (userId) {
      socket.join(`user:${userId}`);
    }
    socketSymbols.set(socket.id, new Set());

    socket.on(WS_EVENTS.SUBSCRIBE, async (payload: { symbols?: string[] }) => {
      const symbols = (payload?.symbols || []).map((s) => s.toUpperCase());
      const set = socketSymbols.get(socket.id)!;
      for (const symbol of symbols) {
        if (set.has(symbol)) continue;
        set.add(symbol);
        socket.join(`symbol:${symbol}`);
        const count = (symbolRefCounts.get(symbol) || 0) + 1;
        symbolRefCounts.set(symbol, count);
        if (count === 1) {
          await appContext.marketData.subscribe([symbol]);
        }
      }
    });

    socket.on(WS_EVENTS.UNSUBSCRIBE, async (payload: { symbols?: string[] }) => {
      const symbols = (payload?.symbols || []).map((s) => s.toUpperCase());
      await releaseSymbols(socket.id, symbols);
    });

    socket.on("disconnect", async () => {
      const set = socketSymbols.get(socket.id);
      if (set) {
        await releaseSymbols(socket.id, [...set]);
        socketSymbols.delete(socket.id);
      }
    });
  });

  // Fan-out quotes only for subscribed symbols
  setInterval(async () => {
    const symbols = [...symbolRefCounts.keys()];
    if (!symbols.length) return;
    try {
      const quotes = await appContext.marketData.getQuotes(symbols);
      for (const quote of quotes) {
        io.to(`symbol:${quote.symbol}`).emit(WS_EVENTS.QUOTE, quote);
      }
    } catch (err) {
      console.error("WS quote tick failed", err);
    }
  }, 1200);

  return io;
}

async function releaseSymbols(socketId: string, symbols: string[]) {
  const set = socketSymbols.get(socketId);
  for (const symbol of symbols) {
    set?.delete(symbol);
    const count = (symbolRefCounts.get(symbol) || 1) - 1;
    if (count <= 0) {
      symbolRefCounts.delete(symbol);
      await appContext.marketData.unsubscribe([symbol]);
    } else {
      symbolRefCounts.set(symbol, count);
    }
  }
}
