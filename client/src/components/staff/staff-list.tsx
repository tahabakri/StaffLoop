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
import { Check, Edit, Loader2, MoreVertical, Plus, Search, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddStaffModal } from "./add-staff-modal";
import { AssignStaffModal } from "./assign-staff-modal";

interface StaffMember {
  id: number;
  name: string;
  role: string;
  email: string;
  phone?: string;
  profileImage?: string;
  status?: "checked-in" | "late" | "absent" | "not-scheduled";
  checkInTime?: string;
}

interface StaffListProps {
  eventId?: number;
}

export function StaffList({ eventId }: StaffListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const { toast } = useToast();
  const [loadingCheckIn, setLoadingCheckIn] = useState<number | null>(null);

  // Local staff state for demo/mock
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([
    { id: 1, name: "John Doe", role: "Hostess", email: "john@example.com", phone: "+971501234567", status: "checked-in", checkInTime: "2023-11-12T07:45:00" },
    { id: 2, name: "Jane Smith", role: "Support", email: "jane@example.com", phone: "+971501234568", status: "not-scheduled" },
    { id: 3, name: "Bob Lee", role: "Security", email: "bob@example.com", phone: "+971501234569", status: "absent" },
  ]);
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [assignStaffOpen, setAssignStaffOpen] = useState(false);

  // Get unique roles for filtering
  const roles = staffMembers 
    ? Array.from(new Set(staffMembers.map(staff => staff.role)))
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

  const handleManualCheckIn = async (staffId: number) => {
    // Set loading state
    setLoadingCheckIn(staffId);
    
    try {
      // Mock API call with timeout to simulate network request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get current timestamp in ISO format
      const currentTime = new Date().toISOString();
      
      // Update staff member status
      setStaffMembers(prev => prev.map(staff => 
        staff.id === staffId 
          ? { ...staff, status: "checked-in", checkInTime: currentTime } 
          : staff
      ));
      
      // Show success notification
      toast({
        title: "Staff checked in successfully",
        description: `Check-in time: ${new Date().toLocaleTimeString()}`,
        variant: "default",
      });
    } catch (error) {
      // Show error notification
      toast({
        title: "Check-in failed",
        description: "There was an error processing the check-in.",
        variant: "destructive",
      });
    } finally {
      // Clear loading state
      setLoadingCheckIn(null);
    }
  };

  // Add Staff Modal logic
  const handleAddStaff = () => setAddStaffOpen(true);
  const handleStaffAdded = (staff: any) => {
    setStaffMembers(prev => [
      ...prev,
      {
        id: prev.length + 1,
        name: staff.name,
        role: staff.role || "",
        email: staff.email || "",
        phone: staff.whatsapp,
        status: "not-scheduled" as StaffMember['status'],
      },
    ]);
  };

  // Assign Staff Modal logic
  const handleAssignStaff = () => setAssignStaffOpen(true);
  const handleStaffAssigned = (assigned: any[]) => {
    setStaffMembers(prev =>
      prev.map(staff =>
        assigned.some(a => a.name === staff.name)
          ? { ...staff, status: "not-scheduled" as StaffMember['status'] }
          : staff
      ).concat(
        assigned
          .filter(a => !prev.some(s => s.name === a.name))
          .map(a => ({
            id: prev.length + 1,
            name: a.name,
            role: a.role,
            email: "",
            phone: a.whatsapp,
            status: "not-scheduled" as StaffMember['status'],
          }))
      )
    );
  };

  return (
    <Card className="shadow-card">
      <AddStaffModal open={addStaffOpen} onOpenChange={setAddStaffOpen} onStaffAdded={handleStaffAdded} />
      <AssignStaffModal open={assignStaffOpen} onOpenChange={setAssignStaffOpen} onStaffAssigned={handleStaffAssigned} />
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
                <DropdownMenuItem onClick={() => setStatusFilter("checked-in")}>Checked In</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("late")}>Late</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("absent")}>Absent</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("not-scheduled")}>Not Scheduled</DropdownMenuItem>
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
                <th className="px-4 py-3">Check-In Time</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">No staff found.</td>
                </tr>
              ) : (
                filteredStaff.map((staff) => (
                  <tr key={staff.id} className="bg-white border-b">
                    <td className="px-4 py-3">
                      <Checkbox />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        {staff.profileImage ? (
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarImage src={staff.profileImage} alt={staff.name} />
                            <AvatarFallback>{getInitials(staff.name)}</AvatarFallback>
                          </Avatar>
                        ) : (
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarFallback>{getInitials(staff.name)}</AvatarFallback>
                          </Avatar>
                        )}
                        <span>{staff.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{staff.role}</td>
                    <td className="px-4 py-3">{staff.phone || staff.email}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={staff.status || "not-scheduled"} />
                    </td>
                    <td className="px-4 py-3">
                      {staff.checkInTime ? new Date(staff.checkInTime).toLocaleString() : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className={staff.status === "checked-in" ? "bg-gray-100 text-gray-400" : "bg-green-500 text-white hover:bg-green-600"} 
                        onClick={() => handleManualCheckIn(staff.id)}
                        disabled={staff.status === "checked-in" || loadingCheckIn === staff.id}
                      >
                        {loadingCheckIn === staff.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            Processing...
                          </>
                        ) : staff.status === "checked-in" ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Checked In
                          </>
                        ) : (
                          <>
                            <Edit className="h-4 w-4 mr-1" />
                            Check In
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  let color = "bg-gray-200 text-gray-700";
  if (status === "checked-in") color = "bg-green-100 text-green-700";
  if (status === "late") color = "bg-yellow-100 text-yellow-700";
  if (status === "absent") color = "bg-red-100 text-red-700";
  return <span className={`px-2 py-1 rounded text-xs font-medium ${color}`}>{status.replace("-", " ")}</span>;
}
