"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Bell, Check, CheckCheck, Bot, ShoppingBag, ShieldAlert, AlertTriangle } from "lucide-react";
import { notificationsService } from "@/services/notifications";

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationCenter({ open, onClose }: NotificationCenterProps) {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationsService.list,
    enabled: open,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/30 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-white p-6 shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold text-slate-900">Notifications</h3>
              <p className="text-[11px] text-slate-500">Live order & bot activity alerts</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading alerts...</div>
          ) : notifications.length > 0 ? (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl border p-3.5 transition-all ${
                  item.read ? "border-slate-100 bg-slate-50/50" : "border-sky-100 bg-sky-50/30 shadow-xs"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 text-sky-400">
                      {item.type.includes("BOT") ? (
                        <Bot className="h-3.5 w-3.5" />
                      ) : item.type.includes("ORDER") ? (
                        <ShoppingBag className="h-3.5 w-3.5" />
                      ) : (
                        <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{item.title}</p>
                      <p className="mt-0.5 text-[11px] text-slate-600 leading-relaxed">{item.message}</p>
                      <span className="mt-1 inline-block text-[10px] text-slate-400 font-mono-num">
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                  {!item.read && (
                    <button
                      onClick={() => markReadMutation.mutate(item.id)}
                      className="text-slate-400 hover:text-sky-600"
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
                <CheckCheck className="h-6 w-6" />
              </div>
              <p className="text-xs font-semibold text-slate-700">All caught up!</p>
              <p className="mt-1 text-[11px] text-slate-400">No new notifications at this time.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
