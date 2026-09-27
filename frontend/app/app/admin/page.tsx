"use client";

import { useQuery } from "@tanstack/react-query";
import { ShieldAlert, Users, FileText } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { adminService, type AdminUser, type AdminAuditLog } from "@/services/admin";

export default function AdminPage() {
  const { data: users = [], isLoading: loadingUsers } = useQuery<AdminUser[]>({
    queryKey: ["admin", "users"],
    queryFn: adminService.getUsers,
  });

  const { data: health } = useQuery({
    queryKey: ["admin", "health"],
    queryFn: adminService.getHealth,
  });

  const { data: logs = [] } = useQuery<AdminAuditLog[]>({
    queryKey: ["admin", "audit-logs"],
    queryFn: adminService.getAuditLogs,
  });

  return (
    <AppShell>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-amber-500" />
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-950">
                Admin Console
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              System monitoring, audit logs stream, user management, and health diagnostic
            </p>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500">Registered Platform Users</span>
            <p className="font-mono-num text-2xl font-extrabold text-slate-900 mt-1">
              {users.length}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500">System Status</span>
            <p className="font-mono-num text-2xl font-extrabold text-emerald-600 mt-1">
              {health?.status || "HEALTHY"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500">Uptime / Time</span>
            <p className="font-mono text-xs font-bold text-slate-700 mt-2 truncate">
              {health?.time || new Date().toISOString()}
            </p>
          </div>
        </div>

        {/* User Management Table */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Users className="h-4 w-4 text-sky-600" />
            <h3 className="font-display text-sm font-bold text-slate-900">Registered Users</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="pb-3">User</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3 text-right">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {loadingUsers ? (
                  <tr><td colSpan={4} className="py-8 text-center text-slate-400">Loading users...</td></tr>
                ) : users.length > 0 ? (
                  users.map((u: AdminUser) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="py-3 font-bold text-slate-900">{u.name}</td>
                      <td className="py-3 text-slate-600">{u.email}</td>
                      <td className="py-3">
                        <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${u.role === "admin" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono-num text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="py-8 text-center text-slate-400">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="h-4 w-4 text-indigo-600" />
            <h3 className="font-display text-sm font-bold text-slate-900">System Audit Trail</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="pb-3">Action</th>
                  <th className="pb-3">Resource</th>
                  <th className="pb-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {logs.length > 0 ? (
                  logs.slice(0, 10).map((log: AdminAuditLog, idx: number) => (
                    <tr key={log.id || idx} className="hover:bg-slate-50">
                      <td className="py-3 font-mono font-bold text-slate-900">{log.action}</td>
                      <td className="py-3 text-slate-600">{log.resource}</td>
                      <td className="py-3 text-right font-mono-num text-slate-400">
                        {new Date(log.createdAt || Date.now()).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={3} className="py-8 text-center text-slate-400">No audit log entries recorded</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
