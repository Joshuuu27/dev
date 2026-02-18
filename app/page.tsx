"use client";

import { Clock, Shield, Star, Menu, X, PhilippinePeso } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuthContext } from "./context/AuthContext";
import { handleLogout } from "@/lib/auth/logout";
import { APP_NAME } from "@/constant";

export default function Home() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user } = useAuthContext();

  return (
    <main className="bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold">F</span>
              </div>
              <span className="font-bold text-lg">{APP_NAME}</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm hover:text-primary transition">
                Features
              </a>
              <a href="#how-it-works" className="text-sm hover:text-primary transition">
                How it works
              </a>
              {user ? (
                <Button variant="ghost" size="sm" onClick={() => router.push("/user")}>
                  Dashboard
                </Button>
              ) : null}
              {user ? (
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Sign out
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => router.push("/login")}>
                  Sign in
                </Button>
              )}
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90"
                onClick={() => router.push(user ? "/user" : "/register")}
              >
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 border-t border-border">
              <a
                href="#features"
                className="block py-2 text-sm hover:text-primary"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="block py-2 text-sm hover:text-primary"
              >
                How it works
              </a>

              <div className="flex gap-2 mt-4">
                {user ? (
                  <>
                    <Button variant="ghost" size="sm" className="flex-1" onClick={() => router.push("/user")}>
                      Dashboard
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={handleLogout}>
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" className="flex-1" onClick={() => router.push("/login")}>
                      Sign in
                    </Button>
                    <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90" onClick={() => router.push("/register")}>
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-balance">
            Know your fare before you ride.{" "}
            <span className="text-primary">Every time.</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            FairFare calculates the right fare for your tricycle ride using distance and time—no guesswork, no overcharging. See the exact price upfront and ride with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => router.push(user ? "/user/commuter" : "/login")}
            >
              {user ? "Start Your Ride" : "Get Started"}
            </Button>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-10 text-sm">
            <div>
              <p className="font-bold text-xl text-primary">Transparent fare</p>
              <p className="text-muted-foreground">Distance & time based</p>
            </div>
            <div>
              <p className="font-bold text-xl text-primary">Real-time tracking</p>
              <p className="text-muted-foreground">Track your ride</p>
            </div>
            <div>
              <p className="font-bold text-xl text-primary">City of Mati</p>
              <p className="text-muted-foreground">Official fare system</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why choose FairFare?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We focus on calculating the right fare for every trip—transparent,
              fair, and based on real distance and time. No surprises, just the
              price you deserve.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-xl border border-border hover:border-primary/50 transition bg-card">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Clock className="text-primary" size={24} />
              </div>
              <h3 className="font-bold mb-2">Fare Before You Ride</h3>
              <p className="text-sm text-muted-foreground">
                See the calculated fare upfront based on distance and time—no surprises.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-xl border border-border hover:border-primary/50 transition bg-card">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <PhilippinePeso className="text-primary" size={24} />
              </div>
              <h3 className="font-bold mb-2">Right Fare, Every Trip</h3>
              <p className="text-sm text-muted-foreground">
                Our system calculates the correct fare from distance and time so
                you always pay what’s fair—no surge, no hidden fees.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-xl border border-border hover:border-primary/50 transition bg-card">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="text-primary" size={24} />
              </div>
              <h3 className="font-bold mb-2">Safety & Support</h3>
              <p className="text-sm text-muted-foreground">
                Real-time tracking, SOS alerts, and verified drivers for peace of mind.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-xl border border-border hover:border-primary/50 transition bg-card">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Star className="text-primary" size={24} />
              </div>
              <h3 className="font-bold mb-2">Commend & Report</h3>
              <p className="text-sm text-muted-foreground">
                Rate drivers and report issues to keep the system fair for everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-32 bg-primary/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How it works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Getting a ride is simple. Just three easy steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Open the App</h3>
              <p className="text-muted-foreground">
                Open FairFare, enter your route, and see your calculated fare. Quick and clear.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">See Your Fare</h3>
              <p className="text-muted-foreground">
                Get the calculated fare for your trip before you book—based on distance and time.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Enjoy Your Ride</h3>
              <p className="text-muted-foreground">
                Sit back, relax, and track your journey in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 border-t border-border">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to ride?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join commuters who trust FairFare for the right fare every time—
            calculated fairly from distance and time, with no surprises.
          </p>
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => router.push(user ? "/user" : "/register")}
          >
            Get Started with FairFare
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">F</span>
              </div>
              <span className="font-bold">FairFare</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Fair fare for your tricycle ride—transparent, distance and time based. City of Mati.
            </p>
            <div className="flex flex-wrap gap-6 text-sm">
              <a href="/terms" className="text-muted-foreground hover:text-primary transition">
                Terms
              </a>
              <a href="/privacy" className="text-muted-foreground hover:text-primary transition">
                Privacy
              </a>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} FairFare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
