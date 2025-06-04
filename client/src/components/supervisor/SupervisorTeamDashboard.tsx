import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle, XCircle, Clock, AlertTriangle, Send, MapPin, Shield, CheckCheck, MessageCircle } from "lucide-react";
import { format } from "date-fns";

interface SupervisorContext {
  eventId: number;
  teamId: number;
  supervisorId: number;
  eventName: string;
  supervisorName: string;
}

interface StaffAssignment {
  id: number;
  staffId: number;
  eventId: number;
  teamId: number;
  role: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  isLate: boolean;
  isAbsent: boolean;
  manualOverride: boolean;
  overrideReason: string | null;
  checkInLocation: { latitude: number; longitude: number } | null;
}

interface StaffMember {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
}

interface TeamStaffAttendance {
  assignment: StaffAssignment;
  staff: StaffMember;
}

export function SupervisorTeamDashboard({ context }: { context: SupervisorContext }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState("Your Team");
  const [staffAttendance, setStaffAttendance] = useState<TeamStaffAttendance[]>([]);
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  const [overrideReason, setOverrideReason] = useState("");
  const [overridingStaff, setOverridingStaff] = useState<TeamStaffAttendance | null>(null);
  const [isSubmittingOverride, setIsSubmittingOverride] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  useEffect(() => {
    const fetchTeamData = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call to fetch the team's staff and attendance data
        // const response = await fetch(`/api/events/${context.eventId}/teams/${context.teamId}/staff-attendance`);
        // if (!response.ok) throw new Error("Failed to fetch team data");
        // const data = await response.json();
        
        // Mock data for development
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        
        // Mock team name
        setTeamName("Event Security Team");
        
        // Mock staff attendance data
        const mockStaffAttendance: TeamStaffAttendance[] = [
          {
            assignment: {
              id: 1,
              staffId: 101,
              eventId: context.eventId,
              teamId: context.teamId,
              role: "Security Lead",
              checkInTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
              checkOutTime: null,
              isLate: false,
              isAbsent: false,
              manualOverride: false,
              overrideReason: null,
              checkInLocation: { latitude: 25.197197, longitude: 55.274376 }
            },
            staff: {
              id: 101,
              name: "Ahmed Al-Farsi",
              email: "ahmed@example.com",
              phone: "+971501234002",
              role: "Security"
            }
          },
          {
            assignment: {
              id: 2,
              staffId: 102,
              eventId: context.eventId,
              teamId: context.teamId,
              role: "Security Officer",
              checkInTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
              checkOutTime: null,
              isLate: true,
              isAbsent: false,
              manualOverride: false,
              overrideReason: null,
              checkInLocation: { latitude: 25.197225, longitude: 55.274399 }
            },
            staff: {
              id: 102,
              name: "Sarah Johnson",
              email: "sarah@example.com",
              phone: "+971501234001",
              role: "Security"
            }
          },
          {
            assignment: {
              id: 3,
              staffId: 103,
              eventId: context.eventId,
              teamId: context.teamId,
              role: "Security Officer",
              checkInTime: null,
              checkOutTime: null,
              isLate: false,
              isAbsent: false,
              manualOverride: false,
              overrideReason: null,
              checkInLocation: null
            },
            staff: {
              id: 103,
              name: "Michael Wong",
              email: "michael@example.com",
              phone: "+971501234004",
              role: "Security"
            }
          }
        ];
        
        setStaffAttendance(mockStaffAttendance);
      } catch (error) {
        console.error("Error fetching team data:", error);
        toast({
          title: "Error",
          description: "Failed to load team data. Please refresh the page.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeamData();
  }, [context, toast]);

  const handleManualOverride = (staffData: TeamStaffAttendance) => {
    setOverridingStaff(staffData);
    setOverrideReason("");
    setShowOverrideDialog(true);
  };

  const submitManualOverride = async () => {
    if (!overridingStaff) return;
    
    setIsSubmittingOverride(true);
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`/api/events/${context.eventId}/teams/${context.teamId}/staff/${overridingStaff.staff.id}/manual-checkin`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ reason: overrideReason })
      // });
      
      // if (!response.ok) throw new Error("Failed to submit manual check-in");
      
      // Mock successful response
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Update local state to reflect the change
      setStaffAttendance(prev => 
        prev.map(item => 
          item.assignment.id === overridingStaff.assignment.id
            ? {
                ...item,
                assignment: {
                  ...item.assignment,
                  checkInTime: new Date().toISOString(),
                  manualOverride: true,
                  overrideReason: overrideReason
                }
              }
            : item
        )
      );
      
      toast({
        title: "Success",
        description: `Manual check-in approved for ${overridingStaff.staff.name}`,
      });
      
      setShowOverrideDialog(false);
    } catch (error) {
      console.error("Error submitting manual override:", error);
      toast({
        title: "Error",
        description: "Failed to submit manual check-in. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingOverride(false);
    }
  };

  const openMessageDialog = () => {
    setMessageText("");
    setShowMessageDialog(true);
  };

  const sendTeamMessage = async () => {
    if (!messageText.trim()) return;
    
    setIsSendingMessage(true);
    try {
      // In a real app, this would be an API call to send a message to all team members
      // const response = await fetch(`/api/events/${context.eventId}/teams/${context.teamId}/message`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ message: messageText })
      // });
      
      // if (!response.ok) throw new Error("Failed to send message");
      
      // Mock successful response
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      toast({
        title: "Message Sent",
        description: "Your message has been sent to all team members",
      });
      
      setShowMessageDialog(false);
    } catch (error) {
      console.error("Error sending team message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  const openWhatsApp = (phone: string | null) => {
    if (!phone) {
      toast({
        title: "Contact Info Missing",
        description: "No phone number available for this staff member",
        variant: "destructive"
      });
      return;
    }
    
    window.open(`https://wa.me/${phone.replace(/\+/g, '')}`, '_blank');
  };

  const getStatusBadge = (staffData: TeamStaffAttendance) => {
    const { assignment } = staffData;
    
    if (assignment.checkInTime) {
      return (
        <div className="flex items-center text-green-600">
          <CheckCircle className="h-4 w-4 mr-1" />
          <span>{assignment.isLate ? "Checked In (Late)" : "Checked In"}</span>
        </div>
      );
    }
    
    if (assignment.isAbsent) {
      return (
        <div className="flex items-center text-red-600">
          <XCircle className="h-4 w-4 mr-1" />
          <span>Absent</span>
        </div>
      );
    }
    
    // Not checked in yet
    return (
      <div className="flex items-center text-amber-600">
        <Clock className="h-4 w-4 mr-1" />
        <span>Not Checked In</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Spinner className="h-12 w-12 mb-4" />
        <p className="text-gray-600">Loading team data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Supervisor Dashboard</CardTitle>
          <CardDescription>
            Event: {context.eventName} | Team: {teamName} | Supervisor: {context.supervisorName}
          </CardDescription>
        </CardHeader>
      </Card>
      
      {/* Action Buttons */}
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          className="mr-2"
          onClick={openMessageDialog}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Message Team
        </Button>
      </div>
      
      {/* Team Member List & Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Team Attendance</CardTitle>
          <CardDescription>
            Monitor your team's attendance and check-in status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Check-in Time</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffAttendance.map((staffData) => (
                <TableRow key={staffData.assignment.id}>
                  <TableCell className="font-medium">{staffData.staff.name}</TableCell>
                  <TableCell>{staffData.assignment.role}</TableCell>
                  <TableCell>{getStatusBadge(staffData)}</TableCell>
                  <TableCell>
                    {staffData.assignment.checkInTime 
                      ? format(new Date(staffData.assignment.checkInTime), "h:mm a") 
                      : "-"
                    }
                    {staffData.assignment.manualOverride && (
                      <div className="flex items-center text-amber-600 text-xs mt-1">
                        <Shield className="h-3 w-3 mr-1" />
                        <span>Manual Override</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openWhatsApp(staffData.staff.phone)}
                        title="Contact via WhatsApp"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      
                      {!staffData.assignment.checkInTime && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleManualOverride(staffData)}
                          title="Manual Check-in"
                        >
                          <CheckCheck className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              
              {staffAttendance.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                    No team members assigned yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Manual Override Dialog */}
      <Dialog open={showOverrideDialog} onOpenChange={setShowOverrideDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manual Check-in Override</DialogTitle>
            <DialogDescription>
              {overridingStaff && (
                <>Approve manual check-in for {overridingStaff.staff.name}</>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="override-reason" className="text-sm font-medium">
                Reason for Manual Override
              </label>
              <Textarea
                id="override-reason"
                placeholder="Enter reason for manual override..."
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-sm">Manual overrides are logged and attributed to you as the supervisor.</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOverrideDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={submitManualOverride} 
              disabled={isSubmittingOverride || !overrideReason.trim()}
            >
              {isSubmittingOverride && <Spinner className="mr-2 h-4 w-4" />}
              Approve Check-in
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Team Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message to Team</DialogTitle>
            <DialogDescription>
              Send a message to all members of your team via WhatsApp
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="team-message" className="text-sm font-medium">
                Message
              </label>
              <Textarea
                id="team-message"
                placeholder="Type your message here..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMessageDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={sendTeamMessage} 
              disabled={isSendingMessage || !messageText.trim()}
            >
              {isSendingMessage && <Spinner className="mr-2 h-4 w-4" />}
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 