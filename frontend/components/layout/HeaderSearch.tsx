"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, ArrowRight } from "lucide-react";
import { marketsService, type MarketSearchItem } from "@/services/markets";
import { PriceChange } from "@/components/ui/price-change";

export function HeaderSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MarketSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search logic with debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await marketsService.search(query.trim());
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (symbol: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/app/markets/${encodeURIComponent(symbol)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Enter" && query.trim()) {
      if (results.length > 0) {
        handleSelect(results[0].symbol);
      } else {
        router.push("/app/markets");
        setIsOpen(false);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-md mx-4 hidden sm:block">
      {/* Search Input Field */}
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search symbol or company (e.g. RELIANCE, NIFTY)..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50/90 pl-10 pr-9 py-1.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all shadow-xs"
        />
        {loading ? (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-slate-400" />
        ) : query ? (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      {/* Live Search Results Dropdown Menu */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-100 max-h-80 overflow-y-auto">
          {results.length > 0 ? (
            <div className="space-y-0.5">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Matching Instruments
              </div>
              {results.map((item) => (
                <button
                  key={item.id || item.symbol}
                  onClick={() => handleSelect(item.symbol)}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 hover:bg-slate-50 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 font-bold text-xs text-slate-800">
                      {item.symbol.substring(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                          {item.symbol}
                        </span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                          {item.exchange || "NSE"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate max-w-[200px]">{item.name}</p>
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
                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-sky-600 transition-colors" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-400">
              {loading ? "Searching live instruments..." : `No instruments found matching "${query}"`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
