import { useState } from "react";
import { motion } from "framer-motion";
import { WelcomeChecklist } from "@/components/onboarding/welcome-checklist";
import { RouteContent } from "@/components/layout/route-content";

export function DashboardPage() {
  const [showChecklist, setShowChecklist] = useState(true);

  return (
    <div className="relative">
      {showChecklist && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <WelcomeChecklist onDismiss={() => setShowChecklist(false)} />
        </div>
      )}
      
      {!showChecklist && <RouteContent showChecklist={showChecklist} onDismissChecklist={() => setShowChecklist(false)} />}
    </div>
  );
} 