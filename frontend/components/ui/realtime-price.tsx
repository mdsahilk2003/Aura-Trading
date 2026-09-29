"use client";

import { useEffect, useRef, useState } from "react";
import { cn, formatNumber } from "@/lib/utils";

interface RealtimePriceProps {
  price: number;
  className?: string;
  textSize?: string;
  currencyPrefix?: string;
}

export function RealtimePrice({
  price,
  className = "",
  textSize = "text-xl",
  currencyPrefix = "₹",
}: RealtimePriceProps) {
  const prevPriceRef = useRef<number>(price);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (prevPriceRef.current !== undefined && price !== prevPriceRef.current) {
      if (price > prevPriceRef.current) {
        setFlash("up");
      } else if (price < prevPriceRef.current) {
        setFlash("down");
      }
      prevPriceRef.current = price;

      const timer = setTimeout(() => {
        setFlash(null);
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [price]);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-mono-num font-extrabold transition-all duration-300 rounded-lg px-2 py-0.5",
        textSize,
        flash === "up" && "bg-emerald-500/20 text-emerald-600 scale-105 shadow-sm shadow-emerald-500/20 ring-1 ring-emerald-500/40",
        flash === "down" && "bg-rose-500/20 text-rose-600 scale-105 shadow-sm shadow-rose-500/20 ring-1 ring-rose-500/40",
        !flash && "text-slate-900",
        className
      )}
    >
      <span>{currencyPrefix}</span>
      <span>{formatNumber(price)}</span>
    </span>
  );
}
