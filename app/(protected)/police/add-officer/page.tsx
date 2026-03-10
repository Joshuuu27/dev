"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, User, Shield, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import Header from "@/components/police/police-header";
import { LoadingScreen } from "@/components/common/loading-component";
import { useRouter } from "next/navigation";

export default function AddOfficerPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [suffix, setSuffix] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPoliceHead, setIsPoliceHead] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if current user is police head
    fetch("/api/police/current-user")
      .then((res) => res.json())
      .then((data) => {
        if (data.isPoliceHead) {
          setIsPoliceHead(true);
        } else {
          toast.error("Only the police head can add new officers.");
          router.push("/police");
        }
        setIsCheckingRole(false);
      })
      .catch(() => {
        toast.error("Failed to verify permissions.");
        router.push("/police");
        setIsCheckingRole(false);
      });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate inputs
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Please enter first name and last name.");
      return;
    }
    if (!email || !password) {
      toast.error("Please fill in email and password.");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    // Validate password length
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/police/officers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          middleName: middleName.trim() || undefined,
          suffix: suffix.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create police officer account");
      }

      toast.success("Police officer account created successfully!");

      // Reset form
      setFirstName("");
      setMiddleName("");
      setLastName("");
      setSuffix("");
      setEmail("");
      setPassword("");
    } catch (error: any) {
      console.error("Error creating police officer:", error);
      toast.error(error.message || "Failed to create police officer account");
    } finally {
      setIsLoading(false);
    }
  }

  if (isCheckingRole) {
    return (
      <>
        <Header />
        <LoadingScreen />
      </>
    );
  }

  if (!isPoliceHead) {
    return (
      <>
        <Header />
        <div className="max-w-2xl mx-auto px-6 py-8 w-full">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-900 mb-2">Access Denied</h2>
            <p className="text-red-700">
              Only the police head can add new police officers.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="max-w-2xl mx-auto px-6 py-8 w-full">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Add Police Officer</h1>
          </div>
          <p className="text-gray-600 mt-2">
            Create a new police officer account. The officer will be able to log in and access the police dashboard.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-slate-100 p-7 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Layer 1: Name + Email (same layout as register) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-slate-700">
                  First Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-10 h-11 text-sm rounded-xl bg-[#EDEEF9] border-0 focus:bg-[#E4E6F4] focus:ring-2 focus:ring-[#6B46C1]/30 transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-slate-700">
                  Last Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-10 h-11 text-sm rounded-xl bg-[#EDEEF9] border-0 focus:bg-[#E4E6F4] focus:ring-2 focus:ring-[#6B46C1]/30 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Layer 2: Middle Name + Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="middleName" className="text-sm font-medium text-slate-700">
                  Middle Name <span className="text-slate-400 font-normal">(optional)</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    id="middleName"
                    type="text"
                    placeholder="Middle name"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    disabled={isLoading}
                    className="pl-10 h-11 text-sm rounded-xl bg-[#EDEEF9] border-0 focus:bg-[#E4E6F4] focus:ring-2 focus:ring-[#6B46C1]/30 transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="suffix" className="text-sm font-medium text-slate-700">
                  Suffix <span className="text-slate-400 font-normal">(e.g. Jr., Sr., III)</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    id="suffix"
                    type="text"
                    placeholder="Optional"
                    value={suffix}
                    onChange={(e) => setSuffix(e.target.value)}
                    disabled={isLoading}
                    className="pl-10 h-11 text-sm rounded-xl bg-[#EDEEF9] border-0 focus:bg-[#E4E6F4] focus:ring-2 focus:ring-[#6B46C1]/30 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Layer 3: Email + Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-10 h-11 text-sm rounded-xl bg-[#EDEEF9] border-0 focus:bg-[#E4E6F4] focus:ring-2 focus:ring-[#6B46C1]/30 transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password (min. 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={6}
                    className="pl-10 pr-10 h-11 text-sm rounded-xl bg-[#EDEEF9] border-0 focus:bg-[#E4E6F4] focus:ring-2 focus:ring-[#6B46C1]/30 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-sm text-slate-500">Password must be at least 6 characters long.</p>
              </div>
            </div>

            {/* Submit Button (same style as register) */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-sm bg-[#6B46C1] hover:bg-[#5A3AA3] text-white font-semibold rounded-xl transition-colors shadow-sm"
            >
              {isLoading ? "Creating account..." : "Create Police Officer Account"}
            </Button>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> The new officer will receive an account with police privileges. 
            They can log in using the email and password you provide. Make sure to share 
            these credentials securely.
          </p>
        </div>
      </div>
    </>
  );
}
