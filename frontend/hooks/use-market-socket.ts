"use client";

import { useEffect, useRef } from "react";
import type { QuoteDto } from "@aura/shared";
import { WS_EVENTS } from "@aura/shared";
import { useSocket } from "@/providers/socket-provider";

export function useMarketSocket(
  symbols: string[],
  onQuote: (quote: QuoteDto) => void
) {
  const { socket, connected } = useSocket();
  const onQuoteRef = useRef(onQuote);
  onQuoteRef.current = onQuote;

  const key = symbols
    .map((s) => s.toUpperCase())
    .filter(Boolean)
    .sort()
    .join(",");

  useEffect(() => {
    if (!socket || !connected || !key) return;

    const list = key.split(",");

    const handler = (quote: QuoteDto) => {
      if (list.includes(quote.symbol.toUpperCase())) {
        onQuoteRef.current(quote);
      }
    };

    socket.emit(WS_EVENTS.SUBSCRIBE, { symbols: list });
    socket.on(WS_EVENTS.QUOTE, handler);

    return () => {
      socket.emit(WS_EVENTS.UNSUBSCRIBE, { symbols: list });
      socket.off(WS_EVENTS.QUOTE, handler);
    };
  }, [socket, connected, key]);

  return { connected };
}
