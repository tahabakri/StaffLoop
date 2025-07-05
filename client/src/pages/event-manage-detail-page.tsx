import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Event } from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  Edit, 
  UserPlus, 
  ClipboardList,
  Users,
  CalendarPlus,
  Send,
  MessageSquare,
  Clock,
  MapPin,
  FileText
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDate } from "@/lib/utils";
import { downloadEventICS, EventCalendarData } from "@/utils/calendar";
import { useToast } from "@/hooks/use-toast";
import BroadcastMessageModal from "@/components/BroadcastMessageModal";

// Extended Staff interface for event management
interface EventStaff {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  profileImage?: string;
  assignedShift?: string;
  checkInStatus: 'checked-in' | 'late' | 'absent' | 'not-started';
  checkInTime?: string;
}

// Mock staff data for the event
const mockEventStaff: EventStaff[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Security Lead",
    email: "sarah@example.com",
    phone: "+971501234001",
    assignedShift: "Morning (8AM-4PM)",
    checkInStatus: 'checked-in',
    checkInTime: "2024-01-15T08:00:00Z"
  },
  {
    id: 2,
    name: "Ahmed Al-Farsi",
    role: "Security Officer",
    email: "ahmed@example.com", 
    phone: "+971501234002",
    assignedShift: "Morning (8AM-4PM)",
    checkInStatus: 'late',
    checkInTime: "2024-01-15T08:20:00Z"
  },
  {
    id: 3,
    name: "Priya Sharma",
    role: "Event Coordinator",
    email: "priya@example.com",
    phone: "+971501234003",
    assignedShift: "Full Day (8AM-8PM)",
    checkInStatus: 'checked-in',
    checkInTime: "2024-01-15T07:55:00Z"
  },
  {
    id: 4,
    name: "Michael Wong",
    role: "Technical Support",
    email: "michael@example.com",
    phone: "+971501234004",
    assignedShift: "Evening (4PM-12AM)",
    checkInStatus: 'not-started'
  },
  {
    id: 5,
    name: "Layla Mubarak", 
    role: "Customer Service",
    email: "layla@example.com",
    phone: "+971501234005",
    assignedShift: "Full Day (8AM-8PM)",
    checkInStatus: 'absent'
  }
];

