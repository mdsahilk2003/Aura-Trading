"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { portfolioService } from "@/services/portfolio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  X,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  CreditCard,
  QrCode,
  Building2,
  Sparkles,
} from "lucide-react";

interface AddMoneyModalProps {
  open: boolean;
  onClose: () => void;
  defaultAmount?: number;
}

const PRESET_AMOUNTS = [1000, 5000, 10000, 25000, 50000, 100000];

export function AddMoneyModal({ open, onClose, defaultAmount = 10000 }: AddMoneyModalProps) {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState<number>(defaultAmount);
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "CARD" | "NET_BANKING">("UPI");
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const depositMutation = useMutation({
    mutationFn: (depositAmount: number) => portfolioService.depositFunds(depositAmount),
    onSuccess: (data) => {
      setStatusMsg({
        type: "success",
        text: data.message || `₹${amount.toLocaleString("en-IN")} added successfully to wallet!`,
      });
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["funds"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio", "holdings"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio", "positions"] });
      setTimeout(() => {
        setStatusMsg(null);
        onClose();
      }, 1500);
    },
    onError: (err: any) => {
      setStatusMsg({
        type: "error",
        text: err.message || "Failed to deposit funds. Please try again.",
      });
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 translate-x-4 -translate-y-4 opacity-10">
            <Wallet className="h-32 w-32 text-sky-400" />
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          
          <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="h-4 w-4" />
            <span>Instant Deposit</span>
          </div>
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-white">
            Add Money to Wallet
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Deposit funds instantly via UPI, Card, or Net Banking to start trading
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {/* Quick Preset Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Select Amount</label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => { setAmount(amt); setStatusMsg(null); }}
                  className={`rounded-xl py-2 px-3 text-xs font-bold transition-all border ${
                    amount === amt
                      ? "border-sky-600 bg-sky-50 text-sky-700 shadow-xs"
                      : "border-slate-200 bg-slate-50/50 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  +₹{amt.toLocaleString("en-IN")}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Custom Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                ₹
              </span>
              <Input
                type="number"
                min={100}
                max={10000000}
                value={amount || ""}
                onChange={(e) => {
                  setAmount(Math.max(0, parseInt(e.target.value) || 0));
                  setStatusMsg(null);
                }}
                className="pl-8 text-lg font-bold font-mono-num border-slate-200 h-12 rounded-xl focus:border-sky-500"
                placeholder="Enter deposit amount"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Payment Mode</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("UPI")}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl p-2.5 text-xs font-semibold transition-all border ${
                  paymentMethod === "UPI"
                    ? "border-emerald-600 bg-emerald-50/80 text-emerald-800"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <QrCode className="h-4 w-4 text-emerald-600" />
                <span>UPI / GPay</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("CARD")}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl p-2.5 text-xs font-semibold transition-all border ${
                  paymentMethod === "CARD"
                    ? "border-emerald-600 bg-emerald-50/80 text-emerald-800"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <CreditCard className="h-4 w-4 text-sky-600" />
                <span>Debit / Credit</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("NET_BANKING")}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl p-2.5 text-xs font-semibold transition-all border ${
                  paymentMethod === "NET_BANKING"
                    ? "border-emerald-600 bg-emerald-50/80 text-emerald-800"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Building2 className="h-4 w-4 text-purple-600" />
                <span>Net Banking</span>
              </button>
            </div>
          </div>

          {/* Status Message */}
          {statusMsg && (
            <div
              className={`flex items-start gap-2.5 rounded-xl p-3 text-xs leading-relaxed ${
                statusMsg.type === "success"
                  ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                  : "bg-rose-50 text-rose-900 border border-rose-200"
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

          {/* Action Button */}
          <Button
            disabled={depositMutation.isPending || amount <= 0}
            onClick={() => depositMutation.mutate(amount)}
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
          >
            {depositMutation.isPending ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Processing Payment...</span>
              </div>
            ) : (
              `PAY & ADD ₹${amount.toLocaleString("en-IN")} TO WALLET`
            )}
          </Button>

          {/* Security Disclaimer */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>256-bit Encrypted Instant Trading Wallet Deposit</span>
          </div>
        </div>
      </div>
    </div>
  );
}
