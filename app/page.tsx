"use client";

import { Clock, Shield, Star, Menu, X, PhilippinePeso, Car } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuthContext } from "./context/AuthContext";
import { handleLogout } from "@/lib/auth/logout";
import { APP_NAME } from "@/constant";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuthContext();

  return (
    <main className="min-h-screen bg-[#F8F8FA] text-slate-900">
      {/* Navigation - matches auth header style */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 group-hover:bg-slate-700 transition-colors">
                <Car className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">{APP_NAME}</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-[#6B46C1] transition-colors px-3 py-2 rounded-lg hover:bg-[#EDEEF9]">
                Features
              </a>
              <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-[#6B46C1] transition-colors px-3 py-2 rounded-lg hover:bg-[#EDEEF9]">
                How it works
              </a>
              {user ? (
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-[#6B46C1] hover:bg-[#EDEEF9]" onClick={() => router.push("/user")}>
                  Dashboard
                </Button>
              ) : null}
              {user ? (
                <Button variant="outline" size="sm" className="border-slate-200 rounded-xl" onClick={handleLogout}>
                  Sign out
                </Button>
              ) : (
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-[#6B46C1] hover:bg-[#EDEEF9] rounded-xl" onClick={() => router.push("/login")}>
                  Sign in
                </Button>
              )}
              <Button
                size="sm"
                className="bg-[#6B46C1] hover:bg-[#5A3AA3] text-white rounded-xl shadow-sm ml-1"
                onClick={() => router.push(user ? "/user" : "/register")}
              >
                Get Started
              </Button>
            </div>

            <button
              className="md:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden pb-4 pt-2 border-t border-slate-100 space-y-1">
              <a href="#features" className="block py-2.5 px-3 text-sm font-medium text-slate-600 hover:text-[#6B46C1] hover:bg-[#EDEEF9] rounded-xl" onClick={() => setMobileMenuOpen(false)}>
                Features
              </a>
              <a href="#how-it-works" className="block py-2.5 px-3 text-sm font-medium text-slate-600 hover:text-[#6B46C1] hover:bg-[#EDEEF9] rounded-xl" onClick={() => setMobileMenuOpen(false)}>
                How it works
              </a>
              <div className="flex gap-2 mt-4 pt-2">
                {user ? (
                  <>
                    <Button variant="ghost" size="sm" className="flex-1 rounded-xl" onClick={() => { router.push("/user"); setMobileMenuOpen(false); }}>
                      Dashboard
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 rounded-xl border-slate-200" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" className="flex-1 rounded-xl" onClick={() => { router.push("/login"); setMobileMenuOpen(false); }}>
                      Sign in
                    </Button>
                    <Button size="sm" className="flex-1 rounded-xl bg-[#6B46C1] hover:bg-[#5A3AA3] text-white" onClick={() => { router.push("/register"); setMobileMenuOpen(false); }}>
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero - same card and typography as auth */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-slate-100 p-8 sm:p-10 md:p-12 text-center animate-card-enter">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-slate-900 text-balance">
              Know your fare before you ride.{" "}
              <span className="text-[#6B46C1]">Every time.</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto text-pretty">
              FairFare calculates the right fare for your tricycle ride using distance and time—no guesswork, no overcharging. See the exact price upfront and ride with confidence.
            </p>
            <div className="mt-8">
              <Button
                size="lg"
                className="bg-[#6B46C1] hover:bg-[#5A3AA3] text-white font-semibold rounded-xl shadow-sm h-11 px-8"
                onClick={() => router.push(user ? "/user/commuter" : "/login")}
              >
                {user ? "Start Your Ride" : "Get Started"}
              </Button>
            </div>
            <div className="mt-12 flex flex-wrap justify-center gap-8 sm:gap-10 text-sm">
              <div>
                <p className="font-semibold text-[#6B46C1]">Transparent fare</p>
                <p className="text-slate-500">Distance & time based</p>
              </div>
              <div>
                <p className="font-semibold text-[#6B46C1]">Real-time tracking</p>
                <p className="text-slate-500">Track your ride</p>
              </div>
              <div>
                <p className="font-semibold text-[#6B46C1]">City of Mati</p>
                <p className="text-slate-500">Official fare system</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features - cards match login card style */}
      <section id="features" className="py-16 md:py-24 bg-white border-t border-slate-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
              Why choose FairFare?
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              We focus on calculating the right fare for every trip—transparent, fair, and based on real distance and time.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 rounded-2xl border border-slate-100 bg-[#F8F8FA] hover:border-[#6B46C1]/30 hover:shadow-[0_4px_24px_rgba(107,70,193,0.08)] transition-all">
              <div className="w-12 h-12 bg-[#EDEEF9] rounded-xl flex items-center justify-center mb-4">
                <Clock className="text-[#6B46C1]" size={24} />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Fare Before You Ride</h3>
              <p className="text-sm text-slate-600">
                See the calculated fare upfront based on distance and time—no surprises.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-100 bg-[#F8F8FA] hover:border-[#6B46C1]/30 hover:shadow-[0_4px_24px_rgba(107,70,193,0.08)] transition-all">
              <div className="w-12 h-12 bg-[#EDEEF9] rounded-xl flex items-center justify-center mb-4">
                <PhilippinePeso className="text-[#6B46C1]" size={24} />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Right Fare, Every Trip</h3>
              <p className="text-sm text-slate-600">
                Correct fare from distance and time—no surge, no hidden fees.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-100 bg-[#F8F8FA] hover:border-[#6B46C1]/30 hover:shadow-[0_4px_24px_rgba(107,70,193,0.08)] transition-all">
              <div className="w-12 h-12 bg-[#EDEEF9] rounded-xl flex items-center justify-center mb-4">
                <Shield className="text-[#6B46C1]" size={24} />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Safety & Support</h3>
              <p className="text-sm text-slate-600">
                Real-time tracking, SOS alerts, and verified drivers.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-100 bg-[#F8F8FA] hover:border-[#6B46C1]/30 hover:shadow-[0_4px_24px_rgba(107,70,193,0.08)] transition-all">
              <div className="w-12 h-12 bg-[#EDEEF9] rounded-xl flex items-center justify-center mb-4">
                <Star className="text-[#6B46C1]" size={24} />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Commend & Report</h3>
              <p className="text-sm text-slate-600">
                Rate drivers and report issues to keep the system fair.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 md:py-24 bg-[#F8F8FA] border-t border-slate-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
              How it works
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Getting a ride is simple. Just three easy steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 bg-[#6B46C1] text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-5 shadow-sm">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Open the App</h3>
              <p className="text-slate-600 text-sm">
                Open FairFare, enter your route, and see your calculated fare.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-[#6B46C1] text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-5 shadow-sm">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">See Your Fare</h3>
              <p className="text-slate-600 text-sm">
                Get the fare for your trip before you book—based on distance and time.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-[#6B46C1] text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-5 shadow-sm">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Enjoy Your Ride</h3>
              <p className="text-slate-600 text-sm">
                Sit back, relax, and track your journey in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-white border-t border-slate-100">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-[#F8F8FA] rounded-2xl border border-slate-100 p-8 sm:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
              Ready to ride?
            </h2>
            <p className="text-slate-600 mb-8 max-w-xl mx-auto">
              Join commuters who trust FairFare for the right fare every time.
            </p>
            <Button
              size="lg"
              className="bg-[#6B46C1] hover:bg-[#5A3AA3] text-white font-semibold rounded-xl shadow-sm h-11 px-8"
              onClick={() => router.push(user ? "/user" : "/register")}
            >
              Get Started with FairFare
            </Button>
          </div>
        </div>
      </section>

      {/* Footer - matches auth footer style */}
      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center">
                <Car className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-900">FairFare</span>
            </Link>
            <p className="text-sm text-slate-500 max-w-md">
              Fair fare for your tricycle ride—transparent, distance and time based. City of Mati.
            </p>
            <div className="flex flex-wrap gap-6 text-sm">
              <Link href="/terms" className="text-slate-500 hover:text-[#6B46C1] transition-colors font-medium">
                Terms
              </Link>
              <Link href="/privacy" className="text-slate-500 hover:text-[#6B46C1] transition-colors font-medium">
                Privacy
              </Link>
            </div>
          </div>
          <div className="border-t border-slate-100 mt-8 pt-6 text-center text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} FairFare. City of Mati.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
