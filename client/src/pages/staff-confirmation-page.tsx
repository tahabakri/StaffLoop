import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Logo } from "@/components/ui/logo";
import { CheckInConfirmation } from "@/components/staff/check-in-confirmation";
import { Button } from "@/components/ui/button";

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

type StaffStatus = 'notCheckedIn' | 'checkedIn' | 'clockedOut';

export default function StaffConfirmationPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  const [eventDetails, setEventDetails] = useState({
    name: "Dubai Design Week",
    date: "Nov 12, 2023 • 07:30 AM",
  });

  // Track the staff's current status for the event
  const [staffStatus, setStaffStatus] = useState<StaffStatus>('checkedIn');

  // Default confirmation data (fallback)
  const defaultConfirmationData = {
    staffId: 0,
    eventId: 1,
    checkInTime: new Date().toISOString(),
    staffName: "",
    staffRole: "Event Assistant",
    staffImage: "",
    eventName: "Dubai Design Week",
    eventLocation: "Dubai Exhibition Centre, Hall 2A",
    timeStatus: "On time",
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
  };

  // Confirmation data that will be populated from sessionStorage or user data
  const [confirmationData, setConfirmationData] = useState<ConfirmationData>(defaultConfirmationData);

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/staff-login");
      return;
    }

    // Try to get check-in data from sessionStorage
    try {
      const storedData = sessionStorage.getItem('checkInData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        
        // Determine staff status based on data
        if (parsedData.clockOutTime) {
          setStaffStatus('clockedOut');
        } else {
          setStaffStatus('checkedIn');
        }
        
        // Merge stored data with default data for any missing fields
        setConfirmationData({
          ...defaultConfirmationData,
          ...parsedData,
          // Ensure schedule data is available even if not in stored data
          schedule: parsedData.schedule || defaultConfirmationData.schedule,
          supervisorContact: parsedData.supervisorContact || defaultConfirmationData.supervisorContact
        });
        
        // Update event details if available
        if (parsedData.eventName) {
          setEventDetails(prev => ({
            ...prev,
            name: parsedData.eventName
          }));
        }
      } else if (user) {
        // If no stored data but user is available, update with user info
        setConfirmationData(prev => ({
          ...prev,
          staffId: user.id,
          staffName: user.name,
          staffRole: user.role || prev.staffRole,
          staffImage: user.profileImage || "",
        }));
      }
    } catch (error) {
      console.error("Error retrieving check-in data:", error);
      // Fall back to user data if available
      if (user) {
        setConfirmationData(prev => ({
          ...prev,
          staffId: user.id,
          staffName: user.name,
          staffRole: user.role || prev.staffRole,
          staffImage: user.profileImage || "",
        }));
      }
    }
  }, [user, authLoading, setLocation]);

  // Handle status change from check-in confirmation component
  const handleStatusChange = (newStatus: 'checkedIn' | 'clockedOut') => {
    setStaffStatus(newStatus);
  };

  const handleBackToDashboard = () => {
    setLocation("/dashboard");
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
      <CheckInConfirmation 
        confirmationData={confirmationData} 
        onStatusChange={handleStatusChange}
      />
      
      {/* Return to Dashboard Button removed for staff users */}
    </div>
  );
}
