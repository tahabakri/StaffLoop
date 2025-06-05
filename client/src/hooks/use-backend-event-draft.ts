import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { EventData } from "@/types/events";

/**
 * Custom hook for managing event drafts on the backend
 */
export function useBackendEventDraft() {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  /**
   * Save event data as a draft on the backend
   */
  const saveAsDraft = useCallback(async (eventData: EventData, eventId?: string | number) => {
    setIsSaving(true);
    try {
      // In a real app, this would be an API call
      // If eventId is provided, update existing draft, otherwise create new draft
      const url = eventId ? `/api/events/${eventId}` : '/api/events';
      const method = eventId ? 'PUT' : 'POST';
      
      // Mock API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Invalidate events query to refresh the list
      await queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      
      toast({
        title: "Draft saved",
        description: "Your event draft has been saved successfully.",
      });
      
      // Return a mock response with an ID
      // In a real app, this would be the response from the API
      return {
        success: true,
        eventId: eventId || Math.floor(Math.random() * 1000) + 100,
      };
    } catch (error) {
      console.error("Error saving draft:", error);
      toast({
        title: "Error",
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setIsSaving(false);
    }
  }, [toast, queryClient]);

  /**
   * Delete a draft event from the backend
   */
  const deleteDraft = useCallback(async (eventId: string | number) => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
      
      // Mock API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Invalidate events query to refresh the list
      await queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      
      toast({
        title: "Draft deleted",
        description: "Your event draft has been deleted successfully.",
      });
      
      return { success: true };
    } catch (error) {
      console.error("Error deleting draft:", error);
      toast({
        title: "Error",
        description: "Failed to delete draft. Please try again.",
        variant: "destructive",
      });
      return { success: false };
    }
  }, [toast, queryClient]);

  return {
    isSaving,
    saveAsDraft,
    deleteDraft,
  };
} 