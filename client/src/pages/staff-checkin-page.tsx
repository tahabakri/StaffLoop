import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { getCurrentLocation } from "@/lib/camera-utils";
import { apiRequest } from "@/lib/queryClient";
import { Logo } from "@/components/ui/logo";
import { CameraView } from "@/components/staff/camera-view";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface EventDetails {
  name: string;
  date: string;
  eventId?: number;
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

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/staff-login");
    }
  }, [user, authLoading, setLocation]);

  const checkInMutation = useMutation({
    mutationFn: async (data: {
      staffId: number;
      eventId: number;
      image: string;
      location: { latitude: number; longitude: number };
    }) => {
      try {
        // For demo purposes, simulate a successful API call
        // In a real app, this would be an actual API request
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Return a mock successful response
        return {
          success: true,
          staffId: data.staffId,
          eventId: data.eventId,
          checkInTime: new Date().toISOString(),
          message: "Check-in successful"
        };
      } catch (error) {
        console.error("Error during check-in:", error);
        throw new Error("Failed to check in. Please try again.");
      }
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
          <div className="font-medium">{eventDetails.name}</div>
          <div className="text-gray-500 text-xs">{eventDetails.date}</div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4">
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
      </div>
    </div>
  );
}
