import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Pencil, 
  Trash2, 
  MoreVertical, 
  Send,
  Mail
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getInitials } from "@/lib/utils";

// Define the role types for team members
export type TeamMemberRole = "owner" | "admin" | "event_manager" | "staffing_coordinator" | "viewer";

// Define the team member interface
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamMemberRole;
  profileImage?: string;
  status: "active" | "invitation_sent";
  isCurrentUser?: boolean;
}

interface TeamMembersTableProps {
  teamMembers: TeamMember[];
  onEditRole: (memberId: string, newRole: TeamMemberRole) => void;
  onRemoveMember: (memberId: string) => void;
  onResendInvitation: (memberId: string) => void;
  currentUserId: string;
  isOwner: boolean;
}

// Role colors for badges
const roleBadgeVariants: Record<TeamMemberRole, string> = {
  owner: "bg-purple-100 text-purple-800 border-purple-200",
  admin: "bg-blue-100 text-blue-800 border-blue-200",
  event_manager: "bg-green-100 text-green-800 border-green-200", 
  staffing_coordinator: "bg-yellow-100 text-yellow-800 border-yellow-200",
  viewer: "bg-gray-100 text-gray-800 border-gray-200"
};

// Role display names
const roleDisplayNames: Record<TeamMemberRole, string> = {
  owner: "Owner",
  admin: "Admin",
  event_manager: "Event Manager",
  staffing_coordinator: "Staffing Coordinator",
  viewer: "Viewer"
};

export function TeamMembersTable({ 
  teamMembers, 
  onEditRole, 
  onRemoveMember, 
  onResendInvitation,
  currentUserId,
  isOwner
}: TeamMembersTableProps) {
  const { toast } = useToast();
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  
  const handleRemoveClick = (member: TeamMember) => {
    setMemberToRemove(member);
    setShowRemoveDialog(true);
  };

  const handleConfirmRemove = () => {
    if (memberToRemove) {
      console.log(`Removing team member: ${memberToRemove.id}`);
      onRemoveMember(memberToRemove.id);
      toast({
        title: "Team member removed",
        description: `${memberToRemove.name} has been removed from your team.`,
      });
    }
    setShowRemoveDialog(false);
    setMemberToRemove(null);
  };

  const handleCancelRemove = () => {
    setShowRemoveDialog(false);
    setMemberToRemove(null);
  };

  const handleEditRole = (memberId: string, newRole: TeamMemberRole) => {
    console.log(`Changing role for member ${memberId} to ${newRole}`);
    onEditRole(memberId, newRole);
    toast({
      title: "Role updated",
      description: "Team member's role has been updated successfully.",
    });
  };

  const handleResendInvitation = (memberId: string) => {
    console.log(`Resending invitation to member: ${memberId}`);
    onResendInvitation(memberId);
    toast({
      title: "Invitation resent",
      description: "The invitation has been resent successfully.",
    });
  };

  return (
    <div className="space-y-4">
      {teamMembers.length === 0 ? (
        <div className="text-center py-10 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">No team members yet. Invite your first team member to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="text-sm text-muted-foreground bg-muted/20">
              <tr>
                <th className="text-left py-3 px-4 font-medium">User</th>
                <th className="text-left py-3 px-4 font-medium">Role</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-right py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {teamMembers.map((member) => (
                <tr key={member.id} className="hover:bg-muted/10">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        {member.profileImage ? (
                          <AvatarImage src={member.profileImage} alt={member.name} />
                        ) : null}
                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium flex items-center gap-1">
                          {member.name}
                          {member.isCurrentUser && (
                            <span className="text-xs text-muted-foreground">(You)</span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant="outline" className={roleBadgeVariants[member.role]}>
                      {roleDisplayNames[member.role]}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    {member.status === "active" ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-100">
                        Invitation Sent
                      </Badge>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right">
                    {/* Don't show action buttons for the current user or if the current user is not an owner/admin */}
                    {!member.isCurrentUser && (isOwner || member.role !== "owner") && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {member.role !== "owner" && (
                            <>
                              <DropdownMenuItem onClick={() => handleEditRole(member.id, "admin")}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Role
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRemoveClick(member)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove
                              </DropdownMenuItem>
                            </>
                          )}
                          {member.status === "invitation_sent" && (
                            <DropdownMenuItem onClick={() => handleResendInvitation(member.id)}>
                              <Mail className="mr-2 h-4 w-4" />
                              Resend Invitation
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Remove member confirmation dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove team member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {memberToRemove?.name} from your team? 
              They will no longer have access to your organization's events and data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelRemove}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 