export default function EventManageDetailPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  
  // Fetch the event details
  const { data: event, isLoading } = useQuery<Event>({
    queryKey: [`/api/events/${eventId}`],
    enabled: !!eventId,
  });

  // Handle edit event button click
  const handleEditEvent = () => {
    navigate(`/events/${eventId}/edit`);
  };

  // Handle assign existing staff button click
  const handleAssignStaff = () => {
    console.log('Assign Existing Staff clicked for event:', eventId);
    toast({
      title: "Feature Coming Soon",
      description: "Staff assignment modal will be implemented in the next update.",
    });
  };

  // Handle add new staff button click
  const handleAddNewStaff = () => {
    console.log('Add New Staff & Assign clicked for event:', eventId);
    toast({
      title: "Feature Coming Soon", 
      description: "Add new staff functionality will be implemented in the next update.",
    });
  };

  // Handle send update to staff button click
  const handleSendUpdate = () => {
    setIsBroadcastModalOpen(true);
  };

  // Handle add to calendar button click
  const handleAddToCalendar = async () => {
    if (!event || !eventId) return;

    try {
      // Parse the event date and create start/end times
      // For now, we'll use default times since the mock data doesn't include times
      const eventDate = new Date(event.date);
      const startDateTime = new Date(eventDate);
      startDateTime.setHours(9, 0, 0, 0); // Default start time: 9:00 AM
      
      const endDateTime = new Date(eventDate);
      endDateTime.setHours(17, 0, 0, 0); // Default end time: 5:00 PM

      const calendarEvent: EventCalendarData = {
        id: eventId,
        name: event.name,
        description: `StaffLoop Event - ${event.name}`,
        location: event.location,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
      };

      await downloadEventICS(calendarEvent);
      
      toast({
        title: "Calendar File Downloaded",
        description: "The event has been added to your calendar file. Open it with your preferred calendar application.",
      });
    } catch (error) {
      console.error('Error adding to calendar:', error);
      toast({
        title: "Error",
        description: "Failed to generate calendar file. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get badge variant and styles for event status
  const getStatusBadgeVariant = (status?: string): "default" | "secondary" | "destructive" | "outline" => {
    if (!status) return "outline";
    
    switch (status.toLowerCase()) {
      case 'draft':
        return "outline";
      case 'upcoming':
        return "secondary"; 
      case 'ongoing':
        return "default"; 
      case 'ended':
        return "destructive"; 
      default:
        return "outline";
    }
  };

  const getStatusBadgeStyles = (status?: string): string => {
    if (!status) return "";
    
    switch (status.toLowerCase()) {
      case 'draft':
        return "bg-gray-500 hover:bg-gray-600 text-white";
      case 'upcoming':
        return "bg-blue-500 hover:bg-blue-600 text-white"; 
      case 'ongoing':
        return "bg-green-500 hover:bg-green-600 text-white"; 
      case 'ended':
        return "bg-red-500 hover:bg-red-600 text-white"; 
      default:
        return "";
    }
  };

  // Get status display name
  const getStatusDisplayName = (status?: string): string => {
    if (!status) return 'Unknown';
    
    switch (status.toLowerCase()) {
      case 'ongoing': return 'Active';
      case 'ended': return 'Completed';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Get staff count display based on event status
  const getStaffCountDisplay = (event: Event): string => {
    switch (event.status) {
      case 'draft':
        return `Staff Required: ${event.totalStaff || 'TBD'}`;
      case 'upcoming':
        return `Assigned: ${event.checkedInStaff} / ${event.totalStaff} Required`;
      case 'ongoing':
        return `Live: ${event.checkedInStaff} Checked In / ${event.totalStaff} Assigned`;
      case 'ended':
        return `Attended: ${event.checkedInStaff} / ${event.totalStaff} Assigned`;
      default:
        return `${event.checkedInStaff} / ${event.totalStaff}`;
    }
  };

  // Get check-in status badge
  const getCheckInStatusBadge = (status: EventStaff['checkInStatus']) => {
    switch (status) {
      case 'checked-in':
        return <Badge className="bg-green-500 text-white">Checked In</Badge>;
      case 'late':
        return <Badge className="bg-yellow-500 text-white">Late</Badge>;
      case 'absent':
        return <Badge className="bg-red-500 text-white">Absent</Badge>;
      case 'not-started':
        return <Badge variant="outline">Not Started</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Get initials for avatar
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Filter staff based on event status for display
  const getDisplayStaff = (): EventStaff[] => {
    if (!event || event.totalStaff === 0) return [];
    return mockEventStaff.slice(0, event.totalStaff);
  };

  const displayStaff = getDisplayStaff();

  return (
    <div className="flex flex-col w-full space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/events')}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Button>
        <h1 className="text-2xl font-bold">Manage Event: {event?.name || `#${eventId}`}</h1>
      </div>

      {isLoading ? (
        <Card className="p-6">
          <p>Loading event details...</p>
        </Card>
      ) : event ? (
        <div className="grid grid-cols-1 gap-6">
          {/* Event Details Section */}
          <Card className="p-6">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold mb-4">Event Details</h2>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleSendUpdate}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Send Update to Staff
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleAddToCalendar}
                  className="flex items-center gap-2"
                >
                  <CalendarPlus className="h-4 w-4" />
                  Add to Calendar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleEditEvent}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Details
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <strong>Event ID:</strong> 
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{eventId}</span>
                </div>
                <p><strong>Name:</strong> {event.name}</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <strong>Date:</strong> {formatDate(event.date)}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <strong>Location:</strong> 
                  <span className="text-blue-600 hover:underline cursor-pointer" title="Click to view on map">
                    {event.location}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <strong>Status:</strong>
                                     <Badge 
                     variant={getStatusBadgeVariant(event.status)}
                     className={getStatusBadgeStyles(event.status)}
                   >
                     {getStatusDisplayName(event.status)}
                   </Badge>
                </div>
                <p><strong>{getStaffCountDisplay(event)}</strong></p>
                {event.status === 'ongoing' && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-green-800 font-medium text-sm">🔴 Event is currently LIVE</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
            
          {/* Staff Management Section */}
          <Card className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold mb-2">Staff Management</h2>
                <p className="text-gray-600 text-sm mb-4">
                  {displayStaff.length > 0 ? `${displayStaff.length} staff member${displayStaff.length !== 1 ? 's' : ''} assigned to this event` : 'No staff assigned yet'}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={handleAssignStaff}
                  className="flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  + Assign Existing Staff
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleAddNewStaff}
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  + Add New Staff & Assign
                </Button>
              </div>
            </div>
            
            <div className="mt-4">
              {displayStaff.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Member</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role & Shift</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {displayStaff.map((staff) => (
                        <tr key={staff.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Avatar className="h-10 w-10 mr-3">
                                {staff.profileImage ? (
                                  <AvatarImage src={staff.profileImage} alt={staff.name} />
                                ) : null}
                                <AvatarFallback className="bg-blue-500 text-white">
                                  {getInitials(staff.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                                <div className="text-sm text-gray-500">ID: {staff.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{staff.role}</div>
                            {staff.assignedShift && (
                              <div className="text-sm text-gray-500">{staff.assignedShift}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{staff.phone}</div>
                            <div className="text-sm text-gray-500">{staff.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              {getCheckInStatusBadge(staff.checkInStatus)}
                              {staff.checkInTime && (
                                <div className="text-xs text-gray-500">
                                  {new Date(staff.checkInTime).toLocaleTimeString()}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1"
                                onClick={() => window.open(`https://wa.me/${staff.phone.replace('+', '')}`, '_blank')}
                              >
                                <MessageSquare className="h-3 w-3" />
                                WhatsApp
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => toast({ title: "Edit staff feature coming soon" })}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Staff Assigned</h3>
                  <p className="text-gray-500 mb-4">Get started by assigning staff to this event.</p>
                  <div className="flex justify-center gap-2">
                    <Button onClick={handleAssignStaff} className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Assign Existing Staff
                    </Button>
                    <Button variant="outline" onClick={handleAddNewStaff} className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Add New Staff
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
            
          {/* Attendance Tracking Section */}
          <Card className="p-6">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold mb-4">Attendance Tracking</h2>
              {event.status === 'ended' && (
                <Button variant="outline" className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Generate Final Report
                </Button>
              )}
            </div>
            
            <div className="mt-4">
              {event.status === 'draft' && (
                <div className="p-6 bg-gray-50 rounded-lg text-center">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Attendance Tracking Not Available</h3>
                  <p className="text-gray-600">
                    Attendance tracking will begin when the event is active.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Scheduled Start: {formatDate(event.date)}
                  </p>
                </div>
              )}
              
              {event.status === 'upcoming' && (
                <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="text-lg font-medium text-blue-900">Event Upcoming</h3>
                      <p className="text-blue-700">
                        Attendance tracking will begin when the event starts.
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-blue-600 font-medium">
                    Scheduled Start: {formatDate(event.date)}
                  </p>
                </div>
              )}
              
              {event.status === 'ongoing' && (
                <div className="space-y-6">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="text-lg font-medium text-green-900 mb-2">🔴 LIVE Event Tracking</h3>
                    <p className="text-green-700">Real-time attendance data is being collected.</p>
                  </div>
                  
                  {/* Key Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4 bg-white border-green-200">
                      <CardContent className="p-0">
                        <div className="text-center">
                          <p className="text-sm text-gray-500 mb-1">Checked In</p>
                          <p className="text-3xl font-bold text-green-600">
                            {event.checkedInStaff} / {event.totalStaff}
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${(event.checkedInStaff / event.totalStaff) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="p-4 bg-white border-yellow-200">
                      <CardContent className="p-0">
                        <div className="text-center">
                          <p className="text-sm text-gray-500 mb-1">Late Arrivals</p>
                          <p className="text-3xl font-bold text-yellow-600">
                            {displayStaff.filter(s => s.checkInStatus === 'late').length}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">Staff members</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="p-4 bg-white border-red-200">
                      <CardContent className="p-0">
                        <div className="text-center">
                          <p className="text-sm text-gray-500 mb-1">Not Checked In</p>
                          <p className="text-3xl font-bold text-red-600">
                            {event.totalStaff - event.checkedInStaff}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">Staff members</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Live Check-in Feed */}
                  <Card className="p-4">
                    <CardHeader className="p-0 mb-4">
                      <CardTitle className="text-lg">Recent Check-ins</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {displayStaff
                          .filter(staff => staff.checkInTime)
                          .sort((a, b) => new Date(b.checkInTime!).getTime() - new Date(a.checkInTime!).getTime())
                          .slice(0, 5)
                          .map((staff) => (
                            <div key={staff.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-blue-500 text-white text-xs">
                                    {getInitials(staff.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-sm">{staff.name}</p>
                                  <p className="text-xs text-gray-500">{staff.role}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">
                                  {new Date(staff.checkInTime!).toLocaleTimeString()}
                                </p>
                                <div className="flex items-center gap-2">
                                  {getCheckInStatusBadge(staff.checkInStatus)}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {event.status === 'ended' && (
                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Event Completed</h3>
                    <p className="text-gray-700">View final attendance summary and generate reports.</p>
                  </div>
                  
                  {/* Summary Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-6 bg-white">
                      <CardContent className="p-0 text-center">
                        <h4 className="text-sm text-gray-500 mb-2">Final Attendance</h4>
                        <p className="text-4xl font-bold text-gray-900 mb-2">
                          {event.checkedInStaff} / {event.totalStaff}
                        </p>
                        <p className="text-lg text-gray-600">
                          ({Math.round((event.checkedInStaff / event.totalStaff) * 100) || 0}% attendance rate)
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="p-6 bg-white">
                      <CardContent className="p-0 text-center">
                        <h4 className="text-sm text-gray-500 mb-2">Total Hours Logged</h4>
                        <p className="text-4xl font-bold text-gray-900 mb-2">
                          {event.checkedInStaff * 8}
                        </p>
                        <p className="text-lg text-gray-600">staff hours</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button className="flex items-center gap-2" onClick={() => toast({ title: "Report generation feature coming soon" })}>
                      <FileText className="h-4 w-4" />
                      Generate Final Attendance Report
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      ) : (
        <Card className="p-6">
          <p className="text-red-500">Event not found or an error occurred.</p>
        </Card>
      )}

      {/* Broadcast Message Modal */}
      {event && eventId && (
        <BroadcastMessageModal
          eventId={eventId}
          eventName={event.name}
          isOpen={isBroadcastModalOpen}
          onOpenChange={setIsBroadcastModalOpen}
        />
      )}
    </div>
  );
} 