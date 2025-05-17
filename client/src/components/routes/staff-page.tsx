import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Calendar } from "lucide-react";

export function StaffPage() {
  const [selectedEvent, setSelectedEvent] = useState<string>("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select an event" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="event1">Event 1</SelectItem>
              <SelectItem value="event2">Event 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button>
          <Users className="mr-2 h-4 w-4" />
          Add Staff
        </Button>
      </div>

      {!selectedEvent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="max-w-md mx-auto">
            <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Select an Event</h2>
            <p className="text-gray-600 mb-6">
              Choose an event to view and manage staff assignments
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
} 