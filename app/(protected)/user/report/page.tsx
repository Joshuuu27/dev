"use client";

import React, { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/data-table/DataTable";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Trash2, MoreHorizontal } from "lucide-react";
import { ReportCase, getCommuterReportHistoryViaAPI, deleteReportViaAPI } from "@/lib/services/ReportService";
import { useAuthContext } from "@/app/context/AuthContext";
import { LoadingScreen } from "@/components/common/loading-component";
import { getDriverVehicles } from "@/lib/services/VehicleService";
import { toast } from "react-toastify";
import Header from "@/components/commuter/trip-history-header";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ReportWithPlateNumber extends ReportCase {
  fetchedPlateNumber?: string;
  fetchedDriverName?: string;
}

const createColumns = (onViewImages: (imageUrls: string[]) => void, onDeleteClick: (report: ReportWithPlateNumber) => void): ColumnDef<ReportWithPlateNumber>[] => [
  {
    accessorKey: "reportType",
    header: "Report Type",
    cell: ({ row }) => <div className="capitalize">{row.getValue("reportType")}</div>,
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="max-w-xs truncate">{row.getValue("description") as string}</div>
    ),
  },
  {
    accessorKey: "fetchedDriverName",
    header: "Driver Name",
    cell: ({ row }) => {
      const report = row.original;
      const name = report.fetchedDriverName || report.driverName;
      return name || "N/A";
    },
  },
  {
    accessorKey: "fetchedPlateNumber",
    header: "Plate Number",
    cell: ({ row }) => row.getValue("fetchedPlateNumber") || "N/A",
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => row.getValue("location") || "N/A",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      let statusColor = "";
      if (status === "pending") statusColor = "text-yellow-600";
      else if (status === "investigating") statusColor = "text-blue-600";
      else if (status === "resolved") statusColor = "text-green-600";

      return (
        <span className={`capitalize font-medium ${statusColor}`}>
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Reported Date",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const report = row.original;
      const hasImages = report.imageUrls && report.imageUrls.length > 0;
      const isPending = report.status === "pending";
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {hasImages && (
              <DropdownMenuItem
                onClick={() => onViewImages(report.imageUrls!)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <ImageIcon className="h-4 w-4" />
                <span>View Images ({report.imageUrls!.length})</span>
              </DropdownMenuItem>
            )}
            {!hasImages && (
              <DropdownMenuItem disabled className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                <span>No Images</span>
              </DropdownMenuItem>
            )}
            {isPending && (
              <>
                {hasImages && <div className="h-px bg-gray-100" />}
                <DropdownMenuItem
                  onClick={() => onDeleteClick(report)}
                  className="flex items-center gap-2 cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Report</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function ReportPage() {
  const { user } = useAuthContext();
  const [reports, setReports] = useState<ReportWithPlateNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<ReportWithPlateNumber | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      fetchReports();
    }
  }, [user?.uid]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await getCommuterReportHistoryViaAPI(user!.uid);
      
      // Fetch plate numbers and driver names for each report
      const reportsWithDetails = await Promise.all(
        data.map(async (report) => {
          let fetchedPlateNumber = "";
          let fetchedDriverName = report.driverName || "";
          if (report.driverId) {
            try {
              const [vehiclesRes, profileRes] = await Promise.all([
                getDriverVehicles(report.driverId),
                fetch(`/api/drivers/${report.driverId}/full-profile`),
              ]);
              if (vehiclesRes.length > 0) {
                fetchedPlateNumber = vehiclesRes[0].plateNumber;
              } else {
                fetchedPlateNumber = report.plateNumber || report.vehicleNumber || "No vehicle";
              }
              if (profileRes.ok) {
                const profile = await profileRes.json();
                fetchedDriverName = profile.displayName || profile.name || report.driverName || "";
              }
            } catch (error) {
              console.error(`Error fetching details for driver ${report.driverId}:`, error);
              fetchedPlateNumber = report.plateNumber || report.vehicleNumber || "";
            }
          }
          return {
            ...report,
            fetchedPlateNumber,
            fetchedDriverName: fetchedDriverName || undefined,
          };
        })
      );
      
      setReports(reportsWithDetails);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load report history");
    } finally {
      setLoading(false);
    }
  };

  const handleViewImages = (imageUrls: string[]) => {
    setSelectedImages(imageUrls);
    setImageModalOpen(true);
  };

  const handleDeleteClick = (report: ReportWithPlateNumber) => {
    setReportToDelete(report);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!reportToDelete) return;

    try {
      setDeleting(true);
      await deleteReportViaAPI(reportToDelete.id);
      toast.success("Report deleted successfully!");
      setDeleteConfirmOpen(false);
      setReportToDelete(null);
      fetchReports();
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Failed to delete report");
    } finally {
      setDeleting(false);
    }
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Report History</h1>
          <p className="text-gray-600 mt-2">
            View and manage your reported cases
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <DataTable
            data={reports}
            columns={createColumns(handleViewImages, handleDeleteClick)}
            showOrderNumbers={true}
            rowsPerPage={10}
            showPagination={true}
            showColumnFilter={true}
            showColumnToggle={true}
            emptyMessage="No reports found. Start by creating a new report."
          />
        </div>

        {/* Image Viewer Modal */}
        <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Report Images</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-4 max-h-96 overflow-y-auto">
              {selectedImages.map((imageUrl, index) => (
                <div key={index} className="flex flex-col">
                  <a
                    href={imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <img
                      src={imageUrl}
                      alt={`Report evidence ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border border-gray-200 hover:border-gray-400 transition-all hover:shadow-md"
                    />
                  </a>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Image {index + 1}
                  </p>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">
                Are you sure you want to delete this report? This action cannot be undone.
              </p>
              {reportToDelete && (
                <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Type:</span> {reportToDelete.reportType}
                  </p>
                  <p>
                    <span className="font-medium">Description:</span> {reportToDelete.description}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span> <span className="capitalize text-yellow-600">{reportToDelete.status}</span>
                  </p>
                </div>
              )}
              <div className="flex items-center gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirmOpen(false)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete Report"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
