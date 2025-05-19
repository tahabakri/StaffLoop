import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { formatDistanceToNow } from "date-fns";
import { getInitials } from "@/lib/utils";
import { CheckCircle, Clock, XCircle } from "lucide-react";

interface RecentCheckinsTimelineProps {
  eventId: number;
}

interface CheckIn {
  id: number;
  staffName: string;
  staffRole: string;
  status: "checked-in" | "late" | "absent";
  checkInTime: string;
  avatarUrl?: string;
}

export function RecentCheckinsTimeline({ eventId }: RecentCheckinsTimelineProps) {
  const { data: checkins, isLoading } = useQuery<CheckIn[]>({
    queryKey: ["/api/events", eventId, "checkins"],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return [
        {
          id: 1,
          staffName: "John Doe",
          staffRole: "Event Manager",
          status: "checked-in",
          checkInTime: new Date().toISOString(),
        },
        {
          id: 2,
          staffName: "Jane Smith",
          staffRole: "Staff",
          status: "late",
          checkInTime: new Date().toISOString(),
        },
        {
          id: 3,
          staffName: "Mike Johnson",
          staffRole: "Staff",
          status: "absent",
          checkInTime: new Date().toISOString(),
        },
      ];
    },
  });

  const getStatusIcon = (status: CheckIn["status"]) => {
    switch (status) {
      case "checked-in":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "late":
        return <Clock className="w-4 h-4 text-amber-500" />;
      case "absent":
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: CheckIn["status"]) => {
    switch (status) {
      case "checked-in":
        return "text-green-500";
      case "late":
        return "text-amber-500";
      case "absent":
        return "text-red-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Check-ins</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner className="w-8 h-8" />
          </div>
        ) : checkins && checkins.length > 0 ? (
          <div className="space-y-4">
            {checkins.map((checkin) => (
              <div key={checkin.id} className="flex items-start space-x-4">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={checkin.avatarUrl} alt={checkin.staffName} />
                  <AvatarFallback>{getInitials(checkin.staffName)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none">
                      {checkin.staffName}
                    </p>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(checkin.checkInTime), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">{checkin.staffRole}</span>
                    <span className="text-xs">•</span>
                    <span className={`text-xs ${getStatusColor(checkin.status)}`}>
                      {checkin.status === "checked-in" ? "Checked in" : 
                       checkin.status === "late" ? "Late" : "Absent"}
                    </span>
                    {getStatusIcon(checkin.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No recent check-ins
          </div>
        )}
      </CardContent>
    </Card>
  );
} 