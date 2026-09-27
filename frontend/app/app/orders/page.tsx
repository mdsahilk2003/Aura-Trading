"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ClipboardList, Search, X, Loader2, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/input";
import { ordersService } from "@/services/orders";

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [filterSide, setFilterSide] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const { data: ordersData, isLoading, refetch } = useQuery({
    queryKey: ["orders", { side: filterSide, search }],
    queryFn: () =>
      ordersService.getOrders({
        side: filterSide !== "ALL" ? (filterSide as "BUY" | "SELL") : undefined,
        search: search || undefined,
        limit: 50,
      }),
  });

  const cancelOrderMutation = useMutation({
    mutationFn: (id: string) => ordersService.cancelOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
    },
  });

  const orders = ordersData?.orders ?? [];

  return (
    <AppShell>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-950">
              Order History & Execution
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Audit log of all placed MARKET, LIMIT, and STOP LOSS orders
            </p>
          </div>

          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
            <span>Refresh Orders</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Side Tabs */}
            <div className="flex gap-1.5 rounded-xl bg-slate-100 p-1">
              {["ALL", "BUY", "SELL"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterSide(s)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                    filterSide === s
                      ? "bg-slate-950 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search order symbol..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="pb-3">Order ID & Date</th>
                  <th className="pb-3">Symbol</th>
                  <th className="pb-3">Side</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3 text-right">Quantity</th>
                  <th className="pb-3 text-right">Price / LTP</th>
                  <th className="pb-3 text-right">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {isLoading ? (
                  <tr><td colSpan={8} className="py-12 text-center text-slate-400">Loading orders...</td></tr>
                ) : orders.length > 0 ? (
                  orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50">
                      <td className="py-3">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          #{ord.id.slice(-6).toUpperCase()}
                        </span>
                        <p className="text-[10px] text-slate-400 font-mono-num">
                          {new Date(ord.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                        </p>
                      </td>
                      <td className="py-3 font-bold text-slate-900">{ord.symbol}</td>
                      <td className="py-3">
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${ord.side === "BUY" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                          {ord.side}
                        </span>
                      </td>
                      <td className="py-3 font-semibold text-slate-600">{ord.orderType}</td>
                      <td className="py-3 text-right font-mono-num font-bold">{ord.quantity}</td>
                      <td className="py-3 text-right font-mono-num font-bold text-slate-900">
                        ₹{(ord.averagePrice || ord.price || 0).toFixed(2)}
                      </td>
                      <td className="py-3 text-right">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                            ord.status === "FILLED"
                              ? "bg-emerald-100 text-emerald-800"
                              : ord.status === "PENDING" || ord.status === "OPEN"
                              ? "bg-amber-100 text-amber-800 animate-pulse"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {(ord.status === "OPEN" || ord.status === "PENDING") && (
                          <button
                            disabled={cancelOrderMutation.isPending}
                            onClick={() => cancelOrderMutation.mutate(ord.id)}
                            className="rounded bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-100"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No order records found matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
