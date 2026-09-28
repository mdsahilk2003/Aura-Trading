"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ChartTimeframe, QuoteDto, OhlcvBar } from "@aura/shared";
import { AppShell } from "@/components/layout/AppShell";
import { CandlestickChart } from "@/components/charts/CandlestickChart";
import { OrderPanel } from "@/components/orders/OrderPanel";
import { PriceChange } from "@/components/ui/price-change";
import { PnlBadge } from "@/components/ui/pnl-badge";
import { marketsService } from "@/services/markets";
import { watchlistService } from "@/services/watchlist";
import { portfolioService } from "@/services/portfolio";
import { ordersService } from "@/services/orders";
import { useMarketSocket } from "@/hooks/use-market-socket";
import {
  Bookmark,
  BookmarkCheck,
  Loader2,
  ArrowLeft,
  Activity,
  TrendingUp,
  TrendingDown,
  XCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function StockDetailPage() {
  const params = useParams();
  const symbol = String(params?.symbol || "RELIANCE").toUpperCase();
  const queryClient = useQueryClient();
  const [timeframe, setTimeframe] = useState<ChartTimeframe>("1D");

  const [liveQuote, setLiveQuote] = useState<QuoteDto | null>(null);
  const [liveBars, setLiveBars] = useState<OhlcvBar[]>([]);

  // Fetch Instrument Quote & Metadata (1.5s live polling fallback)
  const { data: symbolData, isLoading: loadingSymbol } = useQuery({
    queryKey: ["markets", "symbol", symbol],
    queryFn: () => marketsService.getSymbol(symbol),
    refetchInterval: 1500,
  });

  // Fetch Historical OHLCV Bars (3s live bar sync)
  const { data: historyData, isLoading: loadingHistory } = useQuery({
    queryKey: ["markets", "history", symbol, timeframe],
    queryFn: () => marketsService.history(symbol, timeframe),
    refetchInterval: 3000,
  });

  // Fetch User's Active Positions & Holdings
  const { data: positions = [] } = useQuery({
    queryKey: ["portfolio", "positions"],
    queryFn: portfolioService.getPositions,
    refetchInterval: 3000,
  });

  const { data: holdings = [] } = useQuery({
    queryKey: ["portfolio", "holdings"],
    queryFn: portfolioService.getHoldings,
    refetchInterval: 3000,
  });

  // Check Watchlist state
  const { data: watchlist = [] } = useQuery({
    queryKey: ["watchlist"],
    queryFn: watchlistService.getWatchlist,
  });

  const isInWatchlist = watchlist.some((item) => item.symbol === symbol);

  const toggleWatchlistMutation = useMutation({
    mutationFn: () =>
      isInWatchlist
        ? watchlistService.removeSymbol(symbol)
        : watchlistService.addSymbol(symbol),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });

  // Sync initial API responses to local state
  useEffect(() => {
    if (symbolData?.quote) {
      setLiveQuote((prev) => (prev ? prev : symbolData.quote));
    }
  }, [symbolData]);

  useEffect(() => {
    if (historyData?.bars) {
      setLiveBars(historyData.bars);
    }
  }, [historyData]);

  // Real-Time Socket Tick Handler
  const handleTick = useCallback((tick: QuoteDto) => {
    if (tick.symbol.toUpperCase() !== symbol.toUpperCase()) return;
    if (!tick.price || tick.price <= 0) return;
    setLiveQuote(tick);

    setLiveBars((prevBars) => {
      if (!prevBars.length) return prevBars;
      const updated = [...prevBars];
      const lastIdx = updated.length - 1;
      const lastBar = { ...updated[lastIdx] };

      const price = tick.price;
      lastBar.close = price;
      // Filter out extreme tick anomalies (>10% off bar open) from distorting candle high/low
      if (Math.abs(price - lastBar.open) / lastBar.open < 0.1) {
        lastBar.high = Math.max(lastBar.high, price);
        lastBar.low = Math.min(lastBar.low, price);
      }
      
      updated[lastIdx] = lastBar;
      return updated;
    });
  }, [symbol]);

  // Connect WebSocket stream for symbol
  const { connected: isSocketConnected } = useMarketSocket([symbol], handleTick);

  // Active Position check
  const activePosition =
    positions.find((p) => p.symbol === symbol) ||
    holdings.find((h) => h.symbol === symbol);

  // Live P&L Calculation
  const displayQuote = liveQuote || symbolData?.quote;
  const currentPrice = displayQuote?.price ?? activePosition?.currentPrice ?? 0;
  const avgPrice = activePosition?.averagePrice ?? 0;
  const quantity = activePosition?.quantity ?? 0;
  const livePnl = activePosition ? (currentPrice - avgPrice) * quantity : 0;
  const livePnlPercent =
    activePosition && avgPrice > 0 ? ((currentPrice - avgPrice) / avgPrice) * 100 : 0;
  const currentValue = currentPrice * quantity;

  const posSide = activePosition && "side" in activePosition ? activePosition.side : "BUY";

  // Square Off / Exit Position Mutation
  const squareOffMutation = useMutation({
    mutationFn: () =>
      ordersService.placeOrder({
        symbol,
        side: posSide === "SELL" ? "BUY" : "SELL",
        orderType: "MARKET",
        quantity: quantity,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const quote = displayQuote;
  const instrument = symbolData?.instrument;
  const bars = liveBars.length > 0 ? liveBars : historyData?.bars ?? [];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Navigation Back link & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/app/markets"
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-extrabold text-slate-950">
                  {symbol}
                </h1>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                  {instrument?.exchange || "NSE"}
                </span>
                <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                  {quote?.mode || "DEMO"}
                </span>
                <span
                  className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isSocketConnected
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isSocketConnected ? "bg-emerald-500 animate-ping" : "bg-slate-400"
                    }`}
                  />
                  {isSocketConnected ? "LIVE TICKS" : "CONNECTING"}
                </span>
              </div>
              <p className="text-xs text-slate-500">{instrument?.name || "Company Overview"}</p>
            </div>
          </div>

          {/* Price & Watchlist Button */}
          <div className="flex items-center gap-4">
            {quote && (
              <div className="text-right">
                <p className="font-mono-num font-extrabold text-xl text-slate-900 transition-colors duration-200">
                  ₹{quote.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <PriceChange change={quote.change} changePercent={quote.changePercent} />
              </div>
            )}

            <button
              disabled={toggleWatchlistMutation.isPending}
              onClick={() => toggleWatchlistMutation.mutate()}
              className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all ${
                isInWatchlist
                  ? "border-sky-200 bg-sky-50 text-sky-700"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {isInWatchlist ? (
                <>
                  <BookmarkCheck className="h-4 w-4 text-sky-600" />
                  <span>Watchlisted</span>
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4 text-slate-400" />
                  <span>Add Watchlist</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2-Column Main Layout: Candlestick Chart (Left) + Order & PnL Panel (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Candlestick Chart & Key Metrics */}
          <div className="lg:col-span-8 space-y-6">
            {/* Candlestick Interactive Component */}
            <div className="h-[460px] w-full">
              <CandlestickChart
                symbol={symbol}
                data={bars}
                timeframe={timeframe}
                onTimeframeChange={setTimeframe}
                isLoading={loadingHistory || loadingSymbol}
              />
            </div>

            {/* Key Market OHLC Metrics Grid */}
            {quote && (
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-display text-sm font-bold text-slate-900">
                    Live Market Statistics
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Updated: {new Date(quote.timestamp || Date.now()).toLocaleTimeString()}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Open</span>
                    <p className="font-mono-num font-bold text-slate-900 mt-0.5">₹{quote.open.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">High</span>
                    <p className="font-mono-num font-bold text-emerald-600 mt-0.5">₹{quote.high.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Low</span>
                    <p className="font-mono-num font-bold text-rose-600 mt-0.5">₹{quote.low.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Prev Close</span>
                    <p className="font-mono-num font-bold text-slate-900 mt-0.5">₹{quote.previousClose.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Active Position Live P&L Widget + Trade Panel */}
          <div className="lg:col-span-4 space-y-4 sticky top-20">
            {/* Active Position Real-Time P&L Box */}
            {activePosition && (
              <div className="rounded-2xl border border-sky-200 bg-gradient-to-b from-sky-50/80 to-white p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="font-display text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Active Position ({symbol})
                    </span>
                  </div>
                  <span className="rounded bg-sky-100 text-sky-800 text-[10px] font-extrabold px-2 py-0.5">
                    {"side" in activePosition ? activePosition.side : "HOLDING"}
                  </span>
                </div>

                {/* Real-time PnL Main Badge */}
                <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-slate-100 shadow-2xs">
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Real-Time P&L</p>
                    <div className="mt-0.5">
                      <PnlBadge amount={livePnl} percentage={livePnlPercent} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Current Value</p>
                    <p className="font-mono-num font-extrabold text-sm text-slate-900 mt-0.5">
                      ₹{currentValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                {/* Position Details Grid */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 font-mono-num">
                  <div>
                    <span className="text-slate-400 text-[10px] font-sans block">Qty Held</span>
                    <span className="font-bold text-slate-900">{quantity} Shares</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-sans block">Avg Buy Price</span>
                    <span className="font-bold text-slate-900">₹{avgPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Quick Square Off / Exit Button */}
                <button
                  disabled={squareOffMutation.isPending}
                  onClick={() => squareOffMutation.mutate()}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 transition-all shadow-xs"
                >
                  {squareOffMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-rose-400" />
                      <span>SQUARE OFF POSITION (SELL ALL)</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Trade Order Panel */}
            <OrderPanel
              symbol={symbol}
              currentPrice={currentPrice || 1000}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

