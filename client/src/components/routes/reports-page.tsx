import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart2, Download, FileText, Table } from "lucide-react";

export function ReportsPage() {
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel">("pdf");

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
        <div className="flex items-center gap-2">
          <Select value={exportFormat} onValueChange={(value: "pdf" | "excel") => setExportFormat(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Export as" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">
                <div className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  PDF
                </div>
              </SelectItem>
              <SelectItem value="excel">
                <div className="flex items-center">
                  <Table className="mr-2 h-4 w-4" />
                  Excel
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {!selectedEvent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="max-w-md mx-auto">
            <BarChart2 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Reports Available</h2>
            <p className="text-gray-600 mb-6">
              Run an event to generate reports and analytics
            </p>
            <Button>
              <BarChart2 className="mr-2 h-4 w-4" />
              View Sample Reports
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
} 