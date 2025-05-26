import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, ArrowLeft, MapPin, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

// Mock data for upcoming shifts
const mockUpcomingShifts = [
  {
    id: 101,
    eventName: "Tech Conference 2023",
    date: "2023-12-10T09:00:00Z",
    startTime: "09:00 AM",
    endTime: "05:00 PM",
    location: "Dubai Exhibition Centre, Hall 3",
    role: "Event Assistant"
  },
  {
    id: 102,
    eventName: "Fashion Week",
    date: "2023-12-15T13:00:00Z",
    startTime: "01:00 PM",
    endTime: "09:00 PM",
    location: "Dubai Design District, Building 5",
    role: "Check-in Staff"
  },
  {
    id: 103,
    eventName: "New Year's Eve Celebration",
    date: "2023-12-31T20:00:00Z",
    startTime: "08:00 PM",
    endTime: "01:00 AM",
    location: "Burj Park, Downtown Dubai",
    role: "Event Support"
  }
];

export default function MySchedulePage() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [upcomingShifts, setUpcomingShifts] = useState(mockUpcomingShifts);
  
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/staff-login");
      return;
    }
    
    // In a real app, we would fetch the upcoming shifts from the API
    // setUpcomingShifts(data from API);
  }, [user, authLoading, setLocation]);
  
  const handleBack = () => {
    setLocation("/staff-confirmation");
  };
  
  const handleShiftDetails = (shiftId: number) => {
    // This would navigate to a shift details page in a real app
    console.log(`View details for shift ${shiftId}`);
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
          <h1 className="text-2xl font-bold text-gray-800">My Upcoming Shifts</h1>
        </div>
        
        {upcomingShifts.length > 0 ? (
          <div className="space-y-4">
            {upcomingShifts.map((shift) => (
              <Card 
                key={shift.id} 
                className="bg-white rounded-2xl shadow-card hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleShiftDetails(shift.id)}
              >
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-800">{shift.eventName}</h3>
                      <p className="text-gray-600 text-sm">{shift.role}</p>
                    </div>
                    <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium">
                      Upcoming
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{formatDate(shift.date)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{shift.startTime} - {shift.endTime}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{shift.location}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <Calendar className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">No Upcoming Shifts</h3>
            <p className="text-gray-500 max-w-md">
              You don't have any upcoming shifts scheduled at the moment. Check back later or contact your supervisor for more information.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 