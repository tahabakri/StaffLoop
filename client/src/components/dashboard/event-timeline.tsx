import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { formatDate } from "@/lib/utils";
import { Event } from "@/types/dashboard";
import { cn } from "@/lib/utils";
import { Calendar, Clock, MapPin, Users } from "lucide-react";

interface EventTimelineProps {
  events: Event[];
  selectedEventId: string;
  onSelect: (eventId: string) => void;
  userTimeZone: string;
}

export function EventTimeline({ events, selectedEventId, onSelect, userTimeZone }: EventTimelineProps) {
  const { isLoading } = useQuery({
    queryKey: ["/api/events"],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return events;
    },
  });

  const getStatusColor = (status: Event["status"]) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "ongoing":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner className="w-8 h-8" />
          </div>
        ) : events && events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className={cn(
                  "flex items-start space-x-4 p-4 rounded-lg border cursor-pointer transition-colors",
                  selectedEventId === event.id.toString()
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-accent/50"
                )}
                onClick={() => onSelect(event.id.toString())}
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium leading-none">
                      {event.name}
                    </h3>
                    <span
                      className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        getStatusColor(event.status)
                      )}
                    >
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>
                        {event.checkedInStaff} / {event.totalStaff} Staff
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No events available
          </div>
        )}
      </CardContent>
    </Card>
  );
} 