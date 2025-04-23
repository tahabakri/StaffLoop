import { useAuth } from "@/hooks/use-auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { EventSetup } from "@/components/events/event-setup";

export default function EventSetupPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout title="Event Management">
      <EventSetup />
    </DashboardLayout>
  );
}
