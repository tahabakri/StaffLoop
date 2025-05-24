import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Edit, 
  Trash2, 
  MessageSquare, 
  UserPlus,
  Check
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock staff data
const staffMembers = [
  { id: 1, name: "John Doe", role: "Security", contact: "john@example.com", status: "Active" },
  { id: 2, name: "Sarah Johnson", role: "Catering", contact: "sarah@example.com", status: "Active" },
  { id: 3, name: "Mike Williams", role: "Management", contact: "mike@example.com", status: "Inactive" },
];

export default function StaffManagementPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddStaffDialog, setShowAddStaffDialog] = useState(false);
  
  // New staff form state
  const [newStaff, setNewStaff] = useState({
    name: "",
    role: "",
    contact: "",
  });
  
  // Filter staff based on search query and filters
  const filteredStaff = staffMembers.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         staff.contact.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || staff.role === roleFilter;
    const matchesStatus = statusFilter === "all" || staff.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewStaff(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle role selection
  const handleRoleChange = (value: string) => {
    setNewStaff(prev => ({ ...prev, role: value }));
  };
  
  // Handle add staff form submission
  const handleAddStaff = () => {
    // In a real app, this would send data to an API
    toast({
      title: "Staff Added",
      description: `${newStaff.name} has been added as ${newStaff.role}.`,
    });
    
    // Reset form and close dialog
    setNewStaff({ name: "", role: "", contact: "" });
    setShowAddStaffDialog(false);
  };
  
  // Handle staff actions
  const handleEditStaff = (id: number, name: string) => {
    toast({
      title: "Edit Staff",
      description: `Edit dialog for ${name} would open here.`,
    });
  };
  
  const handleRemoveStaff = (id: number, name: string) => {
    toast({
      title: "Staff Removed",
      description: `${name} has been removed from staff.`,
    });
  };
  
  const handleSendMessage = (id: number, name: string) => {
    toast({
      title: "Message Sent",
      description: `Message sent to ${name}.`,
    });
  };

  return (
    <div className="flex flex-col w-full space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Staff Management</h1>
        
        <Dialog open={showAddStaffDialog} onOpenChange={setShowAddStaffDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              <UserPlus className="h-4 w-4 mr-2" />
              Add New Staff
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Staff</DialogTitle>
              <DialogDescription>
                Enter the details of the new staff member.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={newStaff.name} 
                  onChange={handleInputChange} 
                  placeholder="John Doe" 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select value={newStaff.role} onValueChange={handleRoleChange}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Security">Security</SelectItem>
                    <SelectItem value="Catering">Catering</SelectItem>
                    <SelectItem value="Management">Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="contact">Contact Info</Label>
                <Input 
                  id="contact" 
                  name="contact" 
                  value={newStaff.contact} 
                  onChange={handleInputChange} 
                  placeholder="email@example.com" 
                />
              </div>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                className="bg-blue-500 hover:bg-blue-600 text-white" 
                onClick={handleAddStaff}
                disabled={!newStaff.name || !newStaff.role || !newStaff.contact}
              >
                <Check className="h-4 w-4 mr-2" />
                Save Staff
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Filters and Search */}
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:w-auto md:flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search by name or email..." 
                className="pl-10" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="Security">Security</SelectItem>
                  <SelectItem value="Catering">Catering</SelectItem>
                  <SelectItem value="Management">Management</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Staff Table */}
      <Card className="bg-white">
        <Table>
          <TableCaption>Staff members list</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStaff.length > 0 ? (
              filteredStaff.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell className="font-medium">{staff.name}</TableCell>
                  <TableCell>{staff.role}</TableCell>
                  <TableCell>{staff.contact}</TableCell>
                  <TableCell>
                    <Badge 
                      className={staff.status === "Active" ? "bg-green-500" : "bg-gray-500"}
                    >
                      {staff.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditStaff(staff.id, staff.name)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-amber-500 border-amber-500 hover:bg-amber-50"
                        onClick={() => handleSendMessage(staff.id, staff.name)}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-500 border-red-500 hover:bg-red-50"
                        onClick={() => handleRemoveStaff(staff.id, staff.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No staff found matching the search criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
} 