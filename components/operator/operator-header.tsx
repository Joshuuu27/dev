"use client";

import { LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { handleLogout } from "@/lib/auth/logout";
import { APP_NAME } from "@/constant";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigationLinks = [
    { label: "Home", href: "/operator" },
    { label: "Vehicles", href: "/operator/franchise/vehicles" },
    { label: "Settings", href: "/operator/settings" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 group-hover:bg-slate-700 transition-colors">
              <span className="text-sm font-bold text-white">F</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{APP_NAME}</h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navigationLinks.map((link) => {
              const isBasePath = link.href.split("/").filter(Boolean).length === 1;
              const isActive = isBasePath ? pathname === link.href : (pathname === link.href || pathname.startsWith(link.href + "/"));
              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant="ghost"
                    className={`text-sm font-medium rounded-xl transition-colors px-3 py-2 ${
                      isActive
                        ? "bg-[#EDEEF9] text-[#6B46C1] font-semibold"
                        : "text-slate-600 hover:text-[#6B46C1] hover:bg-[#EDEEF9]"
                    }`}
                  >
                    {link.label}
                  </Button>
                </Link>
              );
            })}
            {/* Logout Button */}
            <Button
              variant="outline"
              className="ml-2 flex items-center gap-2 border-slate-200 rounded-xl"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </nav>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <nav className="lg:hidden mt-4 flex flex-col gap-2 pb-2">
            {navigationLinks.map((link) => {
              const isBasePath = link.href.split("/").filter(Boolean).length === 1;
              const isActive = isBasePath ? pathname === link.href : (pathname === link.href || pathname.startsWith(link.href + "/"));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className={`w-full justify-start rounded-xl py-2.5 ${
                      isActive
                        ? "bg-[#EDEEF9] text-[#6B46C1] font-semibold"
                        : "text-slate-600 hover:text-[#6B46C1] hover:bg-[#EDEEF9]"
                    }`}
                  >
                    {link.label}
                  </Button>
                </Link>
              );
            })}
            {/* Mobile Logout */}
            <Button
              variant="outline"
              className="w-full justify-start mt-2 flex items-center gap-2 border-slate-200 rounded-xl"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
}
