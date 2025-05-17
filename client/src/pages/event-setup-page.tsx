import { useAuth } from "@/hooks/use-auth";
import { EventSetup } from "@/components/events/event-setup";

export default function EventSetupPage() {
  const { user } = useAuth();

  return (
    <EventSetup />
  );
}
