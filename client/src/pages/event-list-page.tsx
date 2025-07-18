import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  PlusCircle, 
  Pencil, 
  Trash2, 
  Eye,
  CalendarRange,
  FileEdit
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Event } from "@/types/dashboard";
import { useToast } from "@/hooks/use-toast";
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
import { useBackendEventDraft } from "@/hooks/use-backend-event-draft";

// Mock data for testing status badges
const MOCK_EVENTS: Event[] = [
  { 
    id: 1, 
    name: "Tech Conference 2025", 
    date: "2025-05-15", 
    location: "Dubai World Trade Centre", 
    status: "upcoming",
    checkedInStaff: 0,
    totalStaff: 25
  },
  { 
    id: 2, 
    name: "Summer Festival", 
    date: "2025-06-08", 
    location: "Alserkal Avenue, Dubai", 
    status: "upcoming",
    checkedInStaff: 0,
    totalStaff: 40
  },
  { 
    id: 3, 
    name: "Music Festival 2025", 
    date: "2025-10-15", 
    location: "Dubai Media City Amphitheatre", 
    status: "ongoing",
    checkedInStaff: 28,
    totalStaff: 50
  },
  { 
    id: 4, 
    name: "New Year's Eve Celebration", 
    date: "2025-12-31", 
    location: "Palm Jumeirah", 
    status: "upcoming",
    checkedInStaff: 0,
    totalStaff: 100
  },
  { 
    id: 5, 
    name: "Winter Market", 
    date: "2024-12-20", 
    location: "Madinat Jumeirah", 
    status: "ended",
    checkedInStaff: 75,
    totalStaff: 80
  },
  { 
    id: 6, 
    name: "Corporate Event Draft", 
    date: "2025-08-10", 
    location: "Dubai Marina", 
    status: "draft",
    checkedInStaff: 0,
    totalStaff: 0
  },
];

export default function EventListPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const { deleteDraft } = useBackendEventDraft();
  
  // Fetch events - for now, use mock data directly
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
  const isLoading = false;

  // Debug: Log events
  console.log("Using events:", events);

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: number) => {
      // Check if it's a draft event
      const eventToDelete = events?.find(e => e.id === eventId);
      if (eventToDelete?.status === 'draft') {
        // Use the deleteDraft function for drafts
        return await deleteDraft(eventId);
      }
      
      // For regular events, use the normal delete API
      // In a real app, this would be an API call
      // return await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
      
      // For now, we'll simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      // Update local state
      if (eventToDelete) {
        setEvents(events.filter(e => e.id !== eventToDelete.id));
        
        toast({
          title: eventToDelete.status === 'draft' ? "Draft deleted" : "Event deleted",
          description: `${eventToDelete.status === 'draft' ? "Draft" : "Event"} "${eventToDelete.name}" has been deleted successfully.`,
        });
      }
      
      // Close dialog
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    },
    onError: (error) => {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete the event. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleCreateEvent = () => {
    navigate("/events/new");
  };

  const handleEditEvent = (eventId: number) => {
    navigate(`/events/${eventId}/edit`);
  };

  const handleViewEvent = (eventId: number) => {
    navigate(`/events/${eventId}/manage`);
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (event: Event) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  // Handle confirmed deletion
  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    deleteEventMutation.mutate(eventToDelete.id);
  };

  // Format status for display (capitalize first letter, etc.)
  const getStatusDisplayName = (status: string): string => {
    if (!status) return "Unknown";
    
    // Capitalize first letter
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Get badge variant based on status
  const getBadgeVariant = (status?: string): "default" | "secondary" | "destructive" | "outline" => {
    if (!status) return "outline";
    
    switch (status.toLowerCase()) {
      case 'draft':
        return "outline";
      case 'ongoing':
        return "default"; 
      case 'upcoming':
        return "secondary"; 
      case 'ended':
        return "destructive"; 
      case 'unknown':
        return "outline";
      default:
        return "outline";
    }
  };

  // Get badge custom styles for consistent rendering
  const getBadgeStyles = (status?: string): string => {
    if (!status) return "";
    
    switch (status.toLowerCase()) {
      case 'draft':
        return "border-yellow-500 text-yellow-700 bg-yellow-50"; 
      case 'ongoing':
        return "bg-green-500 hover:bg-green-600 text-white"; 
      case 'upcoming':
        return "bg-blue-500 hover:bg-blue-600 text-white"; 
      case 'ended':
        return "bg-red-500 hover:bg-red-600 text-white"; 
      case 'unknown':
        return "border-gray-300 text-gray-700 bg-gray-50";
      default:
        return "border-gray-300 text-gray-700 bg-gray-50";
    }
  };

  // Check if an event is a draft
  const isDraft = (event: Event): boolean => {
    return event.status?.toLowerCase() === 'draft';
  };

  return (
    <div className="flex flex-col w-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Event Management</h1>
        <Button 
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-md"
          onClick={handleCreateEvent}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Create New Event
        </Button>
      </div>

      {/* Table with improved layout */}
      <div className="w-full">
        <Card className="bg-white p-1">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <p>Loading events...</p>
            </div>
          ) : events && events.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%]">Event Name</TableHead>
                    <TableHead className="w-[15%]">Date</TableHead>
                    <TableHead className="w-[30%]">Location</TableHead>
                    <TableHead className="w-[15%]">Status</TableHead>
                    <TableHead className="w-[10%] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id} className={isDraft(event) ? "bg-yellow-50/30" : ""}>
                      <TableCell className="font-medium">{event.name}</TableCell>
                      <TableCell>{formatDate(event.date)}</TableCell>
                      <TableCell>{event.location}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={getBadgeVariant(event.status)}
                          className={getBadgeStyles(event.status)}
                        >
                          {getStatusDisplayName(event.status || "")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {isDraft(event) ? (
                            // Actions for draft events
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleEditEvent(event.id)}
                                title="Resume Draft"
                                className="text-yellow-600 hover:text-yellow-800"
                              >
                                <FileEdit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDeleteClick(event)}
                                title="Delete Draft"
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            // Actions for regular events
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleViewEvent(event.id)}
                                title="View Event Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleEditEvent(event.id)}
                                title="Edit Event"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDeleteClick(event)}
                                title="Delete Event"
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <caption className="mt-4 text-sm text-gray-500 text-right p-4">
                  List of all your events and drafts
                </caption>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <CalendarRange className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No events found</h3>
              <p className="text-gray-500 mb-6">Get started by creating your first event!</p>
              <Button 
                onClick={handleCreateEvent}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Create New Event
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {eventToDelete?.status === 'draft' ? "Delete Draft?" : "Delete Event?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {eventToDelete?.status === 'draft' ? "the draft" : "the event"} "{eventToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-500 text-white hover:bg-red-600"
              disabled={deleteEventMutation.isPending}
            >
              {deleteEventMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 