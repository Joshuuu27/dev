import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastContainer, Slide } from "react-toastify";

// import { AuthProvider } from "../app/context/AuthProvider";
import { filterStandardClaims } from "next-firebase-auth-edge/lib/auth/claims";
import { Tokens, getTokens } from "next-firebase-auth-edge";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/constant";

import { AuthUserProvider } from "../app/context/AuthContext";

import { Header } from "@/components/header";
import "@/lib/styles/globals.css";
import { ClientLayout } from "@/components/ClientLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fair-Fare-App",
  description: "FairFare calculates the right fare for tricycle rides using distance and time—transparent pricing, no overcharging.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-512x512.png",
    apple: "/icons/icon-512x512.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const session = cookies().get(SESSION_COOKIE_NAME)?.value || null;

  return (
    <html lang="en" className="safe-area-pwa">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-[100dvh] safe-area-pwa`}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
