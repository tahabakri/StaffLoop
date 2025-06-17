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
      className="w-full max-w-4xl mx-auto"
    >
      <Card className="shadow-xl border-primary/10">
        <CardContent className="p-8">
          <div className="flex items-start justify-between mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-1 pr-4"
            >
              <h2 className="text-3xl font-bold flex items-center gap-2 mb-4">
                Welcome to StaffLoop! <span className="text-3xl">👋</span>
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
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
            className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {/* Value Highlight 1 */}
            <div className="flex flex-col items-start p-6 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex justify-center w-full mb-4">
                <CalendarPlus className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-3 w-full text-center text-lg">Create Events in Minutes</h3>
              <p className="text-gray-600 text-center leading-relaxed">Quickly set up details, schedules, shifts, and staffing needs.</p>
            </div>

            {/* Value Highlight 2 */}
            <div className="flex flex-col items-start p-6 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex justify-center w-full mb-4">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-3 w-full text-center text-lg">Notify Staff Instantly</h3>
              <p className="text-gray-600 text-center leading-relaxed">Invite your team and send event updates directly via WhatsApp.</p>
            </div>

            {/* Value Highlight 3 */}
            <div className="flex flex-col items-start p-6 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex justify-center w-full mb-4">
                <ShieldCheck className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-3 w-full text-center text-lg">Track Attendance Reliably</h3>
              <p className="text-gray-600 text-center leading-relaxed">Monitor real-time check-ins with Face ID & GPS verification.</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
          >
            <Button onClick={handleContinue} className="px-8 py-3 text-lg">
              Explore Dashboard
            </Button>
            <Button variant="ghost" onClick={onDismiss} className="px-8 py-3 text-lg">
              Dismiss
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 