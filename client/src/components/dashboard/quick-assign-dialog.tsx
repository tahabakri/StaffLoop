import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { UserPlus } from "lucide-react";

interface QuickAssignDialogProps {
  eventId: string;
  onAssignComplete?: () => void;
}

export function QuickAssignDialog({ eventId, onAssignComplete }: QuickAssignDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const { toast } = useToast();

  // Fetch available staff
  const { data: staff, isLoading: isLoadingStaff } = useQuery({
    queryKey: ["/api/staff/available"],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return [
        { id: 1, name: "John Doe", role: "Event Manager" },
        { id: 2, name: "Jane Smith", role: "Staff" },
        { id: 3, name: "Mike Johnson", role: "Staff" },
      ];
    },
  });

  // Fetch available roles
  const { data: roles, isLoading: isLoadingRoles } = useQuery({
    queryKey: ["/api/roles"],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return [
        { id: 1, name: "Event Manager" },
        { id: 2, name: "Staff" },
        { id: 3, name: "Security" },
      ];
    },
  });

  const handleAssign = async () => {
    if (!selectedStaff || !selectedRole) {
      toast({
        title: "Missing Information",
        description: "Please select both staff and role",
        variant: "destructive",
      });
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Staff assigned successfully",
      });
      
      setOpen(false);
      onAssignComplete?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign staff",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
          <UserPlus className="w-4 h-4 mr-2" />
          Quick Assign
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quick Assign Staff</DialogTitle>
          <DialogDescription>
            Assign staff to this event quickly
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Select Staff</Label>
            <Select
              value={selectedStaff}
              onValueChange={setSelectedStaff}
              disabled={isLoadingStaff}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingStaff ? (
                  <SelectItem value="loading" disabled>
                    <div className="flex items-center">
                      <Spinner className="w-4 h-4 mr-2" />
                      Loading staff...
                    </div>
                  </SelectItem>
                ) : staff && staff.length > 0 ? (
                  staff.map((member) => (
                    <SelectItem key={member.id} value={member.id.toString()}>
                      {member.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No staff available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Select Role</Label>
            <Select
              value={selectedRole}
              onValueChange={setSelectedRole}
              disabled={isLoadingRoles}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingRoles ? (
                  <SelectItem value="loading" disabled>
                    <div className="flex items-center">
                      <Spinner className="w-4 h-4 mr-2" />
                      Loading roles...
                    </div>
                  </SelectItem>
                ) : roles && roles.length > 0 ? (
                  roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No roles available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleAssign}
            className="w-full"
            disabled={!selectedStaff || !selectedRole}
          >
            Assign Staff
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 