import { Routes, Route, Navigate } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import StaffLoginPage from "@/pages/staff-login-page";
import StaffCheckinPage from "@/pages/staff-checkin-page";
import StaffConfirmationPage from "@/pages/staff-confirmation-page";
import DashboardPage from "@/pages/dashboard-page";
import StaffListPage from "@/pages/staff-list-page";
import EventSetupPage from "@/pages/event-setup-page";
import ReportPage from "@/pages/report-page";
import SettingsPage from "@/pages/settings-page";
import PaymentsPage from "@/pages/payments-page";
import HelpPage from "@/pages/help-page";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/staff-login" element={<StaffLoginPage />} />
            <Route path="/staff-checkin" element={<StaffCheckinPage />} />
            <Route path="/staff-confirmation" element={<StaffConfirmationPage />} />

            {/* Redirect root to /dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route element={<ProtectedRoute requireRole="organizer" />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/staff" element={<StaffListPage />} />
                <Route path="/events" element={<EventSetupPage />} />
                <Route path="/reports" element={<ReportPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/help" element={<HelpPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
