import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface RoleStat {
  role: string;
  total: number;
  checkedIn: number;
  percentage: number;
}

interface StaffRoleStatsProps {
  stats?: RoleStat[];
  isLoading: boolean;
  onDownload?: () => void;
}

export function StaffRoleStats({ stats, isLoading, onDownload }: StaffRoleStatsProps) {
  return (
    <Card className="bg-white rounded-2xl shadow-card">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">Staff by Role</h2>
        <button 
          className="text-sm text-primary"
          onClick={onDownload}
        >
          Download
        </button>
      </div>
      
      <CardContent className="p-6">
        {isLoading ? (
          // Loading skeleton
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        ) : stats && stats.length > 0 ? (
          <div className="space-y-4">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium">{stat.role}</div>
                  <div className="text-sm text-gray-500">
                    {stat.checkedIn} staff ({stat.percentage}% checked in)
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${
                      stat.percentage >= 80
                        ? 'bg-primary'
                        : stat.percentage >= 60
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    } h-2 rounded-full`}
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Empty state
          <div className="text-center py-8">
            <p className="text-gray-500">No role data available.</p>
          </div>
        )}
        
        {stats && stats.length > 0 && (
          <div className="mt-6 text-center">
            <button className="text-primary hover:text-primary-dark font-medium">
              View All Roles
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
