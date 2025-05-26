import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate, formatTime, getInitials } from "@/lib/utils";
import { User, MapPin, Clock, Phone, CheckCircle2, LogOut, Calendar, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCurrentLocation } from "@/lib/camera-utils";
import { clockOut, ClockOutRequest } from "@/lib/api/attendance";

interface ConfirmationData {
  staffId: number;
  eventId: number;
  checkInTime: string;
  clockOutTime?: string;
  staffName: string;
  staffRole: string;
  staffImage?: string;
  eventName: string;
  eventLocation: string;
  timeStatus: string;
  supervisorContact?: {
    name: string;
    role: string;
    image?: string;
    phone?: string;
  };
  schedule?: {
    items: {
      title: string;
      timeRange: string;
    }[];
  };
}

interface CheckInConfirmationProps {
  confirmationData: ConfirmationData;
  onStatusChange?: (newStatus: 'checkedIn' | 'clockedOut') => void;
}

export function CheckInConfirmation({ confirmationData, onStatusChange }: CheckInConfirmationProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'checkedIn' | 'clockedOut'>(
    confirmationData.clockOutTime ? 'clockedOut' : 'checkedIn'
  );
  const [clockOutTime, setClockOutTime] = useState<string | undefined>(
    confirmationData.clockOutTime
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: event } = useQuery({
    queryKey: [`/api/events/${confirmationData.eventId}`],
    enabled: !!confirmationData.eventId,
  });

  // Calculate shift duration if checked in and clocked out
  const getShiftDuration = () => {
    if (!clockOutTime || !confirmationData.checkInTime) return null;
    
    const checkIn = new Date(confirmationData.checkInTime);
    const clockOut = new Date(clockOutTime);
    
    const durationMs = clockOut.getTime() - checkIn.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours, minutes };
  };
  
  const shiftDuration = getShiftDuration();

  // Clock out mutation
  const clockOutMutation = useMutation({
    mutationFn: async () => {
      setIsProcessing(true);
      
      try {
        // Get current location
        const location = await getCurrentLocation() || { 
          latitude: 25.2048, 
          longitude: 55.2708 // Default coordinates if location fails
        };
        
        const clockOutRequest: ClockOutRequest = {
          staffId: confirmationData.staffId,
          eventId: confirmationData.eventId,
          location: location
        };
        
        // Call the clockOut API function
        return await clockOut(clockOutRequest);
      } catch (error) {
        console.error("Error during clock-out:", error);
        throw new Error("Failed to clock out. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    },
    onSuccess: (data) => {
      // Update state with clock out time
      setClockOutTime(data.clockOutTime);
      setStatus('clockedOut');
      
      // Update parent component if callback provided
      if (onStatusChange) {
        onStatusChange('clockedOut');
      }
      
      // Update sessionStorage
      try {
        const storedData = sessionStorage.getItem('checkInData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          parsedData.clockOutTime = data.clockOutTime;
          sessionStorage.setItem('checkInData', JSON.stringify(parsedData));
        }
      } catch (error) {
        console.error("Error updating session storage:", error);
      }
      
      toast({
        title: "Clock-out Successful!",
        description: `You've been clocked out at ${formatTime(data.clockOutTime)}`,
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Clock-out failed",
        description: error.message || "There was an error processing your clock-out",
        variant: "destructive",
      });
    }
  });

  const handleClockOut = () => {
    clockOutMutation.mutate();
  };

  const handleContactSupervisor = () => {
    if (confirmationData.supervisorContact?.phone) {
      // Format phone number to remove non-digits
      const phoneNumber = confirmationData.supervisorContact.phone.replace(/[^0-9]/g, '');
      // Create WhatsApp deep link
      const whatsappUrl = `https://wa.me/${phoneNumber}`;
      // Open in new window/tab
      window.open(whatsappUrl, '_blank');
    } else {
      toast({
        title: "Contact Information Missing",
        description: "Supervisor phone number is not available.",
        variant: "destructive",
      });
    }
  };

  // Navigation handlers for the new buttons
  const handleViewUpcomingShifts = () => {
    setLocation("/staff/my-schedule");
  };

  const handleViewAttendanceHistory = () => {
    setLocation("/staff/attendance-history");
  };

  return (
    <div className="flex-1 flex flex-col p-4">
      {/* User info card */}
      <Card className="bg-white rounded-2xl shadow-card p-6 mb-6">
        <div className="flex items-center space-x-4">
          <Avatar className="w-16 h-16">
            {confirmationData.staffImage ? (
              <AvatarImage src={confirmationData.staffImage} alt={confirmationData.staffName} />
            ) : null}
            <AvatarFallback className="text-lg">{getInitials(confirmationData.staffName)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{confirmationData.staffName}</h2>
            <p className="text-gray-600">{confirmationData.staffRole}</p>
          </div>
        </div>
      </Card>
      
      {/* Check-in status card */}
      <Card className={`rounded-2xl p-6 mb-6 border ${status === 'clockedOut' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}`}>
        <div className="flex items-center mb-4">
          <div className={`rounded-full h-12 w-12 flex items-center justify-center mr-4 ${status === 'clockedOut' ? 'bg-blue-100' : 'bg-green-100'}`}>
            {status === 'clockedOut' ? (
              <CheckCircle2 className="h-6 w-6 text-blue-500" />
            ) : (
              <Check className="h-6 w-6 text-green-500" />
            )}
          </div>
          <div>
            {status === 'clockedOut' ? (
              <>
                <h3 className="font-bold text-blue-800">Shift Completed</h3>
                <p className="text-blue-700">
                  Clocked out: {clockOutTime ? formatTime(clockOutTime) : ''} • {clockOutTime ? formatDate(clockOutTime) : ''}
                </p>
              </>
            ) : (
              <>
                <h3 className="font-bold text-green-800">Successfully Checked In</h3>
                <p className="text-green-700">
                  {formatTime(confirmationData.checkInTime)} • {formatDate(confirmationData.checkInTime)}
                </p>
              </>
            )}
          </div>
        </div>
        
        <div className={`rounded-xl p-3 text-sm ${status === 'clockedOut' ? 'bg-white text-gray-600' : 'bg-white text-gray-600'}`}>
          <div className="flex items-center mb-2">
            <MapPin className="h-5 w-5 mr-2 text-gray-500" />
            <span>{confirmationData.eventLocation}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-gray-500" />
            <span>{status === 'clockedOut' && shiftDuration 
              ? `Total shift: ${shiftDuration.hours}h ${shiftDuration.minutes}m` 
              : confirmationData.timeStatus}
            </span>
          </div>
        </div>
        
        {/* Dynamic button - only show if checked in but not clocked out */}
        {status === 'checkedIn' && (
          <Button 
            variant="outline" 
            className="w-full mt-4 bg-white border-red-300 text-red-600 hover:bg-red-50"
            onClick={handleClockOut}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4 mr-2" />
                Clock Out
              </>
            )}
          </Button>
        )}
      </Card>
      
      {/* Schedule card */}
      {confirmationData.schedule && (
        <Card className="bg-white rounded-2xl shadow-card p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">Today's Schedule</h3>
          <div className="space-y-4">
            {confirmationData.schedule.items.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
                <div className="text-sm">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-gray-500">{item.timeRange}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      
      {/* Supervisor contact card */}
      {confirmationData.supervisorContact && (
        <Card className="bg-white rounded-2xl shadow-card p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">Supervisor Contact</h3>
          <div className="flex items-center">
            <Avatar className="w-12 h-12 mr-4">
              {confirmationData.supervisorContact.image ? (
                <AvatarImage src={confirmationData.supervisorContact.image} alt="Supervisor" />
              ) : null}
              <AvatarFallback>{getInitials(confirmationData.supervisorContact.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="font-medium">{confirmationData.supervisorContact.name}</h4>
              <p className="text-gray-600 text-sm">{confirmationData.supervisorContact.role}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleContactSupervisor}
                className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center"
                title="WhatsApp"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="none">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </button>
              <a
                href={`tel:${confirmationData.supervisorContact.phone}`}
                className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center"
                title="Call"
              >
                <Phone className="h-5 w-5" />
              </a>
            </div>
          </div>
        </Card>
      )}
      
      {/* Next Steps card - only show after clocking out */}
      {status === 'clockedOut' && (
        <Card className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="font-bold text-gray-800 mb-4">Next Steps</h3>
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={handleViewUpcomingShifts}
            >
              <Calendar className="h-4 w-4 mr-2" />
              View My Upcoming Shifts
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={handleViewAttendanceHistory}
            >
              <History className="h-4 w-4 mr-2" />
              View My Attendance History
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

// Export the Check icon separately
function Check(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}
