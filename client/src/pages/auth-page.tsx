import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { AuthForm } from "@/components/auth/auth-form";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && user) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  const handleStaffLoginClick = () => {
    setLocation("/staff-login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Auth Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
        <AuthForm onStaffLoginClick={handleStaffLoginClick} />
      </div>

      {/* Hero Side */}
      <div className="hidden lg:block lg:w-1/2 bg-primary/5">
        <div className="h-full flex flex-col items-center justify-center p-8">
          <div className="max-w-md">
            <h1 className="text-4xl font-bold text-primary mb-6">
              Streamline Event Staff Management
            </h1>
            <p className="text-gray-600 text-lg mb-6">
              StaffSnap helps event organizers effortlessly track staff attendance using facial recognition technology.
            </p>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="rounded-full bg-primary/10 p-2 mr-3 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Seamless Check-ins</h3>
                  <p className="text-gray-600">Staff can quickly check in with a selfie, verified by facial recognition.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="rounded-full bg-primary/10 p-2 mr-3 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Real-time Analytics</h3>
                  <p className="text-gray-600">Monitor attendance stats and staff status in real-time from your dashboard.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="rounded-full bg-primary/10 p-2 mr-3 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Comprehensive Reports</h3>
                  <p className="text-gray-600">Generate detailed attendance reports for post-event analysis and billing.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
