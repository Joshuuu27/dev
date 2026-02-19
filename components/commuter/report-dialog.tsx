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
import { toast } from "react-toastify";
import { Loader, CheckCircle2, XCircle } from "lucide-react";

interface DriverOperatorMatch {
  driverId: string;
  driverName: string;
  operatorId: string;
  operatorName: string;
  plates: string[];
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
  const [formData, setFormData] = useState({
    reportType: "",
    description: "",
    driverOperatorInput: "",
    driverId: "",
    driverName: "",
    operatorId: "",
    operatorName: "",
    plateNumber: "",
    location: "",
    phoneNumber: "",
    incidentDate: "",
  });
  const [nameSearchStatus, setNameSearchStatus] = useState<"idle" | "searching" | "found" | "not_found">("idle");
  const [plateSearchStatus, setPlateSearchStatus] = useState<"idle" | "searching" | "found" | "not_found">("idle");
  const [matchedResults, setMatchedResults] = useState<DriverOperatorMatch[]>([]);
  const [driverPlates, setDriverPlates] = useState<string[]>([]);
  const [plateInputTouched, setPlateInputTouched] = useState(false);

  // Search by driver/operator name
  const searchByName = useCallback(async (q: string) => {
    if (!q || q.trim().length < 2) {
      setNameSearchStatus("idle");
      setMatchedResults([]);
      setFormData((prev) => ({ ...prev, driverId: "", driverName: "", operatorId: "", operatorName: "", plateNumber: "" }));
      setDriverPlates([]);
      return;
    }
    setNameSearchStatus("searching");
    try {
      const res = await fetch(`/api/report-search?q=${encodeURIComponent(q.trim())}`);
      const data: DriverOperatorMatch[] = await res.json();
      if (Array.isArray(data)) {
        setMatchedResults(data);
        setNameSearchStatus(data.length > 0 ? "found" : "not_found");
        if (data.length === 1 && data[0].plates.length > 0) {
          const d = data[0];
          const display = d.driverName || d.operatorName || "Unknown";
          setFormData((prev) => ({
            ...prev,
            driverOperatorInput: display,
            driverId: d.driverId,
            driverName: d.driverName,
            operatorId: d.operatorId,
            operatorName: d.operatorName,
            plateNumber: d.plates[0] || "",
          }));
          setDriverPlates(d.plates.map((p) => p.trim().toLowerCase()).filter(Boolean));
        } else {
          setFormData((prev) => {
            if (prev.driverId) return prev;
            return { ...prev, driverId: "", driverName: "", operatorId: "", operatorName: "", plateNumber: "" };
          });
          if (data.length > 1) setDriverPlates([]);
        }
      } else {
        setMatchedResults([]);
        setNameSearchStatus("not_found");
        setFormData((prev) => {
          if (prev.driverId) return prev;
          return { ...prev, driverId: "", driverName: "", operatorId: "", operatorName: "", plateNumber: "" };
        });
      }
    } catch (error) {
      console.error("Error searching:", error);
      setNameSearchStatus("not_found");
      setMatchedResults([]);
      setFormData((prev) => {
        if (prev.driverId) return prev;
        return { ...prev, driverId: "", driverName: "", operatorId: "", operatorName: "", plateNumber: "" };
      });
    }
  }, []);

  useEffect(() => {
    const q = formData.driverOperatorInput.trim();
    const t = setTimeout(() => {
      searchByName(q);
    }, 400);
    return () => clearTimeout(t);
  }, [formData.driverOperatorInput, searchByName]);

  const selectMatch = (m: DriverOperatorMatch) => {
    const display = m.driverName || m.operatorName || "Unknown";
    const plates = m.plates.map((p) => p.trim().toLowerCase()).filter(Boolean);
    setFormData((prev) => ({
      ...prev,
      driverOperatorInput: display,
      driverId: m.driverId,
      driverName: m.driverName,
      operatorId: m.operatorId,
      operatorName: m.operatorName,
      plateNumber: m.plates[0] || "",
    }));
    setDriverPlates(plates);
    setMatchedResults([]);
    setNameSearchStatus("found");
  };

