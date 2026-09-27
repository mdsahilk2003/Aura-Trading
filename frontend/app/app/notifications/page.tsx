"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, CheckCheck, Bot, ShoppingBag, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { notificationsService } from "@/services/notifications";

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationsService.list,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return (
    <AppShell>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-950">
              Activity & System Alerts
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Order fills, bot strategy events, and security notification stream
            </p>
          </div>
        </div>

        {/* List Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
          {isLoading ? (
            <p className="py-12 text-center text-xs text-slate-400">Loading notifications...</p>
          ) : notifications.length > 0 ? (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`flex items-start justify-between gap-4 rounded-2xl border p-4 transition-all ${
                  item.read ? "border-slate-100 bg-slate-50/50" : "border-sky-200 bg-sky-50/40 shadow-xs"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-950 text-sky-400 shrink-0 mt-0.5">
                    {item.type.includes("BOT") ? (
                      <Bot className="h-4 w-4" />
                    ) : item.type.includes("ORDER") ? (
                      <ShoppingBag className="h-4 w-4" />
                    ) : (
                      <ShieldAlert className="h-4 w-4 text-amber-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-display text-xs font-bold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.message}</p>
                    <span className="inline-block text-[10px] text-slate-400 font-mono-num mt-1">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {!item.read && (
                  <button
                    onClick={() => markReadMutation.mutate(item.id)}
                    className="flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 p-1"
                  >
                    <Check className="h-4 w-4" />
                    <span className="hidden sm:inline">Mark Read</span>
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="py-16 text-center space-y-2">
              <CheckCheck className="h-8 w-8 text-slate-300 mx-auto" />
              <p className="font-display font-bold text-slate-800 text-sm">No new notifications</p>
              <p className="text-xs text-slate-400">You're all caught up with your trade alerts.</p>
            </div>
          )}
        </div>

      </div>
    </AppShell>
  );
}
