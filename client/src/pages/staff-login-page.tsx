import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { StaffAuthForm } from "@/components/auth/staff-auth-form";

export default function StaffLoginPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && user && user.role === "staff") {
      setLocation("/staff-checkin");
    }
  }, [user, isLoading, setLocation]);

  const handleOrganizerLoginClick = () => {
    setLocation("/auth");
  };

  const handleSuccessfulLogin = () => {
    setLocation("/staff-checkin");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <StaffAuthForm 
        onOrganizerLoginClick={handleOrganizerLoginClick} 
        onSuccessfulLogin={handleSuccessfulLogin}
      />
    </div>
  );
}
