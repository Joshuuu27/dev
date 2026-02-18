"use client";

import { RegisterForm } from "@/components/forms/register/form";
import { Car, MapPin, Shield } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left: Branding panel - same as login */}
      <aside className="hidden lg:flex lg:w-[45%] xl:w-[50%] flex-col justify-between bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 text-white relative overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-indigo-500/30 rounded-full blur-3xl animate-orb-float" />
        <div className="absolute bottom-1/3 -right-16 w-56 h-56 bg-slate-500/20 rounded-full blur-3xl animate-orb-float" style={{ animationDelay: "-2s" }} />
        <div className="absolute top-2/3 left-1/3 w-40 h-40 bg-indigo-400/20 rounded-full blur-2xl animate-orb-float" style={{ animationDelay: "-4s" }} />
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

      {/* Right: Form panel */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-10 lg:py-8 bg-slate-50">
        <Link href="/" className="lg:hidden inline-flex items-center gap-2 mb-8 animate-logo-float">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
            <Car className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900">FairFare</span>
        </Link>

        <div className="w-full max-w-[520px] animate-card-enter">
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/60 p-7 sm:p-8">
            <h1 className="text-2xl font-bold text-slate-900">Create account</h1>
            <p className="mt-1.5 text-sm text-slate-500">Join us and start your journey today</p>

            <div className="mt-6">
              <RegisterForm />
            </div>

            <p className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="text-slate-500 hover:text-slate-700 underline">Terms</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-slate-500 hover:text-slate-700 underline">Privacy Policy</Link>.
          </p>
        </div>
      </main>
    </div>
  );
}
