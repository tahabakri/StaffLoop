import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ChevronRight, X } from "lucide-react";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  path: string;
  completed?: boolean;
}

const checklistItems: ChecklistItem[] = [
  {
    id: "create-event",
    title: "Create your first event",
    description: "Set up your event details and schedule",
    path: "/events/new",
  },
  {
    id: "add-team",
    title: "Add your staff team",
    description: "Invite and manage your event staff",
    path: "/staff",
  },
  {
    id: "track-shifts",
    title: "Track shifts and attendance",
    description: "Monitor staff check-ins and performance",
    path: "/attendance",
  },
];

interface WelcomeChecklistProps {
  onDismiss: () => void;
}

export function WelcomeChecklist({ onDismiss }: WelcomeChecklistProps) {
  const [, setLocation] = useLocation();
  const [completedItems, setCompletedItems] = useState<string[]>([]);

  const handleItemClick = (item: ChecklistItem) => {
    if (!completedItems.includes(item.id)) {
      setCompletedItems([...completedItems, item.id]);
    }
    setLocation(item.path);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="shadow-xl border-primary/10">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold flex items-center gap-2">
                Welcome to StaffLoop! <span className="text-2xl">👋</span>
              </h2>
              <p className="text-gray-600 mt-1">
                Let's get you started with these quick steps
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={onDismiss}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </Button>
            </motion.div>
          </div>

          <motion.div className="space-y-4">
            <AnimatePresence mode="wait">
              {checklistItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleItemClick(item)}
                    className="w-full p-4 rounded-xl border border-gray-200 hover:border-primary/50 flex items-center gap-4 group transition-colors"
                  >
                    <div className="flex-shrink-0">
                      {completedItems.includes(item.id) ? (
                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                          <Check className="h-5 w-5" />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-full border-2 border-gray-200 group-hover:border-primary/50 flex items-center justify-center text-gray-400">
                          {index + 1}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 text-center"
          >
            <Button variant="ghost" onClick={onDismiss}>
              I'll do this later
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 