  // Search by plate number - auto-fill driver/operator when plate found
  const searchByPlate = useCallback(async (plate: string) => {
    if (!plate || plate.trim().length < 2) {
      setPlateSearchStatus("idle");
      if (!formData.driverId) {
        setFormData((prev) => ({ ...prev, driverId: "", driverName: "", operatorId: "", operatorName: "" }));
        setDriverPlates([]);
      }
      return;
    }
    setPlateSearchStatus("searching");
    try {
      const res = await fetch(`/api/vehicles?plateNumber=${encodeURIComponent(plate.trim())}`);
      const vehicles: any[] = await res.json();
      if (Array.isArray(vehicles) && vehicles.length > 0) {
        const v = vehicles[0];
        const driverId = v.assignedDriverId || "";
        const driverName = v.assignedDriverName || "Unknown";
        const operatorId = v.operatorId || "";
        const operatorName = v.operatorName || "Unknown";
        const display = driverName || operatorName;
        setFormData((prev) => ({
          ...prev,
          driverOperatorInput: display,
          driverId,
          driverName,
          operatorId,
          operatorName,
          plateNumber: v.plateNumber || plate.trim(),
        }));
        setDriverPlates([(v.plateNumber || plate).trim().toLowerCase()]);
        setPlateSearchStatus("found");
      } else {
        setPlateSearchStatus("not_found");
        if (!formData.driverId) {
          setFormData((prev) => ({ ...prev, driverId: "", driverName: "", operatorId: "", operatorName: "" }));
          setDriverPlates([]);
        }
      }
    } catch (error) {
      console.error("Error searching by plate:", error);
      setPlateSearchStatus("not_found");
      if (!formData.driverId) {
        setFormData((prev) => ({ ...prev, driverId: "", driverName: "", operatorId: "", operatorName: "" }));
        setDriverPlates([]);
      }
    }
  }, [formData.driverId]);

  useEffect(() => {
    if (!plateInputTouched) return;
    if (formData.driverId && formData.plateNumber) return; // Already have driver from name search
    const t = setTimeout(() => {
      searchByPlate(formData.plateNumber);
    }, 500);
    return () => clearTimeout(t);
  }, [formData.plateNumber, plateInputTouched, formData.driverId, searchByPlate]);

