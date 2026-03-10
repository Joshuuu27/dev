"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/data-table/DataTable";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertTriangle, MapPin, Phone, Mail, MoreHorizontal, Eye, Calendar, ChevronDown } from "lucide-react";
import { SOSAlert, updateSOSAlertStatusViaAPI } from "@/lib/services/SOSService";
import { LoadingScreen } from "@/components/common/loading-component";
import { toast } from "react-toastify";
import Header from "@/components/police/police-header";
import { useSOSAlertContext } from "@/app/context/SOSAlertContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SearchBar } from "@/components/common/SearchBar";

export default function SOSAlertsPage() {
  const { setHasNewAlert: setContextHasNewAlert } = useSOSAlertContext();
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<SOSAlert | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<"active" | "resolved" | "cancelled">("active");
  const [isUpdating, setIsUpdating] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [hasNewAlert, setHasNewAlert] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchText, setSearchText] = useState("");
  const blinkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousAlertsRef = useRef<SOSAlert[]>([]);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    alerts.forEach((a) => years.add(new Date(a.timestamp).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [alerts]);

  const alertsByYear = useMemo(() => {
    let list = alerts;
    if (selectedYear !== "all") {
      const y = parseInt(selectedYear, 10);
      list = list.filter((a) => new Date(a.timestamp).getFullYear() === y);
    }
    if (selectedStatus !== "all") {
      list = list.filter((a) => String(a?.status).toLowerCase() === selectedStatus.toLowerCase());
    }
    const q = searchText.trim().toLowerCase();
    if (q) {
      list = list.filter((a) => {
        const userName = String(a.userName ?? "").toLowerCase();
        const userEmail = String(a.userEmail ?? "").toLowerCase();
        const driverName = String(a.driverName ?? "").toLowerCase();
        const plateNumber = String(a.plateNumber ?? "").toLowerCase();
        const address = String(a.address ?? "").toLowerCase();
        const vehicleType = String(a.vehicleType ?? "").toLowerCase();
        const userPhone = String(a.userPhone ?? "").toLowerCase();
        return (
          userName.includes(q) ||
          userEmail.includes(q) ||
          driverName.includes(q) ||
          plateNumber.includes(q) ||
          address.includes(q) ||
          vehicleType.includes(q) ||
          userPhone.includes(q)
        );
      });
    }
    return list;
  }, [alerts, selectedYear, selectedStatus, searchText]);

  const columns: ColumnDef<SOSAlert>[] = [
    {
      accessorKey: "userName",
      header: "User Name",
      cell: ({ row }) => row.getValue("userName") || "Unknown",
    },
    {
      accessorKey: "driverName",
      header: "Driver Name",
      cell: ({ row }) => row.getValue("driverName") || "N/A",
    },
    {
      accessorKey: "plateNumber",
      header: "Plate Number",
      cell: ({ row }) => row.getValue("plateNumber") || "N/A",
    },
    {
      accessorKey: "vehicleType",
      header: "Vehicle Type",
      cell: ({ row }) => row.getValue("vehicleType") || "N/A",
    },
    {
      accessorKey: "address",
      header: "Location",
      cell: ({ row }) => (
        <div className="max-w-xs truncate">{row.getValue("address") || "Coordinates available"}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        let statusColor = "";
        if (status === "active") statusColor = "text-red-600";
        else if (status === "resolved") statusColor = "text-green-600";
        else if (status === "cancelled") statusColor = "text-gray-600";

        return <span className={`capitalize font-medium ${statusColor}`}>{status}</span>;
      },
    },
    {
      accessorKey: "timestamp",
      header: "Alert Time",
      cell: ({ row }) => {
        const date = row.getValue("timestamp") as Date;
        return new Date(date).toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        });
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const alert = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedAlert(alert);
                  setNewStatus(alert.status);
                  setIsStatusDialogOpen(true);
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  useEffect(() => {
    fetchAlerts();

    // Set up auto-refresh every 10 seconds if enabled
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchAlerts();
      }, 10000);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (blinkIntervalRef.current) clearInterval(blinkIntervalRef.current);
    };
  }, [autoRefresh]);

  // Update page title with blinking effect and play sound for new alerts
  useEffect(() => {
    if (hasNewAlert) {
      // Update global context
      setContextHasNewAlert(true);

      // Start blinking
      let blink = true;
      blinkIntervalRef.current = setInterval(() => {
        blink = !blink;
        document.title = blink ? "🚨 NEW SOS ALERT! 🚨" : "SOS Alerts";
        setIsBlinking(blink);
      }, 500); // Blink every 500ms

      // Play immediate alarm sequence
      playAlarmSequence();

      // Play alarm sound repeatedly every 2 seconds
      const soundInterval = setInterval(() => {
        playAlarmSequence();
      }, 2000);

      // Auto-stop blinking after 60 seconds
      const stopBlinkTimeout = setTimeout(() => {
        if (blinkIntervalRef.current) clearInterval(blinkIntervalRef.current);
        clearInterval(soundInterval);
        setHasNewAlert(false);
        setContextHasNewAlert(false);
        setIsBlinking(false);
        document.title = "SOS Alerts";
      }, 60000);

      return () => {
        clearTimeout(stopBlinkTimeout);
        clearInterval(soundInterval);
        if (blinkIntervalRef.current) clearInterval(blinkIntervalRef.current);
        document.title = "SOS Alerts";
      };
    }
  }, [hasNewAlert, setContextHasNewAlert]);

  const fetchAlerts = async () => {
    try {
      const response = await fetch("/api/police/sos-alerts");
      if (!response.ok) throw new Error("Failed to fetch alerts");
      const data = await response.json();
      
      // Check for new alerts within 2 minutes
      const now = new Date();
      const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
      
      const newAlerts = data.filter((alert: any) => {
        const alertTime = new Date(alert.timestamp);
        return alertTime > twoMinutesAgo;
      });

      // Compare with previous alerts to detect new ones
      const previousAlertIds = new Set(previousAlertsRef.current.map((a) => a.id));
      const actualNewAlerts = newAlerts.filter((alert: any) => !previousAlertIds.has(alert.id));

      // Trigger notification if there are new alerts
      if (actualNewAlerts.length > 0) {
        setHasNewAlert(true);
        toast.error(
          `🚨 NEW SOS ALERT! ${actualNewAlerts.length} new emergency alert${actualNewAlerts.length > 1 ? "s" : ""}`
        );
      }

      setAlerts(data);
      previousAlertsRef.current = data;
    } catch (error) {
      console.error("Error fetching SOS alerts:", error);
      toast.error("Failed to load SOS alerts");
    } finally {
      if (loading) setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedAlert) return;

    try {
      setIsUpdating(true);
      await updateSOSAlertStatusViaAPI(selectedAlert.id, newStatus);
      toast.success("Alert status updated successfully!");
      setIsStatusDialogOpen(false);
      setSelectedAlert(null);
      fetchAlerts();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update alert status");
    } finally {
      setIsUpdating(false);
    }
  };

  // Play alarm sound using Web Audio API
  const playAlarmSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Create siren effect with frequency sweep
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log("Web Audio API error:", error);
    }
  };

  // Play alarm multiple times for emphasis
  const playAlarmSequence = () => {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        playAlarmSound();
      }, i * 600);
    }
  };

  // Stop the alarm and blinking
  const stopAlarm = () => {
    if (blinkIntervalRef.current) clearInterval(blinkIntervalRef.current);
    setHasNewAlert(false);
    setContextHasNewAlert(false);
    setIsBlinking(false);
    document.title = "SOS Alerts";
  };

  const openMapLocation = (latitude: number, longitude: number) => {
    const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(mapUrl, "_blank");
  };

  if (loading) {
    return (
      <>
        <Header />
        <LoadingScreen />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="max-w-5xl mx-auto px-6 py-8 w-full">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">SOS Alerts</h1>
            <p className="text-gray-600 mt-2">
              Emergency alerts from users ({alertsByYear.length}
              {(selectedYear !== "all" || selectedStatus !== "all" || searchText.trim()) ? ` of ${alerts.length}` : ""})
            </p>
          </div>
          <div className="flex gap-2">
            {hasNewAlert && (
              <Button
                onClick={stopAlarm}
                variant="destructive"
                size="sm"
                className="animate-pulse"
              >
                Stop Alarm 🔇
              </Button>
            )}
            <Button
              variant={autoRefresh ? "default" : "outline"}
              onClick={() => setAutoRefresh(!autoRefresh)}
              size="sm"
            >
              {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
            </Button>
            <Button onClick={() => fetchAlerts()} size="sm">
              Refresh Now
            </Button>
          </div>
        </div>

        {alerts.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-600 rounded">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-red-700">
                {alerts.length} emergency alert{alerts.length > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm font-medium text-slate-600">Year:</span>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[140px] h-9">
                <Calendar className="mr-2 h-4 w-4 text-slate-500" />
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All years</SelectItem>
                {availableYears.map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DataTable
            data={alertsByYear}
            columns={columns}
            showOrderNumbers={true}
            rowsPerPage={10}
            showPagination={true}
            showColumnFilter={false}
            showColumnToggle={true}
            extraToolbarContent={
              <>
                <SearchBar
                  value={searchText}
                  onChange={setSearchText}
                  placeholder="Search user, driver, plate, email, location..."
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-sm">
                      {selectedStatus === "all" ? "Status" : `Status: ${selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}`}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="min-w-[140px]">
                    <DropdownMenuItem onClick={() => setSelectedStatus("all")} className="cursor-pointer">
                      All statuses
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedStatus("active")} className="cursor-pointer">
                      Active
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedStatus("resolved")} className="cursor-pointer">
                      Resolved
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedStatus("cancelled")} className="cursor-pointer">
                      Cancelled
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            }
            emptyMessage={
              selectedYear !== "all" || selectedStatus !== "all" || searchText.trim()
                ? "No alerts match your filters or search."
                : "No SOS alerts found."
            }
          />
        </div>
      </div>

      {/* Alert Details Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              SOS Emergency Alert Details
            </DialogTitle>
          </DialogHeader>

          {selectedAlert && (
            <div className="space-y-4">
              {/* User Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-gray-600">User Name</p>
                  <p className="font-semibold">{selectedAlert.userName}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-sm">{selectedAlert.userEmail}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              {selectedAlert.userPhone && (
                <div className="p-3 bg-slate-50 rounded-lg flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold">{selectedAlert.userPhone}</p>
                  </div>
                </div>
              )}

              {/* Driver Information */}
              {selectedAlert.driverName && (
                <>
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Driver Information</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-sm text-gray-600">Driver Name</p>
                        <p className="font-semibold">{selectedAlert.driverName}</p>
                      </div>
                      {selectedAlert.licenseNumber && (
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-sm text-gray-600">License Number</p>
                          <p className="font-semibold">{selectedAlert.licenseNumber}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Vehicle Information */}
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Vehicle Information</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedAlert.vehicleType && (
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-sm text-gray-600">Vehicle Type</p>
                          <p className="font-semibold">{selectedAlert.vehicleType}</p>
                        </div>
                      )}
                      {selectedAlert.plateNumber && (
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-sm text-gray-600">Plate Number</p>
                          <p className="font-semibold">{selectedAlert.plateNumber}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Location Information */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-grow">
                    <p className="text-sm font-medium text-blue-900">Location</p>
                    <p className="text-sm text-blue-700 mt-1">
                      {selectedAlert.address || "Coordinates detected"}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Lat: {selectedAlert.latitude.toFixed(6)}, Lon:{" "}
                      {selectedAlert.longitude.toFixed(6)}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() =>
                        openMapLocation(selectedAlert.latitude, selectedAlert.longitude)
                      }
                    >
                      Open in Google Maps
                    </Button>
                  </div>
                </div>
              </div>

              {/* Time Information */}
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-gray-600">Alert Time</p>
                <p className="font-semibold">
                  {new Date(selectedAlert.timestamp).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "medium",
                  })}
                </p>
              </div>

              {/* Status Update */}
              <div className="space-y-2 border-t pt-4">
                <label className="text-sm font-medium">Update Status</label>
                <Select
                  value={newStatus}
                  onValueChange={(value: any) => setNewStatus(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStatusDialogOpen(false)}
              disabled={isUpdating}
            >
              Close
            </Button>
            <Button onClick={handleStatusUpdate} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
