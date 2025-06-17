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
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  CalendarX,
  LayoutGrid,
  List,
  Filter,
  ChevronDown,
  Plus,
  Clock
} from "lucide-react";
import { fetchEvents } from "@/lib/api/events";
import { useQuery } from "@tanstack/react-query";
import { CalendarEvent, Event } from "@/types/dashboard";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

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

type CalendarView = "month" | "week" | "agenda";
type EventStatus = "draft" | "upcoming" | "ongoing" | "ended" | "cancelled";

interface EventFilters {
  status: Record<EventStatus, boolean>;
}

export default function CalendarPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<CalendarView>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filters, setFilters] = useState<EventFilters>({
    status: {
      draft: true,
      upcoming: true,
      ongoing: true,
      ended: true,
      cancelled: true,
    }
  });
  
  // Calculate the visible date range based on current view and date
  const visibleDateRange = useMemo(() => {
    if (view === "month") {
      return {
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate)
      };
    } else if (view === "week") {
      // For week view, use the week containing the current date
      const start = startOfWeek(currentDate, { weekStartsOn: 0 });
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { start, end };
    } else {
      // For agenda view, use the same range as month view
      return {
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate)
      };
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
    
    return eventsData
      .filter(event => filters.status[event.status as EventStatus])
      .map(event => ({
        id: event.id,
        title: event.name,
        start: new Date(event.date),
        end: new Date(event.date),
        location: event.location,
        status: event.status,
        checkedInStaff: event.checkedInStaff,
        totalStaff: event.totalStaff,
        startTime: format(new Date(event.date), 'HH:mm')
      }));
  }, [eventsData, filters]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return Object.values(filters.status).filter(Boolean).length;
  }, [filters]);

  // Custom event style by status - using left border for status indication
  const eventPropGetter = (event: any) => {
    const status = event.status || "upcoming";
    const statusColor = statusColors[status] || statusColors.upcoming;
    
    return {
      style: {
        backgroundColor: "#ffffff",
        color: "#000000",
        borderRadius: "6px",
        borderLeft: `4px solid ${statusColor}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
        padding: "2px 6px",
        opacity: 0.95,
      },
    };
  };

  // Handle date navigation
  const handleNavigate = (date: Date) => {
    setCurrentDate(date);
  };

  // Handle filter changes
  const handleStatusFilterChange = (status: EventStatus, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      status: {
        ...prev.status,
        [status]: checked
      }
    }));
  };

  // Custom day cell component to handle "more" events
  const DayCellWrapper = ({ children, value }: any) => {
    const eventsForDay = events.filter(
      event => event.start.toDateString() === value.toDateString()
    );

    // Only add special handling if we have events for this day
    if (eventsForDay.length > 0) {
      return (
        <div className="relative h-full">
          {children}
        </div>
      );
    }

    return <div className="h-full">{children}</div>;
  };

  // Custom event component with tooltip and time display
  const EventComponent = ({ event }: { event: any }) => {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full truncate text-xs">
              <span className="font-medium">{event.startTime}</span> {event.title}
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" align="start" className="p-0 w-64">
            <div className="p-3">
              <h4 className="font-semibold text-sm">{event.title}</h4>
              <div className="text-xs mt-2 space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{format(new Date(event.start), 'PPP')} at {event.startTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    className={`capitalize ${
                      event.status === 'draft' ? 'bg-amber-500 text-black' : 
                      event.status === 'upcoming' ? 'bg-blue-500' : 
                      event.status === 'ongoing' ? 'bg-emerald-500' : 
                      event.status === 'ended' ? 'bg-gray-500' : 
                      'bg-red-500'
                    }`}
                  >
                    {event.status}
                  </Badge>
                  <span className="text-xs">{event.checkedInStaff}/{event.totalStaff} staff checked in</span>
                </div>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Custom popup component for showing all events on a day
  const DayEventsPopover = ({ date, events }: { date: Date, events: any[] }) => {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="text-xs h-5 px-1 hover:bg-muted">
            +{events.length} more
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0">
          <div className="p-3 bg-muted font-medium">
            {format(date, 'PPPP')}
          </div>
          <ScrollArea className="h-[300px]">
            <div className="p-3 space-y-2">
              {events.map((event) => (
                <div 
                  key={event.id}
                  className="p-2 border-l-4 rounded bg-white cursor-pointer hover:bg-muted"
                  style={{ borderLeftColor: statusColors[event.status] || statusColors.upcoming }}
                  onClick={() => navigate(`/events/${event.id}/manage`)}
                >
                  <div className="font-medium">{event.title}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    {event.startTime}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    );
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
        setView(value as CalendarView);
      }
    };

    return (
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          {/* Left: View mode toggles */}
          <div className="flex items-center gap-2">
            <ToggleGroup type="single" value={view} onValueChange={handleViewChange}>
              <ToggleGroupItem value="month" aria-label="Month view">
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="agenda" aria-label="Agenda view">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Center: Primary navigation */}
          <div className="flex items-center gap-2 flex-grow justify-center">
            <Button variant="default" onClick={goToToday} className="px-3">
              Today
            </Button>
            <div className="flex items-center">
              <Button variant="outline" size="icon" onClick={goToPrev} className="rounded-r-none border-r-0">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={goToNext} className="rounded-l-none">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-lg font-semibold flex items-center">
              <span>{format(toolbar.date, 'MMMM yyyy')}</span>
            </div>
          </div>

          {/* Right: Filters and New Event button */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                  {activeFilterCount < 5 && (
                    <Badge className="ml-1 bg-primary h-5 w-5 p-0 flex items-center justify-center">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Event Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.entries(filters.status).map(([status, checked]) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={checked}
                    onCheckedChange={(checked) => handleStatusFilterChange(status as EventStatus, checked)}
                  >
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: statusColors[status as EventStatus] }}
                      ></div>
                      <span className="capitalize">{status}</span>
                    </div>
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <span>Sort By</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem checked>
                  Start Date (Ascending)
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>
                  Start Date (Descending)
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>
                  Event Name (A-Z)
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>
                  Event Name (Z-A)
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={() => navigate('/events/new')} className="gap-2">
              <Plus className="h-4 w-4" /> New Event
            </Button>
          </div>
        </div>

        {/* Timeframe toggles */}
        <div className="flex items-center justify-center">
          <ToggleGroup type="single" value={view} onValueChange={handleViewChange} className="justify-center">
            <ToggleGroupItem value="month" className="px-4">Month</ToggleGroupItem>
            <ToggleGroupItem value="week" className="px-4">Week</ToggleGroupItem>
            <ToggleGroupItem value="agenda" className="px-4">Agenda</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    );
  };

  // Custom component for the agenda view
  const AgendaView = () => {
    // Group events by date
    const eventsByDate = events.reduce((acc, event) => {
      const dateKey = format(event.start, 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(event);
      return acc;
    }, {} as Record<string, any[]>);

    // Sort dates
    const sortedDates = Object.keys(eventsByDate).sort();

    return (
      <div className="space-y-6 p-4">
        {sortedDates.length > 0 ? (
          sortedDates.map(dateKey => (
            <div key={dateKey} className="space-y-2">
              <h3 className="font-medium text-lg sticky top-0 bg-background py-2">
                {format(new Date(dateKey), 'EEEE, MMMM d, yyyy')}
              </h3>
              <div className="space-y-2">
                {eventsByDate[dateKey].map(event => (
                  <div 
                    key={event.id}
                    className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-muted"
                    style={{ borderLeftWidth: '4px', borderLeftColor: statusColors[event.status] }}
                    onClick={() => navigate(`/events/${event.id}/manage`)}
                  >
                    <div className="flex-1">
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4" />
                        <span>{event.startTime}</span>
                        <span className="mx-2">•</span>
                        <span>{event.location}</span>
                      </div>
                    </div>
                    <Badge 
                      className={`capitalize ml-2 ${
                        event.status === 'draft' ? 'bg-amber-500 text-black' : 
                        event.status === 'upcoming' ? 'bg-blue-500' : 
                        event.status === 'ongoing' ? 'bg-emerald-500' : 
                        event.status === 'ended' ? 'bg-gray-500' : 
                        'bg-red-500'
                      }`}
                    >
                      {event.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-[600px] text-muted-foreground">
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
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Event Calendar</h1>
      <Card className="p-4 shadow-sm relative">
        {/* Custom toolbar always visible */}
        <CustomToolbar 
          date={currentDate} 
          onNavigate={handleNavigate} 
          view={view} 
          onView={(v: string) => setView(v as CalendarView)} 
        />
        
        {events.length > 0 || isLoading ? (
          view === "agenda" ? (
            <AgendaView />
          ) : (
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
                toolbar: () => null, // Hide default toolbar
                event: EventComponent,
                dateCellWrapper: DayCellWrapper,
              }}
              popup
              className="rounded-md"
              formats={{
                dayFormat: (date: Date, culture: string, localizer: any) => 
                  localizer.format(date, 'dd', culture),
                dayHeaderFormat: (date: Date, culture: string, localizer: any) => 
                  localizer.format(date, 'EEE', culture),
              }}
            />
          )
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
                  className="w-4 h-4 rounded-full" 
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