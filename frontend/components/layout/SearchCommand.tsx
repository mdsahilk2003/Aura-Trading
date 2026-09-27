"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, TrendingUp, ArrowRight, Loader2 } from "lucide-react";
import { marketsService, type MarketSearchItem } from "@/services/markets";
import { PriceChange } from "@/components/ui/price-change";

interface SearchCommandProps {
  open: boolean;
  onClose: () => void;
}

export function SearchCommand({ open, onClose }: SearchCommandProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MarketSearchItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) onClose();
        else {
          // Open handled outside or via trigger
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await marketsService.search(query || "");
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl animate-in zoom-in-95 duration-150 overflow-hidden">
        {/* Input Bar */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search symbol (e.g. RELIANCE, TCS, INFY, NIFTY)..."
            className="flex-1 text-sm outline-none placeholder:text-slate-400 font-medium text-slate-900 bg-transparent"
            autoFocus
          />
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
          ) : query ? (
            <button onClick={() => setQuery("")} className="text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          ) : (
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
              ESC
            </span>
          )}
        </div>

        {/* Results List */}
        <div className="mt-3 max-h-80 overflow-y-auto space-y-1 pr-1">
          {results.length > 0 ? (
            results.map((item) => (
              <button
                key={item.id || item.symbol}
                onClick={() => {
                  onClose();
                  router.push(`/app/markets/${encodeURIComponent(item.symbol)}`);
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 hover:bg-slate-50 transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 font-bold text-xs text-slate-800">
                    {item.symbol.substring(0, 3)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{item.symbol}</span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                        {item.exchange || "NSE"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate max-w-[240px]">{item.name}</p>
                  </div>
                </div>

                {item.quote ? (
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-900 font-mono-num">
                      ₹{item.quote.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </p>
                    <PriceChange change={item.quote.change} changePercent={item.quote.changePercent} />
                  </div>
                ) : (
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                )}
              </button>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              {loading ? "Searching live instruments..." : "Type a symbol or company name to search"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
