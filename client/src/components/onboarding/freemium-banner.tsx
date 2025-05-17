import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface FreemiumBannerProps {
  onUpgradeClick: () => void;
}

export function FreemiumBanner({ onUpgradeClick }: FreemiumBannerProps) {
  return (
    <div className="w-full bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <p className="text-sm text-gray-700">
            You're in Explore Mode — Publish an event to activate full features
          </p>
        </div>
        <Button
          variant="default"
          size="sm"
          onClick={onUpgradeClick}
          className="bg-primary hover:bg-primary/90"
        >
          Upgrade Now
        </Button>
      </div>
    </div>
  );
} 