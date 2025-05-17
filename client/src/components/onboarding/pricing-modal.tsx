import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => Promise<void>;
  action: string;
}

const pricingPlans = [
  {
    name: "Basic",
    price: 49,
    features: [
      "Up to 5 staff members",
      "Single-day events",
      "Basic attendance tracking",
      "WhatsApp notifications",
    ],
  },
  {
    name: "Professional",
    price: 99,
    features: [
      "Up to 20 staff members",
      "Multi-day events",
      "Advanced analytics",
      "Priority support",
      "WhatsApp notifications",
    ],
  },
];

export function PricingModal({ isOpen, onClose, onUpgrade, action }: PricingModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"Basic" | "Professional">("Basic");

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      await onUpgrade();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DialogHeader>
            <DialogTitle>Upgrade to Publish Your Event</DialogTitle>
            <DialogDescription>
              {action} requires activating your plan. You only pay for what you use.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <AnimatePresence mode="wait">
              {pricingPlans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedPlan === plan.name
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedPlan(plan.name as "Basic" | "Professional")}
                >
                  <motion.div
                    animate={{
                      scale: selectedPlan === plan.name ? 1.05 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <h3 className="text-xl font-semibold">{plan.name}</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-gray-600">/event</span>
                    </div>
                    <ul className="mt-4 space-y-2">
                      {plan.features.map((feature, featureIndex) => (
                        <motion.li
                          key={feature}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + featureIndex * 0.1 }}
                          className="flex items-center text-sm"
                        >
                          <motion.div
                            whileHover={{ scale: 1.2 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                            <Check className="h-4 w-4 text-primary mr-2" />
                          </motion.div>
                          {feature}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 flex justify-end space-x-4"
          >
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleUpgrade}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="mr-2 h-4 w-4" />
                </motion.div>
              ) : null}
              {isLoading ? "Processing..." : `Upgrade to ${selectedPlan}`}
            </Button>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
} 