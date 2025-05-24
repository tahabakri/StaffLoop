import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Event } from "@/types/dashboard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Edit, 
  UserPlus, 
  ClipboardList,
  Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDate } from "@/lib/utils";

export default function EventManageDetailPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  
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
    // Future implementation: Open modal to select and assign staff
  };

  // Handle add new staff button click
  const handleAddNewStaff = () => {
    console.log('Add New Staff & Assign clicked for event:', eventId);
    // Future implementation: Navigate to staff creation page with return to this event
  };

  // Get badge variant based on status
  const getBadgeVariant = (status?: string): "default" | "secondary" | "destructive" | "outline" => {
    if (!status) return "outline";
    
    switch (status.toLowerCase()) {
      case 'ongoing':
        return "default"; 
      case 'upcoming':
        return "secondary"; 
      case 'completed':
        return "outline"; 
      default:
        return "outline";
    }
  };

  // Get badge custom styles for consistent rendering
  const getBadgeStyles = (status?: string): string => {
    if (!status) return "";
    
    switch (status.toLowerCase()) {
      case 'ongoing':
        return "bg-green-500 hover:bg-green-600"; 
      case 'upcoming':
        return "bg-blue-500 hover:bg-blue-600"; 
      case 'completed':
        return "bg-gray-500 hover:bg-gray-600"; 
      default:
        return "";
    }
  };

  // Format status for display (capitalize first letter)
  const getStatusDisplayName = (status: string): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

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
              <Button 
                variant="outline" 
                onClick={handleEditEvent}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Details
              </Button>
            </div>
            <div className="space-y-3">
              <p><strong>Event ID:</strong> {eventId}</p>
              <p><strong>Name:</strong> {event.name}</p>
              <p><strong>Date:</strong> {formatDate(event.date)}</p>
              <p><strong>Location:</strong> {event.location}</p>
              <p>
                <strong>Status:</strong>{" "}
                <Badge 
                  variant={getBadgeVariant(event.status || "")}
                  className={getBadgeStyles(event.status || "")}
                >
                  {event.status ? getStatusDisplayName(event.status) : "Unknown"}
                </Badge>
              </p>
              <p><strong>Staff Count:</strong> {event.checkedInStaff} / {event.totalStaff} checked in</p>
            </div>
          </Card>
            
          {/* Staff Management Section */}
          <Card className="p-6">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold mb-4">Staff Management</h2>
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
              <h3 className="font-medium text-lg mb-2">Assigned Staff for this Event</h3>
              {event.totalStaff > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 text-center text-sm text-gray-500" colSpan={4}>
                          No data available yet
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No staff assigned to this event yet.</p>
              )}
            </div>
          </Card>
            
          {/* Attendance Tracking Section */}
          <Card className="p-6">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold mb-4">Attendance Tracking</h2>
              {event.status === 'completed' && (
                <Button variant="outline" className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Download Report
                </Button>
              )}
            </div>
            
            <div className="mt-4">
              <h3 className="font-medium text-lg mb-2">Attendance Overview</h3>
              {event.status === 'upcoming' && (
                <div className="p-4 bg-blue-50 rounded-md text-blue-700">
                  <p>Attendance tracking will be available once the event is active.</p>
                </div>
              )}
              
              {event.status === 'ongoing' && (
                <div className="p-4 bg-green-50 rounded-md text-green-700">
                  <p>Live attendance data will appear here.</p>
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="p-4 bg-white rounded-md border">
                      <p className="text-sm text-gray-500">Checked In</p>
                      <p className="text-2xl font-bold">{event.checkedInStaff} / {event.totalStaff}</p>
                    </div>
                    <div className="p-4 bg-white rounded-md border">
                      <p className="text-sm text-gray-500">Late</p>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                    <div className="p-4 bg-white rounded-md border">
                      <p className="text-sm text-gray-500">Absent</p>
                      <p className="text-2xl font-bold">{event.totalStaff - event.checkedInStaff}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {event.status === 'completed' && (
                <div className="p-4 bg-gray-50 rounded-md text-gray-700">
                  <p>View final attendance summary here.</p>
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="p-4 bg-white rounded-md border">
                      <p className="text-sm text-gray-500">Final Attendance</p>
                      <p className="text-2xl font-bold">{event.checkedInStaff} / {event.totalStaff}</p>
                      <p className="text-sm text-gray-500">
                        ({Math.round((event.checkedInStaff / event.totalStaff) * 100) || 0}%)
                      </p>
                    </div>
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
    </div>
  );
} 