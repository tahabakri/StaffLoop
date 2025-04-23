import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { getCurrentLocation } from "@/lib/camera-utils";
import { apiRequest } from "@/lib/queryClient";
import { Logo } from "@/components/ui/logo";
import { CameraView } from "@/components/staff/camera-view";
import { useToast } from "@/hooks/use-toast";

export default function StaffCheckinPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [eventDetails, setEventDetails] = useState({
    name: "Dubai Design Week",
    date: "Nov 12, 2023 • 07:30 AM",
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
      const res = await apiRequest("POST", "/api/checkin", data);
      return await res.json();
    },
    onSuccess: () => {
      setLocation("/staff-confirmation");
    },
    onError: (error) => {
      toast({
        title: "Check-in failed",
        description: error.message,
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
      locationData = { latitude: 25.2048, longitude: 55.2708 }; // Default Dubai coordinates
    }

    // In a real app, we'd fetch the correct eventId for the staff member
    const eventId = 1;

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
        
        <CameraView onCapture={handleCapture} />
      </div>
    </div>
  );
}
