import { Card, CardContent } from "@/components/ui/card";
import { calculatePercentage } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface StaffStatusData {
  totalStaff: number;
  checkedIn: number;
  late: number;
  absent: number;
}

interface StaffStatusChartProps {
  data?: StaffStatusData;
  isLoading: boolean;
}

export function StaffStatusChart({ data, isLoading }: StaffStatusChartProps) {
  // Calculate percentages for the pie chart
  const checkedInPercentage = data ? calculatePercentage(data.checkedIn, data.totalStaff) : 0;
  const latePercentage = data ? calculatePercentage(data.late, data.totalStaff) : 0;
  const absentPercentage = data ? calculatePercentage(data.absent, data.totalStaff) : 0;

  // Generate conic gradient for the pie chart
  const pieChartGradient = data
    ? `conic-gradient(
        #10B981 0% ${checkedInPercentage}%, 
        #F59E0B ${checkedInPercentage}% ${checkedInPercentage + latePercentage}%, 
        #EF4444 ${checkedInPercentage + latePercentage}% 100%
      )`
    : 'conic-gradient(#f3f4f6 0% 100%)';

  return (
    <Card className="bg-white rounded-2xl shadow-card">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800">Staff by Status</h2>
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center justify-center h-60">
          <div className="relative h-48 w-48">
            {isLoading ? (
              <Skeleton className="absolute inset-0 rounded-full" />
            ) : (
              <>
                {/* Pie chart */}
                <div 
                  className="absolute inset-0 rounded-full overflow-hidden" 
                  style={{ background: pieChartGradient }}
                />
                
                {/* Center circle with total */}
                <div className="absolute inset-0 rounded-full flex items-center justify-center bg-white" 
                    style={{ width: '60%', height: '60%', left: '20%', top: '20%' }}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold">{data?.totalStaff || 0}</div>
                    <div className="text-sm text-gray-500">Total Staff</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-4">
          {isLoading ? (
            // Loading skeletons for the legend
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-4 w-full mx-auto mb-2" />
                <Skeleton className="h-8 w-10 mx-auto mb-1" />
                <Skeleton className="h-3 w-8 mx-auto" />
              </div>
            ))
          ) : (
            <>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm font-medium">Checked In</span>
                </div>
                <div className="text-xl font-bold">{data?.checkedIn || 0}</div>
                <div className="text-xs text-gray-500">{checkedInPercentage}%</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                  <span className="text-sm font-medium">Late</span>
                </div>
                <div className="text-xl font-bold">{data?.late || 0}</div>
                <div className="text-xs text-gray-500">{latePercentage}%</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <span className="text-sm font-medium">Absent</span>
                </div>
                <div className="text-xl font-bold">{data?.absent || 0}</div>
                <div className="text-xs text-gray-500">{absentPercentage}%</div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
