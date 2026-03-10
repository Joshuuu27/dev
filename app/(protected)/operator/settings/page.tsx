"use client";

import React, { useState } from "react";
import { useAuthContext } from "@/app/context/AuthContext";
import Header from "@/components/operator/operator-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "react-toastify";
import { Lock, User, Mail, Phone } from "lucide-react";
import { Loader } from "lucide-react";
import { formatDisplayName } from "@/lib/utils/name";

interface AccountFormData {
  firstName: string;
  lastName: string;
  middleName: string;
  suffix: string;
  email: string;
  phoneNumber: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const OperatorSettingsPage = () => {
  const { user } = useAuthContext();
  const [accountData, setAccountData] = useState<AccountFormData>({
    firstName: "",
    lastName: "",
    middleName: "",
    suffix: "",
    email: user?.email || "",
    phoneNumber: "",
  });

  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isLoadingAccount, setIsLoadingAccount] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);

  // Fetch operator name on component mount
  React.useEffect(() => {
    const fetchOperatorName = async () => {
      if (!user?.uid) return;
      
      try {
        const res = await fetch(`/api/operators/${user.uid}`);
        if (res.ok) {
          const operatorData = await res.json();
          setAccountData(prev => ({
            ...prev,
            firstName: operatorData.firstName ?? prev.firstName,
            lastName: operatorData.lastName ?? prev.lastName,
            middleName: operatorData.middleName ?? prev.middleName ?? "",
            suffix: operatorData.suffix ?? prev.suffix ?? "",
            email: operatorData.email ?? prev.email,
          }));
        }
      } catch (error) {
        console.error("Error fetching operator name:", error);
      }
    };

    fetchOperatorName();
  }, [user?.uid]);

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAccountData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accountData.firstName.trim() || !accountData.lastName.trim()) {
      toast.error("First name and last name are required");
      return;
    }

    if (!accountData.phoneNumber.trim()) {
      toast.error("Phone number cannot be empty");
      return;
    }

    try {
      setIsLoadingAccount(true);

      const displayName = formatDisplayName({
        firstName: accountData.firstName.trim(),
        lastName: accountData.lastName.trim(),
        middleName: accountData.middleName.trim() || undefined,
        suffix: accountData.suffix.trim() || undefined,
      });

      if (user) {
        try {
          const { updateProfile } = await import("firebase/auth");
          await updateProfile(user, { displayName });
        } catch (error: any) {
          console.error("Error updating profile:", error);
          toast.error(`Error updating profile: ${error.message}`);
          return;
        }

        const res = await fetch(`/api/operators/${user.uid}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: accountData.firstName.trim(),
            lastName: accountData.lastName.trim(),
            middleName: accountData.middleName.trim() || undefined,
            suffix: accountData.suffix.trim() || undefined,
            email: accountData.email,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Failed to update operator");
        }
      }
      
      toast.success("Account details updated successfully!");
    } catch (error: any) {
      console.error("Error updating account:", error);
      toast.error(error.message || "Failed to update account details");
    } finally {
      setIsLoadingAccount(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!passwordData.currentPassword.trim()) {
      toast.error("Current password is required");
      return;
    }

    if (!passwordData.newPassword.trim()) {
      toast.error("New password is required");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    try {
      setIsLoadingPassword(true);

      // Note: Firebase doesn't have a direct way to change password from the client
      // You would need to use reauthenticate and then updatePassword
      // Here's the implementation:

      if (user && user.email) {
        // Import from firebase/auth
        const { reauthenticateWithCredential, EmailAuthProvider, updatePassword } = await import("firebase/auth");
        
        try {
          // Reauthenticate the user
          const credential = EmailAuthProvider.credential(
            user.email,
            passwordData.currentPassword
          );

          await reauthenticateWithCredential(user, credential);

          // Update password
          await updatePassword(user, passwordData.newPassword);

          toast.success("Password changed successfully!");
          setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
        } catch (error: any) {
          if (error.code === "auth/wrong-password") {
            toast.error("Current password is incorrect");
          } else {
            console.error("Password change error:", error);
            toast.error(`Error: ${error.message}`);
          }
        }
      }
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error("Failed to change password");
    } finally {
      setIsLoadingPassword(false);
    }
  };

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#F8F8FA] px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-6">
            {/* Page Header */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Account Settings</h1>
              <p className="text-gray-600 mt-2">Manage your account details and security preferences</p>
            </div>

            {/* Settings Tabs */}
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="account" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Account Details
                </TabsTrigger>
                <TabsTrigger value="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Change Password
                </TabsTrigger>
              </TabsList>

              {/* Account Details Tab */}
              <TabsContent value="account">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>
                      Update your profile information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdateAccount} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-600" />
                            First Name
                          </Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            type="text"
                            value={accountData.firstName}
                            onChange={handleAccountChange}
                            placeholder="First name"
                            className="border-gray-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-600" />
                            Last Name
                          </Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            type="text"
                            value={accountData.lastName}
                            onChange={handleAccountChange}
                            placeholder="Last name"
                            className="border-gray-200"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="middleName" className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-600" />
                            Middle Name <span className="text-gray-400 font-normal">(optional)</span>
                          </Label>
                          <Input
                            id="middleName"
                            name="middleName"
                            type="text"
                            value={accountData.middleName}
                            onChange={handleAccountChange}
                            placeholder="Middle name"
                            className="border-gray-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="suffix" className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-600" />
                            Suffix <span className="text-gray-400 font-normal">(e.g. Jr., Sr., III)</span>
                          </Label>
                          <Input
                            id="suffix"
                            name="suffix"
                            type="text"
                            value={accountData.suffix}
                            onChange={handleAccountChange}
                            placeholder="Optional"
                            className="border-gray-200"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Your display name visible to drivers and commuters
                      </p>

                      {/* Email */}
                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-600" />
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={accountData.email}
                          disabled
                          className="bg-gray-100 border-gray-200 text-gray-600"
                        />
                        <p className="text-xs text-gray-500">
                          Email cannot be changed
                        </p>
                      </div>

                      {/* Phone Number */}
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-600" />
                          Phone Number
                        </Label>
                        <Input
                          id="phoneNumber"
                          name="phoneNumber"
                          type="tel"
                          value={accountData.phoneNumber}
                          onChange={handleAccountChange}
                          placeholder="Enter your phone number"
                          className="border-gray-200"
                        />
                        <p className="text-xs text-gray-500">
                          Your contact number for business inquiries
                        </p>
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        disabled={isLoadingAccount}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        {isLoadingAccount ? (
                          <>
                            <Loader className="w-4 h-4 mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Update Account Details"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Password Tab */}
              <TabsContent value="password">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                      Update your password to keep your account secure
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleChangePassword} className="space-y-6">
                      {/* Current Password */}
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-gray-600" />
                          Current Password
                        </Label>
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter your current password"
                          className="border-gray-200"
                        />
                      </div>

                      {/* New Password */}
                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-gray-600" />
                          New Password
                        </Label>
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter your new password"
                          className="border-gray-200"
                        />
                        <p className="text-xs text-gray-500">
                          Must be at least 6 characters long
                        </p>
                      </div>

                      {/* Confirm Password */}
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-gray-600" />
                          Confirm New Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          placeholder="Re-enter your new password"
                          className="border-gray-200"
                        />
                      </div>

                      {/* Info Box */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                          <strong>Password Tips:</strong>
                        </p>
                        <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                          <li>Use at least 6 characters</li>
                          <li>Mix uppercase and lowercase letters</li>
                          <li>Include numbers and special characters</li>
                          <li>Don't share your password with anyone</li>
                        </ul>
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        disabled={isLoadingPassword}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        {isLoadingPassword ? (
                          <>
                            <Loader className="w-4 h-4 mr-2 animate-spin" />
                            Changing Password...
                          </>
                        ) : (
                          "Change Password"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Security Info */}
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-900 flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Security Notice
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-yellow-800 space-y-2">
                <p>
                  • Keep your password confidential and do not share it with anyone
                </p>
                <p>
                  • If you suspect unauthorized access, change your password immediately
                </p>
                <p>
                  • We recommend changing your password every 3 months
                </p>
                <p>
                  • Log out from other devices if needed (feature coming soon)
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
};

export default OperatorSettingsPage;
