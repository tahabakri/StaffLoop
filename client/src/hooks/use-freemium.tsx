import { useState } from "react";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";

export type FreemiumAction = 
  | "publish_event"
  | "add_staff"
  | "multi_day"
  | "view_analytics";

interface UseFreemiumReturn {
  isFreemium: boolean;
  showPricingModal: boolean;
  currentAction: FreemiumAction | null;
  triggerPricing: (action: FreemiumAction) => void;
  closePricingModal: () => void;
  handleUpgrade: () => Promise<void>;
}

export function useFreemium(): UseFreemiumReturn {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [currentAction, setCurrentAction] = useState<FreemiumAction | null>(null);

  // Check if user is in freemium mode
  const isFreemium = !user?.stripeCustomerId;

  const triggerPricing = (action: FreemiumAction) => {
    if (!isFreemium) return;
    
    setCurrentAction(action);
    setShowPricingModal(true);
  };

  const closePricingModal = () => {
    setShowPricingModal(false);
    setCurrentAction(null);
  };

  const handleUpgrade = async () => {
    try {
      // Here you would integrate with your payment provider (e.g., Stripe)
      // and handle the upgrade process
      const response = await fetch("/api/billing/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: currentAction,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Upgrade failed:", error);
      toast({
        title: "Upgrade failed",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  return {
    isFreemium,
    showPricingModal,
    currentAction,
    triggerPricing,
    closePricingModal,
    handleUpgrade,
  };
} 