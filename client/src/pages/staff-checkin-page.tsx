import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { getCurrentLocation } from "@/lib/camera-utils";
import { apiRequest } from "@/lib/queryClient";
import { Logo } from "@/components/ui/logo";
import { CameraView } from "@/components/staff/camera-view";
import { OtpVerification } from "@/components/staff/OtpVerification";
import { FacialEnrollment } from "@/components/staff/FacialEnrollment";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { checkIn, CheckInRequest } from "@/lib/api/attendance";

interface EventDetails {
  name: string;
  date: string;
  eventId?: number;
}

interface StaffStatus {
  isOtpVerifiedForInitialEnrollment: boolean;
  isFacialEnrolled: boolean;
}

export default function StaffCheckinPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [eventDetails, setEventDetails] = useState<EventDetails>({
    name: "Dubai Design Week",
    date: "Nov 12, 2023 • 07:30 AM",
    eventId: 1, // Default event ID
  });
  
  const [currentView, setCurrentView] = useState<"loading" | "otp" | "facial" | "checkin">("loading");

  // Fetch staff enrollment status
  const { data: staffStatus, isLoading: statusLoading } = useQuery<StaffStatus>({
    queryKey: ["/api/staff", user?.id, "status"],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");
      const response = await apiRequest("GET", `/api/staff/${user.id}/status`);
      return response.json();
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/staff-login");
      return;
    }

    // Check if user has already checked in for this event
    try {
      const storedData = sessionStorage.getItem('checkInData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        const storedEventId = parsedData.eventId;
        
        // If the stored event is the same as the current one and the user has checked in
        if (storedEventId === (eventDetails.eventId || 1) && parsedData.checkInTime) {
          // Redirect to confirmation page
          setLocation("/staff-confirmation");
        }
      }
    } catch (error) {
      console.error("Error checking stored check-in data:", error);
    }
  }, [user, authLoading, setLocation, eventDetails.eventId]);

  // Determine which view to show based on enrollment status
  useEffect(() => {
    if (!statusLoading && staffStatus) {
      if (staffStatus.isFacialEnrolled) {
        // Face is already enrolled - show normal check-in
        setCurrentView("checkin");
      } else if (staffStatus.isOtpVerifiedForInitialEnrollment) {
        // OTP is verified but face is not enrolled
        setCurrentView("facial");
      } else {
        // Neither OTP nor face is enrolled
        setCurrentView("otp");
      }
    }
  }, [statusLoading, staffStatus]);

  const checkInMutation = useMutation({
    mutationFn: async (data: CheckInRequest) => {
      // Use the API function for check-in
      return await checkIn(data);
    },
    onSuccess: (data) => {
      toast({
        title: "Check-in Successful!",
        description: `You've been checked in at ${new Date().toLocaleTimeString()}`,
        variant: "default",
      });
      
      // Store check-in data in sessionStorage to use in confirmation page
      sessionStorage.setItem('checkInData', JSON.stringify({
        staffId: user?.id,
        staffName: user?.name,
        staffRole: user?.role,
        staffImage: user?.profileImage,
        eventId: eventDetails.eventId || 1,
        eventName: eventDetails.name,
        eventLocation: "Dubai Design District, Building 7",
        checkInTime: data.checkInTime,
        timeStatus: "On time"
      }));
      
      // Navigate to confirmation page
      setLocation("/staff-confirmation");
    },
    onError: (error: Error) => {
      toast({
        title: "Check-in failed",
        description: error.message || "There was an error processing your check-in",
        variant: "destructive",
      });
    },
  });

  const handleCapture = async (imageData: string) => {
    if (!user) {
      toast({
        title: "Authentication error",
        description: "You need to be logged in to check in",
        variant: "destructive",
      });
      return;
    }

    let locationData;
    try {
      locationData = await getCurrentLocation();
    } catch (error) {
      console.warn("Failed to get location, using default:", error);
      locationData = { latitude: 25.2048, longitude: 55.2708 }; // Default Dubai coordinates
      toast({
        title: "Location services unavailable",
        description: "Using default location for check-in",
        variant: "default",
      });
    }

    // Use the eventId from eventDetails or default to 1
    const eventId = eventDetails.eventId || 1;

    checkInMutation.mutate({
      staffId: user.id,
      eventId,
      image: imageData,
      location: locationData || { latitude: 25.2048, longitude: 55.2708 },
    });
  };

  const handleOtpSuccess = () => {
    setCurrentView("facial");
  };

  const handleFacialEnrollmentSuccess = () => {
    setCurrentView("checkin");
  };

  if (authLoading || statusLoading || currentView === "loading") {
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
          <div className="font-medium">{eventDetails.name}</div>
          <div className="text-gray-500 text-xs">{eventDetails.date}</div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4">
        {currentView === "otp" && user && (
          <OtpVerification 
            staffId={user.id} 
            phone={user.phone || ""} 
            onVerificationSuccess={handleOtpSuccess} 
          />
        )}
        
        {currentView === "facial" && user && (
          <FacialEnrollment 
            staffId={user.id} 
            onEnrollmentSuccess={handleFacialEnrollmentSuccess} 
          />
        )}
        
        {currentView === "checkin" && (
          <>
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-gray-800">Check In</h1>
              <p className="text-gray-600">Take a selfie to mark your attendance</p>
            </div>
            
            {checkInMutation.isPending ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-lg font-medium text-gray-800">Processing your check-in...</p>
                  <p className="text-gray-500">Please wait a moment</p>
                </div>
              </div>
            ) : (
              <CameraView onCapture={handleCapture} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
