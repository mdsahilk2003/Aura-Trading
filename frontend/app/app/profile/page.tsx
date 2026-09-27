"use client";

import { useState } from "react";
import { User, Mail, Phone, Calendar, ShieldCheck, LogOut, Loader2, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/providers/auth-provider";
import { authService } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ProfilePage() {
  const { user, refresh, logout } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      await authService.updateProfile({ name, phone });
      await refresh();
      setSaved(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-3xl">
        
        {/* Header */}
        <div className="border-b border-slate-200/80 pb-4">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-950">
            Account Profile & Identity
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your credentials, connected OAuth providers, and wallet settings
          </p>
        </div>

        {/* Profile Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-sky-400 font-extrabold text-xl shadow-md">
              {user?.name ? user.name[0].toUpperCase() : "U"}
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">{user?.name}</h2>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <div className="flex gap-2 mt-1.5">
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 uppercase">
                  {user?.role}
                </span>
                {user?.providers?.map((prov) => (
                  <span key={prov} className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-bold text-sky-800 capitalize">
                    {prov} connected
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Display Name</label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                <Input
                  type="text"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <span className="text-slate-400 font-medium">Registered Date</span>
                <p className="font-mono-num font-bold text-slate-800 mt-0.5">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <span className="text-slate-400 font-medium">Authentication</span>
                <p className="font-bold text-emerald-600 mt-0.5">Session Active (JWT Cookie)</p>
              </div>
            </div>

            {saved && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 font-semibold border border-emerald-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Profile updated successfully</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between">
              <Button type="submit" disabled={loading} className="bg-slate-950 text-white font-bold text-xs h-10 px-6 rounded-xl">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Profile Updates"}
              </Button>

              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700"
              >
                <LogOut className="h-4 w-4" />
                <span>Log Out</span>
              </button>
            </div>
          </form>
        </div>

      </div>
    </AppShell>
  );
}
