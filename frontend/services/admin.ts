import { apiFetch } from "@/lib/api";
import type { DataMode } from "@aura/shared";

export interface AdminDashboard {
  users: number;
  orders: number;
  trades: number;
  runningBots: number;
  instruments: number;
  marketProvider: string;
  marketMode: DataMode;
  broker: string;
  dbReady: boolean;
  recentAudits: {
    id: string;
    action: string;
    resource: string;
    userId?: string;
    createdAt: string;
  }[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface AdminAuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId?: string;
  userId?: string;
  createdAt: string;
  meta?: Record<string, unknown>;
}

export const adminService = {
  dashboard: () => apiFetch<AdminDashboard>("/api/admin/dashboard"),
  getDashboard: () => apiFetch<AdminDashboard>("/api/admin/dashboard"),

  users: () => apiFetch<AdminUser[]>("/api/admin/users"),
  getUsers: () => apiFetch<AdminUser[]>("/api/admin/users"),

  getHealth: () => apiFetch<{ status: string; service: string; time: string }>("/health"),

  orders: () =>
    apiFetch<
      {
        id: string;
        userId: string;
        symbol: string;
        side: string;
        status: string;
        quantity: number;
        createdAt: string;
      }[]
    >("/api/admin/orders"),
  getOrders: () =>
    apiFetch<
      {
        id: string;
        userId: string;
        symbol: string;
        side: string;
        status: string;
        quantity: number;
        createdAt: string;
      }[]
    >("/api/admin/orders"),

  auditLogs: () => apiFetch<AdminAuditLog[]>("/api/admin/audit-logs"),
  getAuditLogs: () => apiFetch<AdminAuditLog[]>("/api/admin/audit-logs"),
};