  const handleInputChange = (field: string, value: string | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "plateNumber") setPlateInputTouched(true);
    if (field === "driverOperatorInput") {
      setPlateInputTouched(false);
      setFormData((prev) => ({ ...prev, plateNumber: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.reportType) {
      toast.error("Please select a report type");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Please provide a description");
      return;
    }
    const plateTrim = formData.plateNumber?.trim() || "";
    if (plateTrim && formData.driverId?.trim() && driverPlates.length > 0 && !driverPlates.includes(plateTrim.toLowerCase())) {
      toast.error("This plate number does not belong to the selected driver.");
      return;
    }
    if (!plateTrim && !formData.driverId?.trim()) {
      toast.error("Please enter plate number or search and select a driver/operator.");
      return;
    }
    if (!plateTrim && formData.driverId?.trim()) {
      if (driverPlates.length > 0) {
        toast.error("Please enter the plate number for the selected driver.");
        return;
      }
    }
    if (plateTrim && !formData.driverId?.trim()) {
      try {
        const res = await fetch(`/api/vehicles?plateNumber=${encodeURIComponent(plateTrim)}`);
        const vehicles = await res.json();
        if (!Array.isArray(vehicles) || vehicles.length === 0) {
          toast.error("This plate number is not registered. Please enter a valid plate or search by driver/operator name.");
          return;
        }
      } catch (err) {
        toast.error("Could not verify plate number. Please try again.");
        return;
      }
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
        driverName: formData.driverName || formData.driverOperatorInput?.trim() || undefined,
        plateNumber: formData.plateNumber || undefined,
        location: formData.location || undefined,
        incidentDate: formData.incidentDate ? new Date(formData.incidentDate) : undefined,
      };
      await submitReportCaseViaAPI(reportData);

      setFormData({
        reportType: "",
        description: "",
        driverOperatorInput: "",
        driverId: "",
        driverName: "",
        operatorId: "",
        operatorName: "",
        plateNumber: "",
        location: "",
        phoneNumber: "",
        incidentDate: "",
      });
      setNameSearchStatus("idle");
      setPlateSearchStatus("idle");
      setMatchedResults([]);
      setDriverPlates([]);
      setPlateInputTouched(false);
      onOpenChange(false);
      onReportSubmitted?.();
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const plateTrimForSubmit = formData.plateNumber?.trim();
  const hasDriver = !!formData.driverId?.trim();
  const plateMatchesDriver = !hasDriver || driverPlates.length === 0 || (plateTrimForSubmit && driverPlates.includes(plateTrimForSubmit.toLowerCase()));
  const hasEnoughInfo = formData.reportType && formData.description.trim() && (plateTrimForSubmit || hasDriver);
  const canSubmit = !!(hasEnoughInfo && plateMatchesDriver);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>File a Report</DialogTitle>
          <DialogDescription>
            Search by driver/operator name or plate number. Provide details about your incident.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reportType">Report Type *</Label>
            <Select value={formData.reportType} onValueChange={(v) => handleInputChange("reportType", v)}>
              <SelectTrigger id="reportType">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
            {/* Driver or Operator Name - one name they remember */}
            <div className="space-y-2">
              <Label htmlFor="driverOperatorInput">Driver or Operator Name</Label>
              <div className="space-y-1">
                <Input
                  id="driverOperatorInput"
                  placeholder="Type the name you remember (driver or operator)"
                  value={formData.driverOperatorInput}
                  onChange={(e) => handleInputChange("driverOperatorInput", e.target.value)}
                />
                {nameSearchStatus === "searching" && (
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Loader className="h-3.5 w-3.5 animate-spin" />
                    Searching...
                  </p>
                )}
                {nameSearchStatus === "found" && matchedResults.length > 0 && (
                  <div className="border rounded-md bg-white shadow-sm max-h-48 overflow-y-auto mt-1">
                    <p className="text-xs text-gray-500 px-3 py-2 border-b bg-gray-50">
                      {matchedResults.length} result(s) — select one:
                    </p>
                    {matchedResults.map((m, i) => {
                      const display = m.driverName || m.operatorName || "Unknown";
                      const hasPlate = m.plates.length > 0;
                      const isSelected = formData.driverId === m.driverId;
                      return (
                        <button
                          key={`${m.driverId}-${m.operatorId}-${i}`}
                          type="button"
                          onClick={() => selectMatch(m)}
                          className={`w-full text-left px-3 py-2.5 text-sm hover:bg-gray-100 transition-colors flex items-center gap-2 ${isSelected ? "bg-green-50 text-green-700 font-medium" : ""}`}
                        >
                          {isSelected && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                          <span>{display}</span>
                          {!hasPlate && <span className="text-amber-600 text-xs">(No vehicle)</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
                {nameSearchStatus === "found" && formData.driverId && (
                  <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {formData.driverName || formData.operatorName}
                  </p>
                )}
                {nameSearchStatus === "not_found" && formData.driverOperatorInput.trim().length >= 2 && (
                  <p className="text-sm text-amber-600 flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5" />
                    No driver or operator found. Try plate number search below.
                  </p>
                )}
              </div>
            </div>

            {/* Plate Number - can search by plate to auto-fill driver/operator */}
            <div className="space-y-2">
              <Label htmlFor="plateNumber">Plate Number *</Label>
              <div className="relative">
                <Input
                  id="plateNumber"
                  placeholder="Or type plate to search and auto-fill driver/operator"
                  value={formData.plateNumber}
                  onChange={(e) => handleInputChange("plateNumber", e.target.value)}
                />
                {plateSearchStatus === "searching" && (
                  <Loader className="absolute right-3 top-3 w-4 h-4 animate-spin text-gray-400" />
                )}
                {formData.driverId && driverPlates.length === 0 && (
                  <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                    This driver has no registered vehicle. Report will still be saved and shown on the list.
                  </p>
                )}
                {formData.driverId && formData.plateNumber?.trim() && driverPlates.length > 0 && !driverPlates.includes(formData.plateNumber.trim().toLowerCase()) && (
                  <p className="text-sm text-amber-600 flex items-center gap-1 mt-1">
                    <XCircle className="h-3.5 w-3.5" />
                    This plate does not belong to the selected driver.
                  </p>
                )}
                {plateSearchStatus === "not_found" && formData.plateNumber?.trim().length >= 2 && !formData.driverId && (
                  <p className="text-sm text-amber-600 flex items-center gap-1 mt-1">
                    <XCircle className="h-3.5 w-3.5" />
                    Plate not found. Try searching by driver/operator name.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="Your contact number"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Where did it happen?"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="incidentDate">Incident Date</Label>
              <Input
                id="incidentDate"
                type="datetime-local"
                value={formData.incidentDate}
                onChange={(e) => handleInputChange("incidentDate", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !canSubmit}>
              {loading ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
