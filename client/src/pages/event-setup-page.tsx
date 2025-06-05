import { useAuth } from "@/hooks/use-auth";
import { EventSetup } from "@/components/events/event-setup";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export default function EventSetupPage() {
  const { user } = useAuth();
  const { eventId } = useParams<{ eventId: string }>();
  const isEditMode = !!eventId;
  const navigate = useNavigate();
  
  // If in edit mode, check if the event exists
  const { data: eventData, isLoading, error } = useQuery({
    queryKey: [`/api/events/${eventId}`],
    enabled: !!eventId,
    // This would normally fetch from the API, but we're using mock data for now
    // In a real app, we would check if the event exists and if it's a draft
  });
  
  // If we're trying to edit an event that doesn't exist, redirect to the events list
  useEffect(() => {
    if (isEditMode && error) {
      navigate('/events');
    }
  }, [isEditMode, error, navigate]);

  return (
    <EventSetup eventId={eventId} isEditMode={isEditMode} />
  );
}
