import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, FileText, ChevronRight, User, CheckCircle, Clock, XCircle, FileDown, FileSpreadsheet } from 'lucide-react';
import { formatDate, getInitials } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { Event } from "@/types/dashboard";

interface ReportGeneratorProps {
  className?: string;
  events: Event[];
  selectedEvent: string;
  onEventChange: (eventId: string) => void;
}

// Mock data for preview and past reports
const mockStaffData = [
  { name: "John Doe", role: "Organizer", status: "Checked In", time: "09:00 AM" },
  { name: "Jane Smith", role: "Staff", status: "Late", time: "09:20 AM" },
  { name: "Bob Lee", role: "Staff", status: "Absent", time: "-" },
];

const mockPastReports = [
  { name: "Art Exhibition Report", date: "15 May 2024", type: "PDF" },
  { name: "Music Festival Report", date: "10 May 2024", type: "Excel" },
  { name: "Sports Event Report", date: "05 May 2024", type: "PDF" },
];

export function ReportGenerator({ className, events, selectedEvent, onEventChange }: ReportGeneratorProps) {
  const [includeFaces, setIncludeFaces] = useState(true);
  const [reportType, setReportType] = useState<string>('summary');
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const selectedEventData = events.find(e => e.id.toString() === selectedEvent);
      if (!selectedEventData) return;

      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text("Event Report", 20, 20);
      
      // Add event details
      doc.setFontSize(12);
      doc.text(`Event: ${selectedEventData.name}`, 20, 40);
      doc.text(`Date: ${formatDate(selectedEventData.date)}`, 20, 50);
      doc.text(`Location: ${selectedEventData.location}`, 20, 60);
      
      // Add attendance summary
      doc.text("Attendance Summary", 20, 80);
      doc.text(`Total Staff: ${selectedEventData.totalStaff}`, 20, 90);
      doc.text(`Checked In: ${selectedEventData.checkedInStaff}`, 20, 100);
      doc.text(`Attendance Rate: ${Math.round((selectedEventData.checkedInStaff / selectedEventData.totalStaff) * 100)}%`, 20, 110);

      // Save the PDF
      doc.save(`${selectedEventData.name}-report.pdf`);
      
      toast({
        title: "Report Downloaded",
        description: "Your report has been downloaded as PDF.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF report.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateExcel = async () => {
    setIsGenerating(true);
    try {
      const selectedEventData = events.find(e => e.id.toString() === selectedEvent);
      if (!selectedEventData) return;

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet([
        {
          "Event Name": selectedEventData.name,
          "Date": formatDate(selectedEventData.date),
          "Location": selectedEventData.location,
          "Total Staff": selectedEventData.totalStaff,
          "Checked In": selectedEventData.checkedInStaff,
          "Attendance Rate": `${Math.round((selectedEventData.checkedInStaff / selectedEventData.totalStaff) * 100)}%`,
        }
      ]);

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Event Report");

      // Save the Excel file
      XLSX.writeFile(wb, `${selectedEventData.name}-report.xlsx`);

      toast({
        title: "Report Downloaded",
        description: "Your report has been downloaded as Excel.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate Excel report.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPastReport = (report: typeof mockPastReports[0]) => {
    toast({
      title: "Downloading Report",
      description: `Downloading ${report.name}...`,
    });
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Attendance Report Generator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Select Event</Label>
                  <Select value={selectedEvent} onValueChange={onEventChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an event" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map((event: Event) => (
                        <SelectItem key={event.id} value={event.id.toString()}>
                          {event.name} - {formatDate(event.date)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Report Type</Label>
                  <Tabs 
                    defaultValue="summary" 
                    value={reportType} 
                    onValueChange={setReportType}
                    className="w-full"
                  >
                    <TabsList className="grid grid-cols-3 w-full">
                      <TabsTrigger value="summary">Summary</TabsTrigger>
                      <TabsTrigger value="detailed">Detailed</TabsTrigger>
                      <TabsTrigger value="individual">Individual</TabsTrigger>
                    </TabsList>
                    <TabsContent value="summary" className="pt-4 text-sm text-gray-500">
                      Includes overview statistics and attendance percentages
                    </TabsContent>
                    <TabsContent value="detailed" className="pt-4 text-sm text-gray-500">
                      Includes complete staff list with check-in times
                    </TabsContent>
                    <TabsContent value="individual" className="pt-4 text-sm text-gray-500">
                      Generate individual staff attendance reports
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="include-faces" className="cursor-pointer">
                    Include face thumbnails
                  </Label>
                  <Switch
                    id="include-faces"
                    checked={includeFaces}
                    onCheckedChange={setIncludeFaces}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={generatePDF}
                          disabled={!selectedEvent || isGenerating}
                          className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-primary/90 text-white font-medium"
                        >
                          {isGenerating ? (
                            <Spinner className="mr-2 h-4 w-4" />
                          ) : (
                            <FileDown className="mr-2 h-4 w-4" />
                          )}
                          Generate PDF Report
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download report as PDF</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={generateExcel}
                          disabled={!selectedEvent || isGenerating}
                          className="w-full sm:w-auto px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium"
                        >
                          {isGenerating ? (
                            <Spinner className="mr-2 h-4 w-4" />
                          ) : (
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                          )}
                          Export as Excel
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download report as Excel</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Report Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedEvent ? (
              <div className="max-h-64 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockStaffData.map((staff, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{staff.name}</TableCell>
                        <TableCell>{staff.role}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            staff.status === "Checked In" ? "bg-green-100 text-green-800" :
                            staff.status === "Late" ? "bg-amber-100 text-amber-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {staff.status}
                          </span>
                        </TableCell>
                        <TableCell>{staff.time}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm text-center">
                  Select an event to preview the report format
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Past Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockPastReports.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Date Generated</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPastReports.map((report, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{report.name}</TableCell>
                      <TableCell>{report.date}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          report.type === "PDF" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                        }`}>
                          {report.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadPastReport(report)}
                          className="px-4 py-2 hover:bg-gray-100 transition-colors"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-700 mb-1">No Previous Reports</h3>
                <p className="text-gray-500">
                  Generated reports will appear here for easy access
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
