import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { WelcomeModal } from "@/components/onboarding/welcome-modal";
import { RouteContent } from "@/components/layout/route-content";

// localStorage key for tracking if the welcome modal has been dismissed
const WELCOME_MODAL_DISMISSED_KEY = 'staffLoop_welcomeModalDismissed_v1';

export function DashboardPage() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  
  // Check localStorage on component mount to determine if modal should be shown
  useEffect(() => {
    const welcomeModalDismissed = localStorage.getItem(WELCOME_MODAL_DISMISSED_KEY);
    if (!welcomeModalDismissed) {
      setShowWelcomeModal(true);
    }
  }, []);
  
  // Handle dismissal of the welcome modal
  const handleDismissWelcomeModal = () => {
    // Mark as dismissed in localStorage
    localStorage.setItem(WELCOME_MODAL_DISMISSED_KEY, 'true');
    setShowWelcomeModal(false);
  };

  return (
    <div className="relative">
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <WelcomeModal onDismiss={handleDismissWelcomeModal} />
        </div>
      )}
      
      <RouteContent showChecklist={showWelcomeModal} onDismissChecklist={handleDismissWelcomeModal} />
    </div>
  );
} 