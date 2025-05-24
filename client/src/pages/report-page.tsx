import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ReportGenerator } from "@/components/reports/report-generator";
import { Event } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Download, FileText, BarChart2 } from "lucide-react";
import { 
  LineChart, 
  Line, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// Mock check-in trend data
const checkInTrends = [
  { day: 'Mon', checkIns: 15, late: 2 },
  { day: 'Tue', checkIns: 22, late: 4 },
  { day: 'Wed', checkIns: 18, late: 1 },
  { day: 'Thu', checkIns: 25, late: 3 },
  { day: 'Fri', checkIns: 30, late: 2 },
  { day: 'Sat', checkIns: 10, late: 0 },
  { day: 'Sun', checkIns: 5, late: 1 },
];

export default function ReportPage() {
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [reportType, setReportType] = useState<string>("attendance");
  const [date, setDate] = useState<Date>();

  // Fetch events
  const { data: events = [], isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  // Handle export
  const handleExport = (format: string) => {
    toast({
      title: "Report Exported",
      description: `Report has been exported as ${format.toUpperCase()}.`,
    });
  };

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reports</h1>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/3">
              <label className="text-sm font-medium mb-2 block">Select Event</label>
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent>
                  {eventsLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading events...
                    </SelectItem>
                  ) : events && events.length > 0 ? (
                    events.map((event) => (
                      <SelectItem key={event.id} value={event.id.toString()}>
                        {event.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No events available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-1/3">
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attendance">Attendance Report</SelectItem>
                  <SelectItem value="performance">Performance Report</SelectItem>
                  <SelectItem value="financial">Financial Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-1/3">
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <Tabs defaultValue="charts">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="charts">
              <BarChart2 className="h-4 w-4 mr-2" />
              Charts
            </TabsTrigger>
            <TabsTrigger value="data">
              <FileText className="h-4 w-4 mr-2" />
              Data Tables
            </TabsTrigger>
            <TabsTrigger value="export">
              <Download className="h-4 w-4 mr-2" />
              Export
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="charts">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Check-in Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={checkInTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="checkIns" 
                        name="Check-ins" 
                        stroke="#3B82F6" 
                        strokeWidth={2} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="late" 
                        name="Late" 
                        stroke="#EF4444" 
                        strokeWidth={2} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="data">
            <ReportGenerator
              events={events}
              selectedEvent={selectedEvent}
              onEventChange={setSelectedEvent}
            />
          </TabsContent>
          
          <TabsContent value="export">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Export Report</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-6">
                  Choose a format to export your report data.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Button 
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                    onClick={() => handleExport('pdf')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export as PDF
                  </Button>
                  <Button 
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                    onClick={() => handleExport('csv')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export as CSV
                  </Button>
                  <Button 
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                    onClick={() => handleExport('excel')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export as Excel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
