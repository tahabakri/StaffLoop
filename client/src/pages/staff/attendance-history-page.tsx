import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2,
  LogOut
} from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";

// Mock data for attendance history
const mockAttendanceHistory = [
  {
    id: 201,
    eventName: "AI Summit 2023",
    date: "2023-11-28T08:00:00Z",
    checkInTime: "2023-11-28T07:45:23Z",
    clockOutTime: "2023-11-28T16:15:42Z",
    location: "Dubai Exhibition Centre, Hall 2A",
    role: "Event Assistant",
    duration: {
      hours: 8,
      minutes: 30
    }
  },
  {
    id: 202,
    eventName: "Retail Expo",
    date: "2023-11-15T09:30:00Z",
    checkInTime: "2023-11-15T09:15:11Z",
    clockOutTime: "2023-11-15T17:45:38Z",
    location: "Dubai World Trade Centre",
    role: "Registration Staff",
    duration: {
      hours: 8,
      minutes: 30
    }
  },
  {
    id: 203,
    eventName: "Music Festival",
    date: "2023-11-05T16:00:00Z",
    checkInTime: "2023-11-05T15:30:27Z",
    clockOutTime: "2023-11-05T23:45:12Z",
    location: "Dubai Media City Amphitheatre",
    role: "Event Support",
    duration: {
      hours: 8,
      minutes: 15
    }
  }
];

export default function AttendanceHistoryPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [attendanceHistory, setAttendanceHistory] = useState(mockAttendanceHistory);
  
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/staff-login");
      return;
    }
    
    // In a real app, we would fetch the attendance history from the API
    // setAttendanceHistory(data from API);
  }, [user, authLoading, setLocation]);
  
  const handleBack = () => {
    setLocation("/staff-confirmation");
  };
  
  const handleAttendanceDetails = (recordId: number) => {
    // This would navigate to an attendance record details page in a real app
    console.log(`View details for attendance record ${recordId}`);
  };
  
  // Calculate total hours worked
  const calculateTotalHours = () => {
    return attendanceHistory.reduce((total, record) => {
      return total + record.duration.hours + (record.duration.minutes / 60);
    }, 0).toFixed(1);
  };
  
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-10">
        <Logo />
        <div className="text-gray-700 text-sm">
          <div className="font-medium">{user?.name}</div>
          <div className="text-gray-500 text-xs">{user?.role}</div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="mr-2 p-1"
            onClick={handleBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">My Attendance History</h1>
        </div>
        
        {/* Summary Card */}
        <Card className="bg-blue-50 rounded-2xl p-5 mb-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-blue-800">Total Hours</h3>
              <p className="text-blue-700">{calculateTotalHours()} hours this month</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </Card>
        
        {attendanceHistory.length > 0 ? (
          <div className="space-y-4">
            {attendanceHistory.map((record) => (
              <Card 
                key={record.id} 
                className="bg-white rounded-2xl shadow-card hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleAttendanceDetails(record.id)}
              >
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-800">{record.eventName}</h3>
                      <p className="text-gray-600 text-sm">{record.role}</p>
                    </div>
                    <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-medium">
                      Completed
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{formatDate(record.date)}</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                      <span>Check-in: {formatTime(record.checkInTime)}</span>
                    </div>
                    <div className="flex items-center">
                      <LogOut className="h-4 w-4 mr-2 text-red-500" />
                      <span>Clock-out: {formatTime(record.clockOutTime)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span>Duration: {record.duration.hours}h {record.duration.minutes}m</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{record.location}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <Clock className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">No Attendance Records</h3>
            <p className="text-gray-500 max-w-md">
              You don't have any attendance records yet. Once you complete shifts, your attendance history will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 