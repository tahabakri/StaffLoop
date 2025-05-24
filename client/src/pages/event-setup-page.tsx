import { useAuth } from "@/hooks/use-auth";
import { EventSetup } from "@/components/events/event-setup";
import { useParams } from "react-router-dom";

export default function EventSetupPage() {
  const { user } = useAuth();
  const { eventId } = useParams();
  const isEditMode = !!eventId;

  return (
    <EventSetup eventId={eventId} isEditMode={isEditMode} />
  );
}
