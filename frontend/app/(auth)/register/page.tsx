"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TrendingUp, ArrowRight, Loader2, Sparkles, CheckCircle } from "lucide-react";
import { authService } from "@/services/auth";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuraLogo } from "@/components/ui/AuraLogo";

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address to create an account.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      await authService.register({
        email: email.trim(),
        name: name ? name.trim() : email.split("@")[0],
        password: password ? password.trim() : undefined,
      });
      await refresh();
      router.push("/app");
    } catch (err: any) {
      setErrorMsg(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = authService.googleUrl();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 flex flex-col items-center justify-center p-4 text-white">
      <div className="w-full max-w-md space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <AuraLogo dark textSize="text-2xl" iconSize="h-6 w-6" />
          <h1 className="font-display text-2xl font-extrabold text-white tracking-tight">
            Create Your Account
          </h1>
          <p className="text-xs text-slate-400">Get ₹10,00,000 in virtual paper funds instantly</p>
        </div>

        {errorMsg && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-center text-xs text-rose-300">
            {errorMsg}
          </div>
        )}

        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-5">
          
          <Button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full h-12 bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs rounded-xl flex items-center justify-center gap-3 shadow-md"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>CONTINUE WITH GOOGLE</span>
          </Button>

          <div className="flex items-center gap-3 my-4">
            <div className="h-[1px] flex-1 bg-white/10" />
            <span className="text-[11px] text-slate-500 font-semibold uppercase">Or Register With Email</span>
            <div className="h-[1px] flex-1 bg-white/10" />
          </div>

          <form onSubmit={handleRegister} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Full Name</label>
              <Input
                type="text"
                placeholder="Aura Trader"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-slate-950/60 border-white/10 text-white placeholder:text-slate-500 text-xs h-10"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Email Address</label>
              <Input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-950/60 border-white/10 text-white placeholder:text-slate-500 text-xs h-10"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-950/60 border-white/10 text-white placeholder:text-slate-500 text-xs h-10"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-sky-500/20"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>CREATE ACCOUNT & START TRADING</span>
                </div>
              )}
            </Button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="text-sky-400 hover:underline font-semibold">
                Sign In
              </Link>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
