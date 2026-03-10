"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, User, Store } from "lucide-react";
import { createUserWithEmailAndPassword, getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/common/Toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [suffix, setSuffix] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState("user");
  const router = useRouter();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    // Validate inputs
    if (!firstName.trim() || !lastName.trim() || !email || !password || !confirmPassword) {
      showToast({
        type: "error",
        message: "Please fill in first name, last name, email and passwords.",
        actionLabel: "Dismiss",
      });
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      showToast({
        type: "error",
        message: "Passwords do not match.",
        actionLabel: "Dismiss",
      });
      return;
    }

    // Validate password length
    if (password.length < 6) {
      showToast({
        type: "error",
        message: "Password must be at least 6 characters.",
        actionLabel: "Dismiss",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Create user with Firebase
      const credential = await createUserWithEmailAndPassword(
        getAuth(),
        email,
        password
      );

      const user = credential.user;

      // Save account to database (Firestore)
      try {
        const registerResponse = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: user.uid,
            email,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            middleName: middleName.trim() || undefined,
            suffix: suffix.trim() || undefined,
            role,
          }),
        });
        if (!registerResponse.ok) {
          const data = await registerResponse.json().catch(() => ({}));
          console.error("Register API error:", data.error);
        }
      } catch (err) {
        console.error("Error saving profile:", err);
      }

      // Sign out so they land on login page (otherwise app redirects to dashboard)
      await signOut(getAuth());

      setIsLoading(false);
      showToast({
        type: "success",
        message: "Account created. Please sign in.",
        actionLabel: "Dismiss",
      });
      window.location.href = "/login";
    } catch (error: any) {
      const message =
        error?.code === "auth/email-already-in-use"
          ? "Email already in use. Please try another."
          : error?.code === "auth/weak-password"
          ? "Password is too weak. Please use a stronger password."
          : error?.code === "auth/invalid-email"
          ? "Invalid email address."
          : error?.message || "Registration failed. Please try again.";

      showToast({
        type: "error",
        message,
        actionLabel: "Dismiss",
      });

      console.error("Registration error:", error);
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleRegister} className="space-y-6">
      {/* User Role */}
      <div className="space-y-1.5">
        <Label htmlFor="role" className="text-xs font-medium text-slate-700">
          User Role
        </Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger id="role" className="h-11 text-sm rounded-xl bg-[#EDEEF9] border-0 focus:ring-2 focus:ring-[#6B46C1]/30 transition-colors">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">Commuter</SelectItem>
            <SelectItem value="driver">Driver</SelectItem>
            <SelectItem value="operator">Operator</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* Layer 1: Name fields + Email */}
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
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              className="pl-10 h-11 text-sm rounded-xl bg-[#EDEEF9] border-0 focus:bg-[#E4E6F4] focus:ring-2 focus:ring-[#6B46C1]/30 transition-colors"
              required
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
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              className="pl-10 h-11 text-sm rounded-xl bg-[#EDEEF9] border-0 focus:bg-[#E4E6F4] focus:ring-2 focus:ring-[#6B46C1]/30 transition-colors"
              required
            />
          </div>
        </div>
      </div>

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
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
              placeholder="Middle name"
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
              value={suffix}
              onChange={(e) => setSuffix(e.target.value)}
              placeholder="Optional"
              className="pl-10 h-11 text-sm rounded-xl bg-[#EDEEF9] border-0 focus:bg-[#E4E6F4] focus:ring-2 focus:ring-[#6B46C1]/30 transition-colors"
            />
          </div>
        </div>
      </div>

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
              value={email}
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-11 text-sm rounded-xl bg-[#EDEEF9] border-0 focus:bg-[#E4E6F4] focus:ring-2 focus:ring-[#6B46C1]/30 transition-colors"
              required
            />
          </div>
        </div>
      </div>

      {/* Layer 2: Password + Confirm Password */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-slate-700">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              className="pl-10 pr-10 h-11 text-sm rounded-xl bg-[#EDEEF9] border-0 focus:bg-[#E4E6F4] focus:ring-2 focus:ring-[#6B46C1]/30 transition-colors"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              className="pl-10 pr-10 h-11 text-sm rounded-xl bg-[#EDEEF9] border-0 focus:bg-[#E4E6F4] focus:ring-2 focus:ring-[#6B46C1]/30 transition-colors"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="flex items-start gap-2">
        <input
          id="terms"
          type="checkbox"
          className="w-4 h-4 text-[#6B46C1] bg-[#EDEEF9] border-slate-200 rounded focus:ring-[#6B46C1]/30 mt-0.5 shrink-0"
          required
        />
        <Label
          htmlFor="terms"
          className="text-sm text-slate-600 leading-relaxed min-w-0"
        >
          I agree to the{" "}
          <a href="/terms" className="text-[#6B46C1] hover:text-[#5A3AA3] transition-colors whitespace-nowrap">
            Terms of Service
          </a>
          {" "}and{" "}
          <a href="/privacy" className="text-[#6B46C1] hover:text-[#5A3AA3] transition-colors whitespace-nowrap">
            Privacy Policy
          </a>
        </Label>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-11 text-sm bg-[#6B46C1] hover:bg-[#5A3AA3] text-white font-semibold rounded-xl transition-colors shadow-sm"
      >
        {isLoading ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
}
