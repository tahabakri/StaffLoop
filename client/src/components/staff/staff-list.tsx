import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/lib/utils";
import { Edit, MoreVertical, Plus, Search, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StaffMember {
  id: number;
  name: string;
  role: string;
  email: string;
  phone?: string;
  profileImage?: string;
  status?: "checked-in" | "late" | "absent" | "not-scheduled";
}

interface StaffListProps {
  eventId?: number;
}

export function StaffList({ eventId }: StaffListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch staff list
  const { data: staffMembers, isLoading } = useQuery<StaffMember[]>({
    queryKey: ['/api/staff', { eventId }],
    enabled: eventId !== undefined,
  });

  // Get unique roles for filtering
  const roles = staffMembers 
    ? [...new Set(staffMembers.map(staff => staff.role))]
    : [];

  // Filter staff members
  const filteredStaff = staffMembers
    ? staffMembers.filter(staff => {
        // Search filter
        const matchesSearch = searchQuery 
          ? staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (staff.phone && staff.phone.includes(searchQuery))
          : true;

        // Role filter
        const matchesRole = roleFilter 
          ? staff.role === roleFilter
          : true;

        // Status filter
        const matchesStatus = statusFilter
          ? staff.status === statusFilter
          : true;

        return matchesSearch && matchesRole && matchesStatus;
      })
    : [];

  const handleManualCheckIn = (staffId: number) => {
    toast({
      title: "Manual Check-In",
      description: "Manual check-in feature will be available soon.",
    });
  };

  const handleAddStaff = () => {
    toast({
      title: "Add Staff",
      description: "Staff addition feature will be available soon.",
    });
  };

  const handleAssignStaff = () => {
    toast({
      title: "Assign Staff",
      description: "Staff assignment feature will be available soon.",
    });
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Staff List</CardTitle>
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={handleAssignStaff}>
            <UserPlus className="h-4 w-4 mr-1" /> 
            Assign Staff
          </Button>
          <Button size="sm" onClick={handleAddStaff}>
            <Plus className="h-4 w-4 mr-1" /> 
            Add Staff
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by name, email or phone"
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {roleFilter || "All Roles"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setRoleFilter(null)}>
                  All Roles
                </DropdownMenuItem>
                {roles.map((role) => (
                  <DropdownMenuItem 
                    key={role} 
                    onClick={() => setRoleFilter(role)}
                  >
                    {role}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {statusFilter ? statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1) : "All Status"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("checked-in")}>
                  Checked In
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("late")}>
                  Late
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("absent")}>
                  Absent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("not-scheduled")}>
                  Not Scheduled
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Staff table */}
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left rounded-lg overflow-hidden">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3">
                  <Checkbox />
                </th>
                <th className="px-4 py-3">Staff Member</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="bg-white border-b">
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-4" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <Skeleton className="h-10 w-10 rounded-full mr-3" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </td>
                  </tr>
                ))
              ) : filteredStaff && filteredStaff.length > 0 ? (
                filteredStaff.map((staff) => (
                  <tr key={staff.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Checkbox />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          {staff.profileImage ? (
                            <AvatarImage src={staff.profileImage} alt={staff.name} />
                          ) : null}
                          <AvatarFallback>{getInitials(staff.name)}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{staff.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {staff.role}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-xs text-gray-500">{staff.email}</div>
                        {staff.phone && <div className="text-xs">{staff.phone}</div>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={staff.status || "not-scheduled"} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => handleManualCheckIn(staff.id)}
                          title="Manual Check-in"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="bg-white border-b">
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No staff members found. {searchQuery || roleFilter || statusFilter ? "Try adjusting your filters." : ""}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    "checked-in": { label: "Checked In", className: "bg-green-100 text-green-800" },
    "late": { label: "Late", className: "bg-amber-100 text-amber-800" },
    "absent": { label: "Absent", className: "bg-red-100 text-red-800" },
    "not-scheduled": { label: "Not Scheduled", className: "bg-gray-100 text-gray-800" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig["not-scheduled"];

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
