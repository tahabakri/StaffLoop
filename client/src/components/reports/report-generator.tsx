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
import { Download, FileText, ChevronRight, User, CheckCircle, Clock, XCircle } from 'lucide-react';
import { formatDate, getInitials } from '@/lib/utils';

interface ReportGeneratorProps {
  className?: string;
}

export function ReportGenerator({ className }: ReportGeneratorProps) {
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [includeFaces, setIncludeFaces] = useState(true);
  const [reportType, setReportType] = useState<string>('summary');
  const { toast } = useToast();

  // Fetch events for the dropdown
  const { data: events, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['/api/events'],
  });

  const handleGenerateReport = () => {
    if (!selectedEvent) {
      toast({
        title: 'Select an event',
        description: 'Please select an event to generate a report',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Generating report',
      description: 'Your report is being generated and will download shortly.',
    });

    // In a real implementation, this would call an API to generate and download the report
    setTimeout(() => {
      toast({
        title: 'Report ready',
        description: 'Your attendance report has been downloaded.',
      });
    }, 2000);
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
                  {isLoadingEvents ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select
                      value={selectedEvent}
                      onValueChange={setSelectedEvent}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an event" />
                      </SelectTrigger>
                      <SelectContent>
                        {events && events.length > 0 ? (
                          events.map((event) => (
                            <SelectItem key={event.id} value={event.id.toString()}>
                              {event.name} - {formatDate(event.date)}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            No events available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  )}
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

                <Button 
                  className="w-full" 
                  onClick={handleGenerateReport}
                  disabled={!selectedEvent}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generate and Download Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Report Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center">
              <div className="w-full aspect-[3/4] bg-gray-50 border border-gray-200 rounded-md mb-4 flex items-center justify-center">
                <FileText className="h-16 w-16 text-gray-300" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-gray-500 text-sm">
                  Select an event to preview the report format
                </p>
                <div className="text-xs text-gray-400">
                  PDF format | Portrait orientation
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Past Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Empty state for past reports */}
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-700 mb-1">No Previous Reports</h3>
              <p className="text-gray-500">
                Generated reports will appear here for easy access
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
