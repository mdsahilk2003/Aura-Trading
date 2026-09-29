"use client";

import Link from "next/link";
import { TrendingUp } from "lucide-react";

interface AuraLogoProps {
  href?: string;
  className?: string;
  iconSize?: string;
  textSize?: string;
  dark?: boolean;
}

export function AuraLogo({
  href = "/",
  className = "",
  iconSize = "h-5 w-5",
  textSize = "text-xl",
  dark = false,
}: AuraLogoProps) {
  return (
    <Link href={href} className={`flex items-center gap-2.5 group ${className}`}>
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl shadow-md transition-transform group-hover:scale-105 ${
          dark
            ? "bg-sky-500 text-slate-950 shadow-sky-500/20"
            : "bg-slate-950 text-sky-400 shadow-slate-950/20"
        }`}
      >
        <TrendingUp className={iconSize} />
      </div>
      <span
        className={`font-display ${textSize} font-extrabold tracking-tight ${
          dark ? "text-white" : "text-slate-950"
        }`}
      >
        AURA<span className={dark ? "text-sky-400" : "text-sky-600"}>.</span>
      </span>
    </Link>
  );
}
