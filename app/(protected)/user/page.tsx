"use client";

import { useAuthContext } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import Header from "@/components/commuter/trip-history-header";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Heart, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const UserDashboard = () => {
  const { user, role } = useAuthContext();
  const router = useRouter();

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#F8F8FA] px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-10">
            <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-900 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] p-8 md:p-12 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-slate-500/20 rounded-full blur-2xl -ml-24 -mb-24" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:48px_48px]" />

              <div className="relative z-10 space-y-6">
                <div className="space-y-2">
                  <p className="text-sm md:text-base font-medium tracking-widest uppercase text-[#C4B5FD]">
                    Mabuhay ug Madayaw
                  </p>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                    Welcome to City of Mati
                  </h1>
                </div>

                {user && (
                  <div className="space-y-4 pt-4 border-t border-white/20">
                    <p className="text-base md:text-lg font-medium">
                      Hello, <span className="font-bold">{user.displayName || user.email?.split("@")[0] || "Traveler"}</span>!
                    </p>
                    <p className="text-sm md:text-base text-slate-400">
                      Your safe and convenient transport journey starts here
                    </p>
                    <Button
                      size="lg"
                      className="bg-[#6B46C1] hover:bg-[#5A3AA3] text-white font-semibold rounded-xl shadow-sm"
                      onClick={() => router.push("/user/commuter")}
                    >
                      Start Your Ride
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                  <div className="flex items-center gap-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-3">
                    <div className="w-10 h-10 rounded-lg bg-[#EDEEF9]/20 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-[#A78BFA]" />
                    </div>
                    <span className="text-sm font-medium text-slate-200">Real-time Tracking</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-3">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-slate-300" />
                    </div>
                    <span className="text-sm font-medium text-slate-200">Driver Ratings</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-amber-300" />
                    </div>
                    <span className="text-sm font-medium text-slate-200">Safe & Secure</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="border border-slate-100 bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-[#EDEEF9] rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-[#6B46C1]" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Real-time Tracking</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Track your ride in real-time with live GPS updates and driver location.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-slate-100 bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-slate-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Rate & Review</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Share your experience and help us maintain excellent service quality.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-slate-100 bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Safety First</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Your safety is our priority with verified drivers and real-time support.
                </p>
              </CardContent>
            </Card>
          </div>

          {user && (
            <Card className="border border-slate-100 bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-bold text-slate-900">Your Account</h2>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-[#F8F8FA] rounded-xl p-4 border border-slate-100">
                    <p className="text-slate-500 text-xs uppercase font-semibold tracking-wider">Email</p>
                    <p className="text-slate-900 font-medium mt-1">{user.email}</p>
                  </div>
                  <div className="bg-[#F8F8FA] rounded-xl p-4 border border-slate-100">
                    <p className="text-slate-500 text-xs uppercase font-semibold tracking-wider">Account Type</p>
                    <p className="text-slate-900 font-medium mt-1 capitalize">{role || "User"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
};

export default UserDashboard;
