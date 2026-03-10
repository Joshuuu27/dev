"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Mail, Phone, ChevronRight } from "lucide-react";
import { useState } from "react";
import Header from "@/components/commuter/trip-history-header";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    firstName: "Juan",
    lastName: "Dela Cruz",
    middleName: "",
    suffix: "",
    email: "juan@example.com",
    phone: "+63 912 345 6789",
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
       <Header />

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">First Name</label>
                <Input
                  value={profile.firstName}
                  onChange={(e) =>
                    setProfile({ ...profile, firstName: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Last Name</label>
                <Input
                  value={profile.lastName}
                  onChange={(e) =>
                    setProfile({ ...profile, lastName: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Middle Name <span className="text-muted-foreground">(optional)</span></label>
                <Input
                  value={profile.middleName}
                  onChange={(e) =>
                    setProfile({ ...profile, middleName: e.target.value })
                  }
                  className="mt-1"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Suffix <span className="text-muted-foreground">(e.g. Jr., Sr., III)</span></label>
                <Input
                  value={profile.suffix}
                  onChange={(e) =>
                    setProfile({ ...profile, suffix: e.target.value })
                  }
                  className="mt-1"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" /> Email Address
              </label>
              <Input
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" /> Phone Number
              </label>
              <Input
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
                className="mt-1"
              />
            </div>

            <Button className="w-full">Save Changes</Button>
          </CardContent>
        </Card>

        {/* Links */}
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-accent transition">
            <span className="font-medium">Change Password</span>
            <ChevronRight className="h-5 w-5" />
          </button>
          <button className="w-full flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-accent transition">
            <span className="font-medium">Manage ID Verification</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </main>
    </div>
  );
}
