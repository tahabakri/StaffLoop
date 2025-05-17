import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar, Users, BarChart2, Plus, ArrowRight, Info } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

interface RouteContentProps {
  showChecklist: boolean;
  onDismissChecklist: () => void;
}

interface EmptyState {
  icon: React.ElementType;
  title: string;
  description: string;
  action: string;
  actionPath: string;
  tips?: string[];
  secondaryAction?: {
    label: string;
    path: string;
  };
}

export function RouteContent({ showChecklist, onDismissChecklist }: RouteContentProps) {
  const [location] = useLocation();
  const [hoveredTip, setHoveredTip] = useState<number | null>(null);

  // Empty state content for each route
  const emptyStates: Record<string, EmptyState> = {
    "/dashboard": {
      icon: Calendar,
      title: "Welcome to Your Dashboard",
      description: "Create your first event to start managing staff and tracking attendance",
      action: "+ Create New Event",
      actionPath: "/events/new",
      tips: [
        "Add staff members to your event",
        "Track attendance in real-time",
        "Generate reports after the event",
      ],
      secondaryAction: {
        label: "View Tutorial",
        path: "/help/tutorial",
      },
    },
    "/staff": {
      icon: Users,
      title: "Manage Your Event Staff",
      description: "Select an event to view and manage staff members",
      action: "View Events",
      actionPath: "/events",
      tips: [
        "Invite staff via WhatsApp",
        "Assign roles and shifts",
        "Track attendance and performance",
      ],
      secondaryAction: {
        label: "Import Staff List",
        path: "/staff/import",
      },
    },
    "/events": {
      icon: Calendar,
      title: "Create Your First Event",
      description: "Set up your event details and start managing staff",
      action: "+ Create New Event",
      actionPath: "/events/new",
      tips: [
        "Add event location and timing",
        "Define staff requirements",
        "Set up check-in points",
      ],
      secondaryAction: {
        label: "View Event Templates",
        path: "/events/templates",
      },
    },
    "/reports": {
      icon: BarChart2,
      title: "Event Reports & Analytics",
      description: "Generate detailed reports after your event",
      action: "Create Event",
      actionPath: "/events/new",
      tips: [
        "View attendance statistics",
        "Track staff performance",
        "Export data for payroll",
      ],
      secondaryAction: {
        label: "View Sample Reports",
        path: "/reports/samples",
      },
    },
  };

  const currentState = emptyStates[location as keyof typeof emptyStates] || emptyStates["/dashboard"];
  const [, setLocation] = useLocation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12 px-4"
    >
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <currentState.icon className="h-20 w-20 mx-auto text-primary/60 mb-4" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
        >
          {currentState.title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 text-lg mb-8 max-w-lg mx-auto"
        >
          {currentState.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <Button
            size="lg"
            onClick={() => setLocation(currentState.actionPath)}
            className="group"
          >
            {currentState.action}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
          {currentState.secondaryAction && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => setLocation(currentState.secondaryAction!.path)}
            >
              {currentState.secondaryAction.label}
            </Button>
          )}
        </motion.div>

        {currentState.tips && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-50 rounded-xl p-6 border border-gray-100"
          >
            <h3 className="text-sm font-medium text-gray-500 mb-4 flex items-center justify-center gap-2">
              <Info className="h-4 w-4" />
              Quick Tips
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {currentState.tips.map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  onHoverStart={() => setHoveredTip(index)}
                  onHoverEnd={() => setHoveredTip(null)}
                  className="relative group"
                >
                  <div
                    className={`p-4 rounded-lg border transition-all duration-200 ${
                      hoveredTip === index
                        ? "border-primary/20 bg-primary/5"
                        : "border-gray-200 hover:border-primary/10"
                    }`}
                  >
                    <p className="text-sm text-gray-600">{tip}</p>
                  </div>
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-primary/5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredTip === index ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
} 