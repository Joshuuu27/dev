"use client";

import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useAuthContext } from "@/app/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/operator/operator-header";
import { DataTable } from "@/components/common/data-table";
import { SearchBar } from "@/components/common/SearchBar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { toast } from "react-toastify";
import {
  createOperatorVehicleColumns,
  OperatorVehicleData,
} from "./vehicle-columns";
import { AssignDriverModal } from "./assign-driver-modal";
import { EditVehicleModal } from "./edit-vehicle-modal";
import { DeleteVehicleModal } from "./delete-vehicle-modal";
import DriverDetailsModal from "./driver-details-modal";
import { getDriverLicense } from "@/lib/services/DriverLicenseService";

const OperatorVehiclesPage = () => {
  const { user } = useAuthContext();
  const [vehicles, setVehicles] = useState<OperatorVehicleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAssignDriverOpen, setIsAssignDriverOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDriverDetailsOpen, setIsDriverDetailsOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] =
    useState<OperatorVehicleData | null>(null);
  const [searchText, setSearchText] = useState("");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>("all");
  const hasFetched = useRef(false);

  const filteredVehicles = useMemo(() => {
    let list = vehicles;
    const q = searchText.trim().toLowerCase();
    if (q) {
      list = list.filter((v) => {
        const plate = String(v.plateNumber ?? "").toLowerCase();
        const body = String(v.bodyNumber ?? "").toLowerCase();
        const type = String(v.vehicleType ?? "").toLowerCase();
        const driver = String(v.assignedDriverName ?? "").toLowerCase();
        const license = String(v.driverLicenseNumber ?? "").toLowerCase();
        return plate.includes(q) || body.includes(q) || type.includes(q) || driver.includes(q) || license.includes(q);
      });
    }
    if (vehicleTypeFilter !== "all") {
      list = list.filter((v) => String(v.vehicleType ?? "").toLowerCase() === vehicleTypeFilter.toLowerCase());
    }
    return list;
  }, [vehicles, searchText, vehicleTypeFilter]);

  const fetchVehicles = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const res = await fetch(
        `/api/vehicles?operatorId=${user.uid}`
      );
      if (!res.ok) throw new Error("Failed to fetch vehicles");

      let vehiclesData = await res.json();

      // Fetch license numbers for each driver
      const vehiclesWithLicenses = await Promise.all(
        vehiclesData.map(async (vehicle: OperatorVehicleData) => {
          if (vehicle.assignedDriverId) {
            try {
              const license = await getDriverLicense(vehicle.assignedDriverId);
              return {
                ...vehicle,
                driverLicenseNumber: license?.licenseNumber || "N/A",
              };
            } catch (error) {
              console.error("Error fetching license:", error);
              return {
                ...vehicle,
                driverLicenseNumber: "N/A",
              };
            }
          }
          return {
            ...vehicle,
            driverLicenseNumber: "N/A",
          };
        })
      );

      setVehicles(vehiclesWithLicenses);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      toast.error("Failed to load vehicles");
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (!hasFetched.current && user?.uid) {
      hasFetched.current = true;
      fetchVehicles();
    }
  }, [user?.uid, fetchVehicles]);

  const handleAssignDriver = (vehicle: OperatorVehicleData) => {
    setSelectedVehicle(vehicle);
    setIsAssignDriverOpen(true);
  };

  const handleEdit = (vehicle: OperatorVehicleData) => {
    setSelectedVehicle(vehicle);
    setIsEditOpen(true);
  };

  const handleDelete = (vehicle: OperatorVehicleData) => {
    setSelectedVehicle(vehicle);
    setIsDeleteOpen(true);
  };

  const handleViewDriverDetails = (vehicle: OperatorVehicleData) => {
    setSelectedVehicle(vehicle);
    setIsDriverDetailsOpen(true);
  };

  const columns = createOperatorVehicleColumns({
    onAssignDriver: handleAssignDriver,
    onEdit: handleEdit,
    onDelete: handleDelete,
    onViewDriverDetails: handleViewDriverDetails,
  });

  return (
    <>
      <Header />

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-4 space-y-6">
        {/* Header with Button */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Vehicle Management</h1>
          {/* <Button disabled className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Vehicle
          </Button> */}
        </div>

        {/* Vehicles Table Card */}
        <Card>
          <CardContent className="p-6 space-y-2">
            <div>
              <div>
                <h2 className="text-2xl font-semibold mb-6">Assigned Vehicles</h2>
              </div>
              {/* Vehicles table */}
              {loading ? (
                <div className="text-center text-gray-500 py-8">
                  Loading vehicles...
                </div>
              ) : vehicles.length === 0 ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-2">
                      No vehicles assigned yet
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Contact your administrator to assign vehicles to your operator account.
                    </p>
                  </div>
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={filteredVehicles}
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
                        placeholder="Search plate, driver, vehicle type..."
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 text-sm">
                            {vehicleTypeFilter === "all" ? "Vehicle Type" : `Type: ${vehicleTypeFilter}`}
                            <ChevronDown className="ml-2 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="min-w-[140px]">
                          <DropdownMenuItem onClick={() => setVehicleTypeFilter("all")} className="cursor-pointer">
                            All types
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setVehicleTypeFilter("Baobao")} className="cursor-pointer">
                            Baobao
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setVehicleTypeFilter("Tricycle")} className="cursor-pointer">
                            Tricycle
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setVehicleTypeFilter("Other")} className="cursor-pointer">
                            Other
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setVehicleTypeFilter("Others")} className="cursor-pointer">
                            Others
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  }
                  emptyMessage={
                    searchText.trim() || vehicleTypeFilter !== "all"
                      ? "No vehicles match your filters or search."
                      : "No vehicles assigned yet."
                  }
                />
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Modals */}
      <AssignDriverModal
        vehicle={selectedVehicle}
        open={isAssignDriverOpen}
        onOpenChange={setIsAssignDriverOpen}
        onAssigned={fetchVehicles}
      />

      <EditVehicleModal
        vehicle={selectedVehicle}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onUpdated={fetchVehicles}
      />

      <DeleteVehicleModal
        vehicle={selectedVehicle}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onDeleted={fetchVehicles}
      />

      <DriverDetailsModal
        isOpen={isDriverDetailsOpen}
        onClose={() => {
          setIsDriverDetailsOpen(false);
          setSelectedVehicle(null);
        }}
        driverId={selectedVehicle?.assignedDriverId}
        driverName={selectedVehicle?.assignedDriverName}
        vehicleColor={selectedVehicle?.color}
        operatorName={user?.displayName || "Operator"}
      />
    </>
  );
};

export default OperatorVehiclesPage;
