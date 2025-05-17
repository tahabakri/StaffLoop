import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { StatsCard } from "@/components/dashboard/stats-card";
import { RecentCheckIns } from "@/components/dashboard/recent-checkins";
import { StaffStatusChart } from "@/components/dashboard/staff-status-chart";
import { StaffRoleStats } from "@/components/dashboard/staff-role-stats";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, CheckCircle, Clock, XCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const { user } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<string>("");

  // Fetch events
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/events"],
  });

  // Fetch dashboard stats for selected event
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats", selectedEvent],
    enabled: !!selectedEvent,
  });

  // Mock staff stats by role data (in a real app, this would come from the API)
  const roleStats = stats?.roleStats
    ? Object.entries(stats.roleStats).map(([role, data]) => ({
        role,
        total: data.total,
        checkedIn: data.checkedIn,
        percentage: Math.round((data.checkedIn / data.total) * 100),
      }))
    : [];

  // Calculate current date for subtitle
  const currentDate = new Date();
  const formattedDate = formatDate(currentDate);

  return (
    <div className="space-y-6">
      {/* Event selector */}
      <div className="mb-6">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
              subtitle={`${stats ? Math.round((stats.checkedIn / stats.totalStaff) * 100) : 0}% attendance`}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <RecentCheckIns eventId={parseInt(selectedEvent)} />
            <StaffStatusChart data={stats} isLoading={statsLoading} />
          </div>
          
          {/* Staff Role Stats */}
          <StaffRoleStats 
            stats={roleStats} 
            isLoading={statsLoading}
            onDownload={() => {
              // In a real app, this would trigger a report download
              console.log("Downloading report...");
            }}
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-card p-12">
          <div className="text-center max-w-md">
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
    </div>
  );
}
