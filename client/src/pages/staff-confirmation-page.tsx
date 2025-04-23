import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Logo } from "@/components/ui/logo";
import { CheckInConfirmation } from "@/components/staff/check-in-confirmation";

export default function StaffConfirmationPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  const [eventDetails, setEventDetails] = useState({
    name: "Dubai Design Week",
    date: "Nov 12, 2023 • 07:30 AM",
  });

  // Confirmation data that would normally come from the API
  const [confirmationData, setConfirmationData] = useState({
    staffId: 0,
    eventId: 1,
    checkInTime: new Date().toISOString(),
    staffName: "",
    staffRole: "Event Assistant",
    staffImage: "",
    eventName: "Dubai Design Week",
    eventLocation: "Dubai Exhibition Centre, Hall 2A",
    timeStatus: "Early by 2 minutes",
    supervisorContact: {
      name: "Fatima Al Marzooqi",
      role: "Event Manager",
      phone: "+971501234567",
    },
    schedule: {
      items: [
        { title: "Morning Briefing", timeRange: "07:30 AM - 08:00 AM" },
        { title: "Guest Registration", timeRange: "08:00 AM - 10:00 AM" },
        { title: "Break", timeRange: "10:00 AM - 10:30 AM" },
      ],
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/staff-login");
      return;
    }

    if (user) {
      // Update confirmation data with user info
      setConfirmationData(prev => ({
        ...prev,
        staffId: user.id,
        staffName: user.name,
        staffImage: user.profileImage || "",
      }));
    }
  }, [user, authLoading, setLocation]);

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
      <CheckInConfirmation confirmationData={confirmationData} />
    </div>
  );
}
