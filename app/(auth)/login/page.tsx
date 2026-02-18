"use client";

import { useAuthContext } from "@/app/context/AuthContext";
import LoginForm from "@/components/forms/login/form";
import { Car, MapPin, Shield } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { user, role } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    if (role === "admin") router.push("/admin");
    if (role === "driver") router.push("/driver");
    if (role === "franchising") router.push("/franchising");
    if (role === "user") router.push("/user");
    if (role === "police") router.push("/police");
    if (role === "cttmo") router.push("/cttmo");
    if (role === "operator") router.push("/operator");
  }, [user, role, router]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left: Branding panel */}
      <aside className="hidden lg:flex lg:w-[45%] xl:w-[50%] flex-col justify-between bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 text-white relative overflow-hidden">
        {/* Decorative orbs */}
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-indigo-500/30 rounded-full blur-3xl animate-orb-float" />
        <div className="absolute bottom-1/3 -right-16 w-56 h-56 bg-slate-500/20 rounded-full blur-3xl animate-orb-float" style={{ animationDelay: "-2s" }} />
        <div className="absolute top-2/3 left-1/3 w-40 h-40 bg-indigo-400/20 rounded-full blur-2xl animate-orb-float" style={{ animationDelay: "-4s" }} />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:48px_48px]" />

        <header className="relative z-10 p-8 xl:p-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 group-hover:bg-white/15 transition-colors animate-logo-float">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">FairFare</span>
          </Link>
        </header>

        <div className="relative z-10 px-8 xl:px-12 pb-8">
          <h2 className="text-3xl xl:text-4xl font-bold leading-tight max-w-sm">
            Fair fare.
            <br />
            <span className="text-indigo-300">Every ride.</span>
          </h2>
          <p className="mt-4 text-slate-300 text-sm xl:text-base max-w-xs">
            Know your fare before you ride. Transparent, distance-based pricing for City of Mati.
          </p>
          <div className="mt-10 flex flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-indigo-300" />
              </div>
              <span className="text-sm text-slate-400">Track your ride</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-indigo-300" />
              </div>
              <span className="text-sm text-slate-400">Secure sign-in</span>
            </div>
          </div>
        </div>

        <footer className="relative z-10 px-8 xl:px-12 py-6">
          <p className="text-xs text-slate-500">© FairFare · City of Mati</p>
        </footer>
      </aside>

      {/* Right: Form panel - light grey, minimal & professional */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-10 lg:py-8 bg-[#F8F8FA] min-h-screen">
        {/* Mobile logo */}
        <Link href="/" className="lg:hidden inline-flex items-center gap-2 mb-8 animate-logo-float">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
            <Car className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900">FairFare</span>
        </Link>

        <div className="w-full max-w-[420px] animate-card-enter">
          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-slate-100 p-7 sm:p-8">
            <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
            <p className="mt-1.5 text-sm text-slate-600">Sign in to your account to continue</p>

            <div className="mt-6">
              <LoginForm />
            </div>

            <p className="mt-6 text-center text-sm text-slate-600">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-semibold text-[#6B46C1] hover:text-[#5A3AA3] transition-colors">
                Sign up
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="text-[#6B46C1] hover:text-[#5A3AA3] underline">Terms</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-[#6B46C1] hover:text-[#5A3AA3] underline">Privacy Policy</Link>.
          </p>
        </div>
      </main>
    </div>
  );
}
