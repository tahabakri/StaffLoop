import { useNavigate } from "react-router-dom";
import { Calendar, dateFnsLocalizer, Views, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addMonths, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/styles/calendar.css";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CalendarX } from "lucide-react";
import { fetchEvents } from "@/lib/api/events";
import { useQuery } from "@tanstack/react-query";
import { CalendarEvent, Event } from "@/types/dashboard";
import { cn } from "@/lib/utils";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

// Status color mapping
const statusColors: Record<string, string> = {
  draft: "#f59e0b", // amber-500
  upcoming: "#3b82f6", // blue-500
  ongoing: "#10b981", // emerald-500
  ended: "#6b7280", // gray-500
  cancelled: "#ef4444", // red-500
};

// Status text color mapping
const statusTextColors: Record<string, string> = {
  draft: "#000000", // black text for amber background
  upcoming: "#ffffff", // white text for blue background
  ongoing: "#ffffff", // white text for green background
  ended: "#ffffff", // white text for gray background
  cancelled: "#ffffff", // white text for red background
};

type CalendarView = "month" | "week";

export default function CalendarPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<CalendarView>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Calculate the visible date range based on current view and date
  const visibleDateRange = useMemo(() => {
    if (view === "month") {
      return {
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate)
      };
    } else {
      // For week view, use the week containing the current date
      const start = startOfWeek(currentDate, { weekStartsOn: 0 });
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { start, end };
    }
  }, [currentDate, view]);
  
  // Fetch events for the visible date range
  const { data: eventsData, isLoading, error } = useQuery({
    queryKey: ['events', format(visibleDateRange.start, 'yyyy-MM-dd'), format(visibleDateRange.end, 'yyyy-MM-dd')],
    queryFn: () => fetchEvents(
      format(visibleDateRange.start, 'yyyy-MM-dd'),
      format(visibleDateRange.end, 'yyyy-MM-dd')
    )
  });

  // Transform API events to calendar events
  const events = useMemo(() => {
    if (!eventsData) return [];
    
    return eventsData.map(event => ({
      id: event.id,
      title: event.name,
      start: new Date(event.date),
      end: new Date(event.date),
      location: event.location,
      status: event.status,
      checkedInStaff: event.checkedInStaff,
      totalStaff: event.totalStaff
    }));
  }, [eventsData]);

  // Custom event style by status
  const eventPropGetter = (event: any) => {
    const status = event.status || "upcoming";
    const backgroundColor = statusColors[status] || statusColors.upcoming;
    const color = statusTextColors[status] || "#ffffff";
    
    return {
      style: {
        backgroundColor,
        color,
        borderRadius: "6px",
        border: "none",
        padding: "2px 6px",
        opacity: 0.95,
      },
    };
  };

  // Custom toolbar component using Shadcn UI
  const CustomToolbar = (toolbar: any) => {
    const goToToday = () => {
      toolbar.onNavigate('TODAY');
    };

    const goToPrev = () => {
      toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
      toolbar.onNavigate('NEXT');
    };

    const handleViewChange = (value: string) => {
      if (value) {
        toolbar.onView(value);
      }
    };

    return (
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Button variant="default" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={goToPrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="ml-2 text-lg font-semibold flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5" />
            <span>{format(toolbar.date, 'MMMM yyyy')}</span>
          </div>
        </div>
        <ToggleGroup type="single" value={toolbar.view} onValueChange={handleViewChange}>
          <ToggleGroupItem value="month">Month</ToggleGroupItem>
          <ToggleGroupItem value="week">Week</ToggleGroupItem>
        </ToggleGroup>
      </div>
    );
  };

  // Custom event component with tooltip
  const EventComponent = ({ event }: { event: any }) => {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full truncate">
              {event.title}
            </div>
          </TooltipTrigger>
          <TooltipContent className="p-0">
            <div className="p-3 max-w-xs">
              <h4 className="font-semibold text-sm">{event.title}</h4>
              <div className="text-xs mt-1">
                <p><span className="font-medium">Date:</span> {format(new Date(event.start), 'PPP')}</p>
                <p><span className="font-medium">Location:</span> {event.location}</p>
                <p><span className="font-medium">Status:</span> {event.status.charAt(0).toUpperCase() + event.status.slice(1)}</p>
                <p><span className="font-medium">Staff:</span> {event.checkedInStaff}/{event.totalStaff}</p>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Handle date navigation
  const handleNavigate = (date: Date) => {
    setCurrentDate(date);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Event Calendar</h1>
      <Card className="p-4 shadow-sm relative">
        {events.length > 0 || isLoading ? (
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            titleAccessor="title"
            style={{ height: 700 }}
            views={{
              month: true,
              week: true,
            }}
            view={view}
            date={currentDate}
            onNavigate={handleNavigate}
            onView={(v) => setView(v as CalendarView)}
            onSelectEvent={(event: any) => navigate(`/events/${event.id}/manage`)}
            eventPropGetter={eventPropGetter}
            components={{
              toolbar: CustomToolbar,
              event: EventComponent,
            }}
            popup
            className="rounded-md"
          />
        ) : !error ? (
          <div className="flex flex-col items-center justify-center h-[700px] text-muted-foreground">
            <CalendarX className="h-16 w-16 mb-4" />
            <h3 className="text-lg font-medium">No events found</h3>
            <p className="text-sm mt-1">No events scheduled for this time period.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate('/events/new')}
            >
              Create New Event
            </Button>
          </div>
        ) : null}
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-background/50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        
        {error && (
          <div className="p-4 text-center text-destructive h-[700px] flex flex-col items-center justify-center">
            <h3 className="text-lg font-medium">Error loading events</h3>
            <p className="text-sm mt-1">Please try again later.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        )}
        
        {/* Status Legend */}
        <div className="mt-6 border-t pt-4">
          <h3 className="text-sm font-medium mb-2">Event Status Legend</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(statusColors).map(([status, color]) => (
              <div key={status} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded" 
                  style={{ backgroundColor: color }}
                ></div>
                <span className="text-sm capitalize">{status}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
} 