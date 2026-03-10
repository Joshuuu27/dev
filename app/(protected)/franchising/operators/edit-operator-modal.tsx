"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

interface Operator {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  suffix?: string;
  email: string;
  franchiseNumber?: string;
}

interface EditOperatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  operator: Operator | null;
  onSuccess: () => void;
}

export default function EditOperatorModal({
  isOpen,
  onClose,
  operator,
  onSuccess,
}: EditOperatorModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    suffix: "",
    email: "",
    franchiseNumber: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (operator && isOpen) {
      setFormData({
        firstName: operator.firstName ?? "",
        lastName: operator.lastName ?? (operator.name ?? ""),
        middleName: operator.middleName ?? "",
        suffix: operator.suffix ?? "",
        email: operator.email ?? "",
        franchiseNumber: operator.franchiseNumber ?? "",
      });
    }
  }, [operator, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error("Please enter first name and last name");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Please enter operator email");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`/api/operators/${operator?.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          middleName: formData.middleName.trim() || undefined,
          suffix: formData.suffix.trim() || undefined,
          email: formData.email.trim(),
          franchiseNumber: formData.franchiseNumber.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update operator");
      }

      toast.success("Operator updated successfully");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error updating operator:", error);
      toast.error(error.message || "Failed to update operator");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Operator Details</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First name"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last name"
                disabled={loading}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="middleName">Middle Name <span className="text-muted-foreground">(optional)</span></Label>
              <Input
                id="middleName"
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
                placeholder="Middle name"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="suffix">Suffix <span className="text-muted-foreground">(e.g. Jr., Sr., III)</span></Label>
              <Input
                id="suffix"
                name="suffix"
                value={formData.suffix}
                onChange={handleChange}
                placeholder="Optional"
                disabled={loading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="franchiseNumber">Franchise Number (Optional)</Label>
            <Input
              id="franchiseNumber"
              name="franchiseNumber"
              value={formData.franchiseNumber}
              onChange={handleChange}
              placeholder="Enter franchise number"
              disabled={loading}
            />
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
