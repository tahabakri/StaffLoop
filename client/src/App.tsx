import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
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

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/staff-login" component={StaffLoginPage} />
      <Route path="/staff-checkin" component={StaffCheckinPage} />
      <Route path="/staff-confirmation" component={StaffConfirmationPage} />
      
      <ProtectedRoute path="/" component={DashboardPage} requireRole="organizer" />
      <ProtectedRoute path="/staff" component={StaffListPage} requireRole="organizer" />
      <ProtectedRoute path="/events" component={EventSetupPage} requireRole="organizer" />
      <ProtectedRoute path="/reports" component={ReportPage} requireRole="organizer" />
      <ProtectedRoute path="/settings" component={SettingsPage} requireRole="organizer" />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
