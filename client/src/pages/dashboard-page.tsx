import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Calendar, 
  CheckSquare, 
  Search,
  PlusCircle,
  UserPlus,
  Bell,
  Sun,
  ArrowRight
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Event, DashboardStats } from '@/types/dashboard';
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Import all dashboard components from the index file
import {
  StatsCard,
  RecentCheckIns,
  StaffStatusChart,
  StaffRoleStats,
  QuickAssignDialog,
  RecentCheckinsTimeline,
  TimeRangeFilter,
  EventTimeline
} from "@/components/dashboard";

// Mock recent activity data
const recentActivities = [
  { id: 1, message: "John Doe checked in to Event A", timestamp: "21 May 2025, 07:10 PM +04", type: "check-in" },
  { id: 2, message: "Summer Festival event created", timestamp: "20 May 2025, 03:00 PM +04", type: "event-created" },
  { id: 3, message: "5 staff assigned to Dubai Music Festival", timestamp: "19 May 2025, 02:15 PM +04", type: "staff-assigned" },
  { id: 4, message: "Sarah Johnson checked in late", timestamp: "18 May 2025, 06:30 PM +04", type: "check-in-late" },
  { id: 5, message: "Tech Conference event completed", timestamp: "17 May 2025, 09:00 PM +04", type: "event-completed" }
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<string>("");

  // Fetch events
  const { data: events, isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  // Fetch dashboard stats for selected event
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats", selectedEvent],
    enabled: !!selectedEvent,
  });

  // Calculate attendance percentage safely
  const calculateAttendancePercentage = (stats: DashboardStats | undefined) => {
    if (!stats || !stats.totalStaff || stats.totalStaff === 0) return 0;
    return Math.round((stats.checkedIn / stats.totalStaff) * 100);
  };

  // Mock staff stats by role data
  const roleStats = stats?.roleStats
    ? Object.entries(stats.roleStats).map(([role, data]) => ({
        role,
        total: data.total,
        checkedIn: data.checkedIn,
        percentage: Math.round((data.checkedIn / data.total) * 100),
      }))
    : [];

  // Filter events based on search and status
  const filteredEvents = events || [];

  // Calculate current date for subtitle
  const currentDate = new Date();
  const formattedDate = formatDate(currentDate);
  const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
  
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = currentDate.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Quick action handlers
  const handleCreateEvent = () => {
    window.location.href = "/events/new";
  };

  const handleAssignStaff = () => {
    navigate('/staff');
  };

  const handleSendReminder = () => {
    toast({
      title: "Success",
      description: "Reminders sent to all staff members.",
    });
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col w-full space-y-6 pb-20">
      {/* Personalized Greeting */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-800">{getGreeting()}, {user.name || 'User'}!</h1>
        <p className="text-gray-500 text-sm">Today is {dayOfWeek}, {formattedDate}</p>
      </div>

      {/* Quick Actions */}
      <section className="w-full mb-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            onClick={handleCreateEvent}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New Event
          </Button>
          <Button 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            onClick={handleAssignStaff}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Assign Staff
          </Button>
          <Button 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            onClick={handleSendReminder}
          >
            <Bell className="h-4 w-4 mr-2" />
            Send Reminder
          </Button>
        </div>
      </section>

      {/* Event selector */}
      <div className="w-full">
        <h2 className="text-xl font-semibold mb-4">Event Statistics</h2>
        <Select
          value={selectedEvent}
          onValueChange={setSelectedEvent}
        >
          <SelectTrigger className="w-full md:w-[300px]">
            <SelectValue placeholder="Select an event to view statistics" />
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
                  <Badge 
                    className={`ml-2 ${
                      event.status === 'upcoming' ? 'bg-yellow-500' : 
                      event.status === 'ongoing' ? 'bg-green-500' : 
                      'bg-red-500'
                    }`}
                  >
                    {event.status === 'upcoming' ? 'Upcoming' : 
                     event.status === 'ongoing' ? 'Active' : 'Ended'}
                  </Badge>
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

      {/* Stats Cards */}
      {selectedEvent ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 w-full">
            <StatsCard
              title="Total Staff"
              value={stats?.totalStaff || 0}
              subtitle="people assigned"
              icon={<Users className="h-6 w-6" />}
              iconBgColor="bg-blue-100"
              iconColor="text-primary"
              action={{ label: "View all", color: "text-primary" }}
              onClick={() => window.location.href = "/staff"}
            />
            
            <StatsCard
              title="Checked In"
              value={stats?.checkedIn || 0}
              subtitle={`${calculateAttendancePercentage(stats)}% attendance`}
              icon={<CheckCircle className="h-6 w-6" />}
              iconBgColor="bg-green-100"
              iconColor="text-green-500"
              action={{ label: "On target", color: "text-green-500" }}
            />
            
            <StatsCard
              title="Late"
              value={stats?.late || 0}
              subtitle="by 15+ minutes"
              icon={<Clock className="h-6 w-6" />}
              iconBgColor="bg-amber-100"
              iconColor="text-amber-500"
              action={{ label: "Follow up", color: "text-amber-500" }}
            />
            
            <StatsCard
              title="Absent"
              value={stats?.absent || 0}
              subtitle="need replacement"
              icon={<XCircle className="h-6 w-6" />}
              iconBgColor="bg-red-100"
              iconColor="text-red-500"
              action={{ label: "Critical", color: "text-red-500" }}
            />
          </div>
          
          {/* Recent Check-ins and Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 w-full">
            <RecentCheckIns eventId={parseInt(selectedEvent)} />
            <StaffStatusChart data={stats} isLoading={statsLoading} />
          </div>
          
          {/* Staff Role Stats */}
          <StaffRoleStats 
            stats={roleStats} 
            isLoading={statsLoading}
            onDownload={() => {
              toast({
                title: "Report Download",
                description: "Staff role statistics report has been downloaded.",
              });
            }}
          />
        </>
      ) : (
        <div className="w-full bg-white rounded-2xl shadow-md p-8 md:p-12">
          <div className="text-center max-w-md mx-auto">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Select an Event</h2>
            <p className="text-gray-600 mb-6">
              Choose an event from the dropdown above to view attendance statistics and staff check-ins.
            </p>
            <Button
              onClick={() => window.location.href = "/events"}
            >
              Create a New Event
            </Button>
          </div>
        </div>
      )}

      {/* Recent Activity Feed */}
      <section className="w-full mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <Link to="/activity-log" className="text-sm text-blue-600 flex items-center hover:text-blue-800">
            See All <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        <Card className="bg-white rounded-xl shadow-md">
          <CardContent className="p-0">
            <div className="max-h-64 overflow-y-auto">
              {recentActivities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="p-4 border-b last:border-b-0 hover:bg-gray-50"
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-8 w-8 rounded-full items-center justify-center
                      ${activity.type === 'check-in' ? 'bg-green-100' : 
                        activity.type === 'check-in-late' ? 'bg-amber-100' : 
                        activity.type === 'event-created' ? 'bg-blue-100' : 
                        activity.type === 'event-completed' ? 'bg-purple-100' : 
                        'bg-gray-100'}`}
                    >
                      {activity.type === 'check-in' ? 
                        <CheckCircle className="h-4 w-4 text-green-600" /> : 
                        activity.type === 'check-in-late' ?
                        <Clock className="h-4 w-4 text-amber-600" /> :
                        activity.type === 'event-created' ?
                        <Calendar className="h-4 w-4 text-blue-600" /> :
                        activity.type === 'staff-assigned' ?
                        <UserPlus className="h-4 w-4 text-indigo-600" /> :
                        <Calendar className="h-4 w-4 text-purple-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}