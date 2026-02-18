"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitReportCaseViaAPI, ReportCaseInput } from "@/lib/services/ReportService";
import { useAuthContext } from "@/app/context/AuthContext";
import { getDriverVehicles } from "@/lib/services/VehicleService";
import { toast } from "react-toastify";
import { Loader, CheckCircle2, XCircle } from "lucide-react";

interface DriverMatch {
  id: string;
  displayName?: string;
  name?: string;
}

interface ReportDialogProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReportSubmitted?: () => void;
}

const reportTypes = [
  "Safety Concern",
  "Rude Behavior",
  "Dangerous Driving",
  "Vehicle Condition",
  "Price Dispute",
  "Lost Item",
  "Other",
];

export function ReportDialogComponent({
  userId,
  open,
  onOpenChange,
  onReportSubmitted,
}: ReportDialogProps) {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [fetchingPlate, setFetchingPlate] = useState(false);
  const [formData, setFormData] = useState({
    reportType: "",
    description: "",
    driverNameInput: "",
    driverId: "",
    driverName: "",
    plateNumber: "",
    location: "",
    phoneNumber: "",
    incidentDate: "",
  });
  const [driverSearchStatus, setDriverSearchStatus] = useState<"idle" | "searching" | "found" | "not_found">("idle");
  const [matchedDrivers, setMatchedDrivers] = useState<DriverMatch[]>([]);

  const searchDriversByName = useCallback(async (name: string) => {
    if (!name || name.trim().length < 2) {
      setDriverSearchStatus("idle");
      setMatchedDrivers([]);
      setFormData((prev) => ({ ...prev, driverId: "", driverName: "" }));
      return;
    }
    setDriverSearchStatus("searching");
    try {
      const res = await fetch(`/api/drivers?search=${encodeURIComponent(name.trim())}`);
      const drivers: DriverMatch[] = await res.json();
      if (Array.isArray(drivers)) {
        setMatchedDrivers(drivers);
        setDriverSearchStatus(drivers.length > 0 ? "found" : "not_found");
        if (drivers.length === 1) {
          const d = drivers[0];
          const displayName = d.displayName || d.name || "";
          setFormData((prev) => ({
            ...prev,
            driverId: d.id,
            driverName: displayName,
          }));
        } else if (drivers.length === 0) {
          setFormData((prev) => ({
            ...prev,
            driverId: "",
            driverName: prev.driverNameInput.trim(),
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            driverId: "",
            driverName: prev.driverNameInput.trim(),
          }));
        }
      } else {
        setMatchedDrivers([]);
        setDriverSearchStatus("not_found");
        setFormData((prev) => ({ ...prev, driverId: "", driverName: prev.driverNameInput.trim() }));
      }
    } catch (error) {
      console.error("Error searching drivers:", error);
      setDriverSearchStatus("not_found");
      setMatchedDrivers([]);
      setFormData((prev) => ({ ...prev, driverId: "", driverName: prev.driverNameInput.trim() }));
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      searchDriversByName(formData.driverNameInput);
    }, 400);
    return () => clearTimeout(t);
  }, [formData.driverNameInput, searchDriversByName]);

  const selectDriver = (d: DriverMatch) => {
    const displayName = d.displayName || d.name || "";
    setFormData((prev) => ({
      ...prev,
      driverNameInput: displayName,
      driverId: d.id,
      driverName: displayName,
    }));
    setMatchedDrivers([]);
    setDriverSearchStatus("found");
  };

  // Fetch plate number when driver ID is provided
  useEffect(() => {
    if (formData.driverId.trim()) {
      fetchPlateNumber(formData.driverId);
    } else {
      setFormData((prev) => ({ ...prev, plateNumber: "" }));
    }
  }, [formData.driverId]);

  const fetchPlateNumber = async (driverId: string) => {
    if (!driverId) return;
    try {
      setFetchingPlate(true);
      const vehiclesData = await getDriverVehicles(driverId);
      if (vehiclesData.length > 0) {
        setFormData((prev) => ({
          ...prev,
          plateNumber: vehiclesData[0].plateNumber,
        }));
      }
    } catch (error) {
      console.error("Error fetching vehicle plate number:", error);
    } finally {
      setFetchingPlate(false);
    }
  };

  const handleInputChange = (
    field: string,
    value: string | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.reportType) {
      toast.error("Please select a report type");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Please provide a description");
      return;
    }
    if (!formData.plateNumber?.trim()) {
      toast.error("Please enter the plate number");
      return;
    }

    try {
      setLoading(true);

      const reportData: ReportCaseInput = {
        commuterId: userId,
        commuterName: user?.displayName || "Anonymous",
        commuterEmail: user?.email || "",
        phoneNumber: formData.phoneNumber,
        reportType: formData.reportType,
        description: formData.description,
        driverId: formData.driverId || undefined,
        driverName: formData.driverName || formData.driverNameInput?.trim() || undefined,
        plateNumber: formData.plateNumber || undefined,
        location: formData.location || undefined,
        incidentDate: formData.incidentDate
          ? new Date(formData.incidentDate)
          : undefined,
      };

      await submitReportCaseViaAPI(reportData);

      // Reset form
      setFormData({
        reportType: "",
        description: "",
        driverNameInput: "",
        driverId: "",
        driverName: "",
        plateNumber: "",
        location: "",
        phoneNumber: "",
        incidentDate: "",
      });
      setDriverSearchStatus("idle");
      setMatchedDrivers([]);

      onOpenChange(false);
      onReportSubmitted?.();
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>File a Report</DialogTitle>
          <DialogDescription>
            Provide details about your incident or concern. All information will
            be securely recorded.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Report Type */}
          <div className="space-y-2">
            <Label htmlFor="reportType">Report Type *</Label>
            <Select
              value={formData.reportType}
              onValueChange={(value) => handleInputChange("reportType", value)}
            >
              <SelectTrigger id="reportType">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe what happened in detail..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Driver Name - Optional */}
            <div className="space-y-2">
              <Label htmlFor="driverNameInput">Driver Name (Optional)</Label>
              <div className="space-y-1 relative">
                <Input
                  id="driverNameInput"
                  placeholder="Type to search all drivers"
                  value={formData.driverNameInput}
                  onChange={(e) => handleInputChange("driverNameInput", e.target.value)}
                />
                {driverSearchStatus === "searching" && (
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Loader className="h-3.5 w-3.5 animate-spin" />
                    Searching...
                  </p>
                )}
                {driverSearchStatus === "found" && matchedDrivers.length > 0 && (
                  <div className="border rounded-md bg-white shadow-sm max-h-48 overflow-y-auto mt-1">
                    <p className="text-xs text-gray-500 px-3 py-2 border-b bg-gray-50">
                      {matchedDrivers.length} driver(s) found — select one:
                    </p>
                    {matchedDrivers.map((d) => {
                      const displayName = d.displayName || d.name || "Unknown";
                      const isSelected = formData.driverId === d.id;
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => selectDriver(d)}
                          className={`w-full text-left px-3 py-2.5 text-sm hover:bg-gray-100 transition-colors flex items-center gap-2 ${isSelected ? "bg-green-50 text-green-700 font-medium" : ""}`}
                        >
                          {isSelected && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                          {displayName}
                        </button>
                      );
                    })}
                  </div>
                )}
                {driverSearchStatus === "found" && formData.driverId && (
                  <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {formData.driverName} selected
                  </p>
                )}
                {driverSearchStatus === "not_found" && formData.driverNameInput.trim().length >= 2 && (
                  <p className="text-sm text-amber-600 flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5" />
                    No driver found. Try a different name.
                  </p>
                )}
                {formData.driverNameInput.trim().length > 0 && formData.driverNameInput.trim().length < 2 && (
                  <p className="text-xs text-gray-500">Type at least 2 characters to search</p>
                )}
              </div>
            </div>

            {/* Plate Number - Required */}
            <div className="space-y-2">
              <Label htmlFor="plateNumber">Plate Number *</Label>
              <div className="relative">
                <Input
                  id="plateNumber"
                  placeholder="Auto-fetched from driver"
                  value={formData.plateNumber}
                  onChange={(e) =>
                    handleInputChange("plateNumber", e.target.value)
                  }
                />
                {fetchingPlate && (
                  <Loader className="absolute right-3 top-3 w-4 h-4 animate-spin text-gray-400" />
                )}
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="Your contact number"
                value={formData.phoneNumber}
                onChange={(e) =>
                  handleInputChange("phoneNumber", e.target.value)
                }
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                placeholder="Where did it happen?"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
              />
            </div>

            {/* Incident Date */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="incidentDate">Incident Date (Optional)</Label>
              <Input
                id="incidentDate"
                type="datetime-local"
                value={formData.incidentDate}
                onChange={(e) =>
                  handleInputChange("incidentDate", e.target.value)
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
