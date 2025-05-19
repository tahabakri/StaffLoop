import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ReportGenerator } from "@/components/reports/report-generator";
import { Event } from "@/types/dashboard";

export default function ReportPage() {
  const [selectedEvent, setSelectedEvent] = useState<string>("");

  // Fetch events
  const { data: events = [], isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reports</h1>
      </div>

      <div className="grid gap-6">
        <ReportGenerator
          events={events}
          selectedEvent={selectedEvent}
          onEventChange={setSelectedEvent}
        />
      </div>
    </div>
  );
}
