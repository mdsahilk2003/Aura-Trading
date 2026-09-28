"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { OrderSide, OrderType } from "@aura/shared";
import { ordersService } from "@/services/orders";
import { portfolioService } from "@/services/portfolio";
import { AddMoneyModal } from "@/components/funds/AddMoneyModal";
import { useAuth } from "@/providers/auth-provider";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowUpRight, ArrowDownRight, Wallet, CheckCircle2, AlertCircle, PlusCircle, LogIn } from "lucide-react";

interface OrderPanelProps {
  symbol: string;
  currentPrice: number;
  onSuccess?: () => void;
}

export function OrderPanel({ symbol, currentPrice, onSuccess }: OrderPanelProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [side, setSide] = useState<OrderSide>("BUY");
  const [orderType, setOrderType] = useState<OrderType>("MARKET");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(currentPrice);
  const [triggerPrice, setTriggerPrice] = useState(currentPrice);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [addMoneyOpen, setAddMoneyOpen] = useState(false);

  const { data: portfolio } = useQuery({
    queryKey: ["portfolio"],
    queryFn: portfolioService.getPortfolio,
    refetchInterval: 3000,
  });

  const effectivePrice = orderType === "MARKET" ? currentPrice : price;
  const estimatedValue = effectivePrice * quantity;
  const availableFunds = portfolio?.availableFunds ?? 0;

  const placeOrderMutation = useMutation({
    mutationFn: () =>
      ordersService.placeOrder({
        symbol,
        side,
        orderType,
        quantity,
        price: orderType !== "MARKET" ? price : undefined,
        triggerPrice: orderType.includes("STOP") ? triggerPrice : undefined,
      }),
    onSuccess: (data) => {
      setStatusMsg({
        type: "success",
        text: `Order #${data.id.slice(-6).toUpperCase()} placed (${side} ${quantity} ${symbol} @ ₹${(data.averagePrice || effectivePrice).toFixed(2)})`,
      });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio", "holdings"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio", "positions"] });
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      queryClient.invalidateQueries({ queryKey: ["markets"] });
      onSuccess?.();
    },
    onError: (err: any) => {
      setStatusMsg({
        type: "error",
        text: err.message || "Failed to place order",
      });
    },
  });

  return (
    <div className="flex flex-col w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-display text-sm font-bold text-slate-900">Trade {symbol}</h3>
          <p className="text-[11px] text-slate-500 font-mono-num">
            LTP: ₹{currentPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddMoneyOpen(true)}
          className="flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 font-semibold transition-colors"
        >
          <Wallet className="h-3.5 w-3.5 text-emerald-600" />
          <span>₹{availableFunds.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
          <PlusCircle className="h-3.5 w-3.5 text-emerald-600 ml-0.5" />
        </button>
      </div>

      {/* Buy / Sell Toggle Tabs */}
      <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => { setSide("BUY"); setStatusMsg(null); }}
          className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${
            side === "BUY"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <ArrowUpRight className="h-4 w-4" />
          <span>BUY</span>
        </button>
        <button
          type="button"
          onClick={() => { setSide("SELL"); setStatusMsg(null); }}
          className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${
            side === "SELL"
              ? "bg-rose-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <ArrowDownRight className="h-4 w-4" />
          <span>SELL</span>
        </button>
      </div>

      {/* Order Type Selector */}
      <div className="space-y-1">
        <label className="text-[11px] font-semibold text-slate-600">Order Type</label>
        <select
          value={orderType}
          onChange={(e) => setOrderType(e.target.value as OrderType)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-sky-500"
        >
          <option value="MARKET">MARKET (Instant execution)</option>
          <option value="LIMIT">LIMIT (Specified price)</option>
          <option value="STOP_LOSS">STOP LOSS (Trigger price)</option>
          <option value="STOP_LOSS_LIMIT">STOP LOSS LIMIT (Trigger + Limit)</option>
        </select>
      </div>

      {/* Quantity Input */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <label className="text-[11px] font-semibold text-slate-600">Quantity</label>
          <div className="flex gap-1">
            {[1, 5, 10, 50].map((qty) => (
              <button
                key={qty}
                type="button"
                onClick={() => setQuantity(qty)}
                className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-200"
              >
                +{qty}
              </button>
            ))}
          </div>
        </div>
        <Input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          className="font-mono-num text-xs font-bold"
        />
      </div>

      {/* Limit Price Input if LIMIT */}
      {orderType !== "MARKET" && (
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-600">Limit Price (₹)</label>
          <Input
            type="number"
            step="0.05"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value) || currentPrice)}
            className="font-mono-num text-xs font-bold"
          />
        </div>
      )}

      {/* Trigger Price if STOP LOSS */}
      {orderType.includes("STOP") && (
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-600">Trigger Price (₹)</label>
          <Input
            type="number"
            step="0.05"
            value={triggerPrice}
            onChange={(e) => setTriggerPrice(parseFloat(e.target.value) || currentPrice)}
            className="font-mono-num text-xs font-bold"
          />
        </div>
      )}

      {/* Summary Box */}
      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-1.5">
        <div className="flex justify-between text-xs text-slate-500">
          <span>Est. Value</span>
          <span className="font-bold text-slate-900 font-mono-num">
            ₹{estimatedValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>Broker Fee</span>
          <span className="font-semibold text-emerald-600">₹0.00 (Zero Brokerage)</span>
        </div>
      </div>

      {/* Feedback Message */}
      {statusMsg && (
        <div
          className={`flex items-start gap-2 rounded-xl p-3 text-xs leading-relaxed ${
            statusMsg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Submit Button or Add Money Button or Sign In Button */}
      {!user ? (
        <div className="space-y-2">
          <Link
            href={`/login?next=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/app")}`}
            className="block w-full"
          >
            <Button
              type="button"
              className="w-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs h-11 transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <LogIn className="h-4 w-4 text-sky-400" />
              <span>SIGN IN TO TRADE {symbol}</span>
            </Button>
          </Link>
          <p className="text-[11px] text-slate-500 text-center">
            You must be logged in to buy or sell stocks
          </p>
        </div>
      ) : side === "BUY" && estimatedValue > availableFunds ? (
        <div className="space-y-2">
          <Button
            type="button"
            onClick={() => setAddMoneyOpen(true)}
            className="w-full font-bold text-xs h-11 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <PlusCircle className="h-4 w-4" />
            <span>ADD MONEY TO BUY (Need ₹{(estimatedValue - availableFunds).toLocaleString("en-IN", { maximumFractionDigits: 2 })})</span>
          </Button>
          <p className="text-[11px] text-rose-500 text-center font-medium">
            Available balance is ₹{availableFunds.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </p>
        </div>
      ) : (
        <Button
          disabled={placeOrderMutation.isPending}
          onClick={() => placeOrderMutation.mutate()}
          className={`w-full font-bold text-xs h-11 transition-all ${
            side === "BUY"
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "bg-rose-600 hover:bg-rose-700 text-white"
          }`}
        >
          {placeOrderMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            `SUBMIT ${side} ORDER`
          )}
        </Button>
      )}

      {/* Add Money Modal */}
      <AddMoneyModal
        open={addMoneyOpen}
        onClose={() => setAddMoneyOpen(false)}
        defaultAmount={Math.max(1000, Math.ceil(estimatedValue - availableFunds))}
      />
    </div>
  );
}
