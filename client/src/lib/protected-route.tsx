import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Navigate, Outlet } from "react-router-dom";

type ProtectedRouteProps = {
  requireRole?: "organizer" | "staff";
};

export function ProtectedRoute({ requireRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requireRole && user.role !== requireRole) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-4 text-center">
          You don't have the required permissions to access this page.
        </p>
        <a href="/" className="text-primary hover:underline">
          Go back to home
        </a>
      </div>
    );
  }

  return <Outlet />;
}
