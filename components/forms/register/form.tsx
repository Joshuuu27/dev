"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, User, Store } from "lucide-react";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/common/Toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createSession } from "@/actions/auth-actions";

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState("user");
  const router = useRouter();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    // Validate inputs
    if (!name || !email || !password || !confirmPassword) {
      showToast({
        type: "error",
        message: "Please fill in all fields.",
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
      const idToken = await user.getIdToken();

      // Update user profile with name and role in Firestore
      try {
        await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: user.uid,
            email,
            name,
            role,
          }),
        });
      } catch (error) {
        console.error("Error saving user profile:", error);
        // Continue anyway - session creation is more important
      }

      // Call the login API to create session
      const loginResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          uid: user.uid,
          idToken,
        }),
      });

      if (!loginResponse.ok) {
        throw new Error("Failed to create session");
      }

      // Create session cookie
      await createSession(user.uid);

      showToast({
        type: "success",
        message: "User successfully registered.",
        actionLabel: "Dismiss",
      });

      router.refresh();
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
      <div className="space-y-2">
        <Label htmlFor="role" className="text-sm font-medium text-slate-700">
          User Role
        </Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger id="role" className="h-10 bg-slate-50/80 border-slate-200 focus:ring-indigo-500/20">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">Commuter</SelectItem>
            <SelectItem value="driver">Driver</SelectItem>
            <SelectItem value="operator">Operator</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* Full Name Field */}
      <div className="space-y-2">
        <Label
          htmlFor="fullName"
          className="text-sm font-medium text-slate-700"
        >
          Full Name
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            id="fullName"
            type="text"
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            className="pl-10 h-10 text-sm bg-slate-50/80 border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500/20 transition-colors"
            required
          />
        </div>
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <Label
          htmlFor="email"
          className="text-sm font-medium text-slate-700"
        >
          Email Address
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 h-10 text-sm bg-slate-50/80 border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500/20 transition-colors"
            required
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label
          htmlFor="password"
          className="text-sm font-medium text-slate-700"
        >
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            id="password"
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            className="pl-10 pr-10 h-10 text-sm bg-slate-50/80 border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500/20 transition-colors"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <Label
          htmlFor="confirmPassword"
          className="text-sm font-medium text-slate-700"
        >
          Confirm Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            id="confirmPassword"
            onChange={(e) => setConfirmPassword(e.target.value)}
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            className="pl-10 pr-10 h-10 text-sm bg-slate-50/80 border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500/20 transition-colors"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showConfirmPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="flex items-start space-x-2">
        <input
          id="terms"
          type="checkbox"
          className="w-4 h-4 text-indigo-600 bg-slate-100 border-slate-300 rounded focus:ring-indigo-500 mt-0.5"
          required
        />
        <Label
          htmlFor="terms"
          className="text-sm text-slate-600 leading-relaxed"
        >
          I agree to the{" "}
          <a
            href="/terms"
            className="text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            className="text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Privacy Policy
          </a>
        </Label>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-10 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
      >
        {isLoading ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
}
