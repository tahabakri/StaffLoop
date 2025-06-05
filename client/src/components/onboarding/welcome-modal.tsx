import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, CalendarPlus, Users, ShieldCheck } from "lucide-react";

interface WelcomeModalProps {
  onDismiss: () => void;
}

export function WelcomeModal({ onDismiss }: WelcomeModalProps) {
  // No need for navigation now, just dismissal
  const handleContinue = () => {
    // Simply dismiss the modal
    onDismiss();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", duration: 0.5 }}
      className="w-full max-w-lg mx-auto"
    >
      <Card className="shadow-xl border-primary/10">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold flex items-center gap-2">
                Welcome to StaffLoop! <span className="text-2xl">👋</span>
              </h2>
              <p className="text-gray-600 mt-2 max-w-md">
                Effortless event staffing is here. Manage your crew from setup to reporting with seamless WhatsApp communication and secure check-ins.
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

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Value Highlight 1 */}
            <div className="flex flex-col items-start p-5 rounded-lg bg-primary/5">
              <div className="flex justify-center w-full mb-3">
                <CalendarPlus className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2 w-full text-left">Create Events in Minutes</h3>
              <p className="text-sm text-gray-600 text-left">Quickly set up details, schedules, shifts, and staffing needs.</p>
            </div>

            {/* Value Highlight 2 */}
            <div className="flex flex-col items-start p-5 rounded-lg bg-primary/5">
              <div className="flex justify-center w-full mb-3">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2 w-full text-left">Notify Staff Instantly</h3>
              <p className="text-sm text-gray-600 text-left">Invite your team and send event updates directly via WhatsApp.</p>
            </div>

            {/* Value Highlight 3 */}
            <div className="flex flex-col items-start p-5 rounded-lg bg-primary/5">
              <div className="flex justify-center w-full mb-3">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2 w-full text-left">Track Attendance Reliably</h3>
              <p className="text-sm text-gray-600 text-left">Monitor real-time check-ins with Face ID & GPS verification.</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 flex flex-col sm:flex-row justify-center gap-3"
          >
            <Button onClick={handleContinue} className="px-6">
              Explore Dashboard
            </Button>
            <Button variant="ghost" onClick={onDismiss}>
              Dismiss
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 