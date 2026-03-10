"use client";

import { useAuthContext } from "@/app/context/AuthContext";
import Header from "@/components/franchising/franchising-header";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState, useMemo } from "react";
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
import { columns } from "./columns";

type DriverRow = { id: string; name?: string; email?: string; role?: string; [key: string]: unknown };

const FranchisingPage = () => {
  const { user, role } = useAuthContext();
  const [drivers, setDrivers] = useState<DriverRow[]>([]);
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/drivers");
      const data = await res.json();
      setDrivers(data);
    };

    load();
  }, []);

  const filteredDrivers = useMemo(() => {
    let list = drivers;
    const q = searchText.trim().toLowerCase();
    if (q) {
      list = list.filter((d) => {
        const name = String(d.name ?? "").toLowerCase();
        const email = String(d.email ?? "").toLowerCase();
        const r = String(d.role ?? "").toLowerCase();
        return name.includes(q) || email.includes(q) || r.includes(q);
      });
    }
    if (roleFilter !== "all") {
      list = list.filter((d) => String(d.role ?? "").toLowerCase() === roleFilter.toLowerCase());
    }
    return list;
  }, [drivers, searchText, roleFilter]);

  return (
    <>
      <Header />

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <div>
                <h2 className="text-2xl font-semibold mb-6">Drivers</h2>
              </div>
              <DataTable
                columns={columns}
                data={filteredDrivers}
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
                      placeholder="Search by name, email..."
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
                        <DropdownMenuItem onClick={() => setRoleFilter("driver")} className="cursor-pointer">
                          Driver
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                }
                emptyMessage={
                  searchText.trim() || roleFilter !== "all"
                    ? "No drivers match your filters or search."
                    : "No drivers found."
                }
              />
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
};

export default FranchisingPage;
