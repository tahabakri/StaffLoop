import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { SupervisorTeamDashboard } from "@/components/supervisor/SupervisorTeamDashboard";

interface SupervisorContext {
  eventId: number;
  teamId: number;
  supervisorId: number;
  eventName: string;
  supervisorName: string;
}

export default function SupervisorAccessPage() {
  const [location, setLocation] = useLocation();
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supervisorContext, setSupervisorContext] = useState<SupervisorContext | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      try {
        setIsValidating(true);
        setError(null);

        // Extract token from URL query parameters
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (!token) {
          setError("No access token provided. Please use the link sent to you by the event organizer.");
          setIsValidating(false);
          return;
        }

        // Validate token with backend
        // In a real app, this would be a fetch call to the backend
        // const response = await fetch("/api/auth/supervisor/validate-token", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({ accessToken: token })
        // });
        
        // if (!response.ok) {
        //   const errorData = await response.json();
        //   throw new Error(errorData.message || "Invalid or expired access token");
        // }
        
        // const data = await response.json();
        
        // Mock successful validation for development
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
        
        // Mock data
        const mockData = {
          success: true,
          eventId: 1,
          teamId: 2,
          supervisorId: 3,
          eventName: "Tech Conference 2025",
          supervisorName: "Jane Smith"
        };
        
        setSupervisorContext(mockData);
        
        // Update URL to remove token (for security)
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      } catch (error) {
        console.error("Token validation error:", error);
        setError(error instanceof Error ? error.message : "Failed to validate access token");
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, []);

  if (isValidating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Spinner className="h-12 w-12 mb-4" />
        <p className="text-gray-600">Validating your access token...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="text-center">
            <p className="mb-4 text-gray-600">
              If you believe this is an error, please contact the event organizer for assistance.
            </p>
            <Button onClick={() => setLocation("/")}>Return to Home</Button>
          </div>
        </div>
      </div>
    );
  }

  if (supervisorContext) {
    return <SupervisorTeamDashboard context={supervisorContext} />;
  }

  return null;
} 