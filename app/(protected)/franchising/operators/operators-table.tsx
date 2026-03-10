"use client";

import { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/data-table";
import { SearchBar } from "@/components/common/SearchBar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, Eye, Edit, Users, ChevronDown } from "lucide-react";
import { toast } from "react-toastify";
import AddDriverModal from "./add-driver-modal";
import EditOperatorModal from "./edit-operator-modal";
import DeleteOperatorModal from "./delete-operator-modal";

export interface Operator {
  id: string;
  name: string;
  email: string;
  role: string;
  franchiseNumber?: string;
  createdAt?: any;
}

interface OperatorsTableProps {
  data: Operator[];
  onOperatorUpdated?: () => void;
}

export function OperatorsTable({ data, onOperatorUpdated }: OperatorsTableProps) {
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const filteredData = useMemo(() => {
    let list = data;
    const q = searchText.trim().toLowerCase();
    if (q) {
      list = list.filter((op) => {
        const name = String(op.name ?? "").toLowerCase();
        const email = String(op.email ?? "").toLowerCase();
        const franchise = String(op.franchiseNumber ?? "").toLowerCase();
        return name.includes(q) || email.includes(q) || franchise.includes(q);
      });
    }
    if (roleFilter !== "all") {
      list = list.filter((op) => String(op.role ?? "").toLowerCase() === roleFilter.toLowerCase());
    }
    return list;
  }, [data, searchText, roleFilter]);

  const columns: ColumnDef<Operator>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role");
        return (
          <span className="capitalize px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            {String(role)}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const date = row.getValue("createdAt");
        if (!date) return "N/A";
        const createdDate = new Date(date as string | number | Date);
        return createdDate.toLocaleDateString();
      },
    },
    // ⭐ ACTIONS COLUMN ⭐
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const operator = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                onClick={() => {
                  window.location.href = `/franchising/operators/${operator.id}`;
                }}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  setSelectedOperator(operator);
                  setIsEditOpen(true);
                }}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Details
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => {
                  setSelectedOperator(operator);
                  setIsDeleteOpen(true);
                }}
                className="text-red-600 focus:text-red-600 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={filteredData}
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
              placeholder="Search by name, email, franchise #..."
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-sm">
                  {roleFilter === "all" ? "Role" : `Role: ${roleFilter}`}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[120px]">
                <DropdownMenuItem onClick={() => setRoleFilter("all")} className="cursor-pointer">
                  All roles
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRoleFilter("operator")} className="cursor-pointer">
                  Operator
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
        emptyMessage={
          searchText.trim() || roleFilter !== "all"
            ? "No operators match your filters or search."
            : "No operators found."
        }
      />

      {/* Edit Operator Modal */}
      <EditOperatorModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedOperator(null);
        }}
        operator={selectedOperator}
        onSuccess={() => {
          setIsEditOpen(false);
          setSelectedOperator(null);
          onOperatorUpdated?.();
        }}
      />

      {/* Delete Operator Modal */}
      <DeleteOperatorModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedOperator(null);
        }}
        operator={selectedOperator}
        onSuccess={() => {
          setIsDeleteOpen(false);
          setSelectedOperator(null);
          onOperatorUpdated?.();
        }}
      />

      {/* Add Driver Modal */}
      {selectedOperator && (
        <AddDriverModal
          isOpen={isAddDriverOpen}
          onClose={() => {
            setIsAddDriverOpen(false);
            setSelectedOperator(null);
          }}
          operator={selectedOperator}
          onSuccess={() => {
            setIsAddDriverOpen(false);
            setSelectedOperator(null);
            onOperatorUpdated?.();
          }}
        />
      )}
    </>
  );
}
