import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { StaffList } from "@/components/staff/staff-list";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ImportStaffModal } from "@/components/staff/ImportStaffModal";

export default function StaffListPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Fetch events
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/events"],
  });

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
        <div className="w-full md:w-64">
          <Select
            value={selectedEvent}
            onValueChange={setSelectedEvent}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an event" />
            </SelectTrigger>
            <SelectContent>
              {eventsLoading ? (
                <SelectItem value="loading" disabled>
                  Loading events...
                </SelectItem>
              ) : events && events.length > 0 ? (
                events.map((event) => (
                  <SelectItem key={event.id} value={event.id.toString()}>
                    {event.name} - {formatDate(event.date)}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>
                  No events available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex space-x-3">
          <Button 
            variant="outline"
            onClick={() => setIsImportModalOpen(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Staff
          </Button>
          
          {/* Import Staff Modal */}
          <ImportStaffModal 
            open={isImportModalOpen} 
            onOpenChange={setIsImportModalOpen} 
          />
        </div>
      </div>
      
      {selectedEvent ? (
        <StaffList eventId={parseInt(selectedEvent)} />
      ) : (
        <div className="bg-white rounded-2xl shadow-card p-10 text-center">
          <div className="flex flex-col items-center justify-center">
            <Upload className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Select an Event</h3>
            <p className="text-gray-500 max-w-md mb-6">
              Select an event from the dropdown above to view and manage staff assignments.
            </p>
            <Button
              onClick={() => window.location.href = "/events"}
            >
              Create a New Event
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
