import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTime, getInitials } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface StaffCheckIn {
  id: number;
  name: string;
  role: string;
  status: 'checked-in' | 'late' | 'absent';
  time: string;
  timeStatus: string;
  profileImage?: string;
}

interface RecentCheckInsProps {
  eventId: number;
}

export function RecentCheckIns({ eventId }: RecentCheckInsProps) {
  const [displayCount, setDisplayCount] = useState(4);

  const { data: checkins, isLoading } = useQuery<StaffCheckIn[]>({
    queryKey: ['/api/assignments', eventId],
    enabled: !!eventId,
  });

  const handleViewAll = () => {
    // In a real app, we might navigate to a detailed check-in page
    setDisplayCount(prevCount => 
      prevCount === 4 ? (checkins?.length || 0) : 4
    );
  };

  return (
    <Card className="bg-white rounded-2xl shadow-card">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800">Recent Check-ins</h2>
      </div>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          {isLoading ? (
            // Skeleton loading state
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center">
                  <Skeleton className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))
          ) : checkins && checkins.length > 0 ? (
            // Actual check-in data
            checkins.slice(0, displayCount).map((checkin) => (
              <div key={checkin.id} className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center">
                  <Avatar className="w-12 h-12 mr-4">
                    {checkin.profileImage ? (
                      <AvatarImage src={checkin.profileImage} alt={checkin.name} />
                    ) : null}
                    <AvatarFallback>{getInitials(checkin.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{checkin.name}</h4>
                    <div className="text-sm text-gray-500">{checkin.role}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="text-right mr-4">
                    <div 
                      className={`text-sm font-medium ${
                        checkin.status === 'checked-in' 
                          ? 'text-green-500' 
                          : checkin.status === 'late' 
                            ? 'text-amber-500' 
                            : 'text-red-500'
                      }`}
                    >
                      {checkin.status === 'checked-in' 
                        ? 'Checked In' 
                        : checkin.status === 'late' 
                          ? 'Late' 
                          : 'Absent'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {checkin.status !== 'absent' 
                        ? `${formatTime(checkin.time)} (${checkin.timeStatus})`
                        : 'Not checked in yet'}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            ))
          ) : (
            // Empty state
            <div className="text-center py-8">
              <p className="text-gray-500">No check-ins recorded yet.</p>
            </div>
          )}
        </div>
        
        {checkins && checkins.length > 0 && (
          <div className="mt-6 text-center">
            <button 
              className="text-primary hover:text-primary-dark font-medium"
              onClick={handleViewAll}
            >
              {displayCount === 4 ? 'View All Check-ins' : 'Show Less'}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
