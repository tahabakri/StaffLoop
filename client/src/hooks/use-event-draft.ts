import { useState, useEffect, useCallback } from "react";

// Local storage key for draft
export const EVENT_DRAFT_KEY = "staffLoop_newEventDraft";

// Define debounce function
export function debounce<F extends (...args: any[]) => any>(
  func: F,
  wait: number
): (...args: Parameters<F>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<F>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait);
  };
}

export interface EventDraft<T> {
  eventData: T;
  step: number;
  timestamp: string;
}

export function useEventDraft<T>(initialData: T, isEditMode: boolean = false) {
  const [draftData, setDraftData] = useState<EventDraft<T> | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [showDraftDialog, setShowDraftDialog] = useState(false);

  // Save draft to localStorage
  const saveDraft = useCallback((data: T, step: number) => {
    try {
      const draftObject: EventDraft<T> = {
        eventData: data,
        step: step,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(EVENT_DRAFT_KEY, JSON.stringify(draftObject));
    } catch (error) {
      console.error("Error saving draft to localStorage:", error);
    }
  }, []);

  // Debounced version of saveDraft
  const debouncedSaveDraft = useCallback(
    debounce((data: T, step: number) => {
      saveDraft(data, step);
    }, 500),
    [saveDraft]
  );

  // Load draft from localStorage
  const loadDraft = useCallback(() => {
    try {
      const draftJson = localStorage.getItem(EVENT_DRAFT_KEY);
      if (draftJson) {
        const parsed = JSON.parse(draftJson);
        return {
          eventData: parsed.eventData as T,
          step: parsed.step as number,
          timestamp: parsed.timestamp as string
        };
      }
    } catch (error) {
      console.error("Error loading draft from localStorage:", error);
    }
    return null;
  }, []);

  // Clear draft from localStorage
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(EVENT_DRAFT_KEY);
      setHasDraft(false);
      setDraftData(null);
    } catch (error) {
      console.error("Error clearing draft from localStorage:", error);
    }
  }, []);

  // Check for existing draft on component mount (only in create mode)
  useEffect(() => {
    if (!isEditMode) {
      const loadedDraft = loadDraft();
      if (loadedDraft) {
        setHasDraft(true);
        setDraftData(loadedDraft);
        setShowDraftDialog(true);
      }
    }
  }, [isEditMode, loadDraft]);

  return {
    draftData,
    hasDraft,
    showDraftDialog,
    setShowDraftDialog,
    saveDraft,
    debouncedSaveDraft,
    loadDraft,
    clearDraft
  };
} 