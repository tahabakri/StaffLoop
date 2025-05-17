import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

export function EventsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [hasEvents, setHasEvents] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Events Calendar</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border p-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md"
            />
          </div>
        </div>

        <div className="lg:col-span-1">
          {!hasEvents && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border p-6 text-center"
            >
              <CalendarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No events created yet</h3>
              <p className="text-gray-600 mb-4">
                Click the button below to add your first event
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
} 