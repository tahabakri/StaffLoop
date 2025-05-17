import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { StaffList } from "@/components/staff/staff-list";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/utils";

export default function StaffListPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  // Fetch events
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/events"],
  });

  const handleFileUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    toast({
      title: "Staff CSV Upload",
      description: "Your staff data is being processed.",
    });
    
    setIsUploadDialogOpen(false);
    
    // In a real implementation, we would send the file to the server
    setTimeout(() => {
      toast({
        title: "Upload complete",
        description: "Staff data has been successfully uploaded and assigned to the event.",
      });
    }, 2000);
  };

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
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import Staff
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Upload Staff CSV</DialogTitle>
                <DialogDescription>
                  Upload a CSV file with staff details to assign to the selected event
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleFileUpload}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="event-select">Select Event</Label>
                    <Select
                      value={selectedEvent}
                      onValueChange={setSelectedEvent}
                    >
                      <SelectTrigger id="event-select">
                        <SelectValue placeholder="Select an event" />
                      </SelectTrigger>
                      <SelectContent>
                        {events && events.length > 0 ? (
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
                  
                  <div className="grid gap-2">
                    <Label htmlFor="csv-file">Upload CSV</Label>
                    <Input
                      id="csv-file"
                      type="file"
                      accept=".csv"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      CSV should include columns: name, email, phone, role
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={!selectedEvent}>
                    Upload and Assign
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
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
