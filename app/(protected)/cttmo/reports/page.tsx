"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/cttmo/cttmo-header";
import { DataTable } from "@/components/common/data-table/DataTable";
import { SearchBar } from "@/components/common/SearchBar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { LoadingScreen } from "@/components/common/loading-component";
import { toast } from "react-toastify";
import {
  createReportColumns,
  Report,
} from "../reports-columns";
import { ReportDetailsModal } from "../report-details-modal";

export default function CTTMOReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredReports = useMemo(() => {
    let list = reports;
    const q = searchText.trim().toLowerCase();
    if (q) {
      list = list.filter((r) => {
        const commuter = String(r.commuterName ?? "").toLowerCase();
        const type = String(r.reportType ?? "").toLowerCase();
        const plate = String(r.plateNumber ?? "").toLowerCase();
        const desc = String(r.description ?? "").toLowerCase();
        const location = String(r.location ?? "").toLowerCase();
        const operator = String(r.operatorName ?? "").toLowerCase();
        return commuter.includes(q) || type.includes(q) || plate.includes(q) || desc.includes(q) || location.includes(q) || operator.includes(q);
      });
    }
    if (statusFilter !== "all") {
      list = list.filter((r) => String(r.status ?? "").toLowerCase() === statusFilter.toLowerCase());
    }
    return list;
  }, [reports, searchText, statusFilter]);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/reports");
      if (!res.ok) throw new Error("Failed to fetch reports");
      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports");
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleViewDetails = (report: Report) => {
    setSelectedReport(report);
    setIsDetailsOpen(true);
  };

  const handleStatusChange = (reportId: string, newStatus: string) => {
    // Update the report in the list
    setReports(prevReports =>
      prevReports.map(r =>
        r.id === reportId ? { ...r, status: newStatus as "pending" | "investigating" | "resolved" } : r
      )
    );
  };

  const columns = createReportColumns({
    onViewDetails: handleViewDetails,
  });

  if (loading) return <LoadingScreen />;

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all driver reports filed by commuters
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              All Reports ({reports.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No reports found</p>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={filteredReports}
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
                      placeholder="Search commuter, report type, plate, location..."
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 text-sm">
                          {statusFilter === "all" ? "Status" : `Status: ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}`}
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="min-w-[140px]">
                        <DropdownMenuItem onClick={() => setStatusFilter("all")} className="cursor-pointer">
                          All statuses
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter("pending")} className="cursor-pointer">
                          Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter("investigating")} className="cursor-pointer">
                          Investigating
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter("resolved")} className="cursor-pointer">
                          Resolved
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                }
                emptyMessage={
                  searchText.trim() || statusFilter !== "all"
                    ? "No reports match your filters or search."
                    : "No reports available"
                }
              />
            )}
          </CardContent>
        </Card>
      </main>

      {/* Report Details Modal */}
      <ReportDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedReport(null);
        }}
        report={selectedReport}
        onStatusChange={handleStatusChange}
      />
    </>
  );
}
