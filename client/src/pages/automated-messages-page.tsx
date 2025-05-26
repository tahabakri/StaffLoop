import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function AutomatedMessagesPage() {
  // State for notification templates
  const [eventAssignmentTemplate, setEventAssignmentTemplate] = useState(
    "Hi [Staff Name], you've been assigned to [Event Name] on [Event Date] at [Event Time], located at [Location]. More details: [Event Link]"
  );
  
  const [eventReminderTemplate, setEventReminderTemplate] = useState(
    "Reminder: You're scheduled to work at [Event Name] tomorrow at [Event Time]. Location: [Location]. Please arrive 15 minutes early and check in with your supervisor."
  );
  
  // State for reminder timing
  const [reminderTime, setReminderTime] = useState("24");
  const [reminderUnit, setReminderUnit] = useState("hours");
  
  // State for notification toggle
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  // Available placeholders for templates
  const placeholders = [
    { name: "[Staff Name]", description: "The staff member's full name" },
    { name: "[Event Name]", description: "The name of the event" },
    { name: "[Event Date]", description: "The date of the event" },
    { name: "[Event Time]", description: "The start time of the event" },
    { name: "[Location]", description: "The event venue/location" },
    { name: "[Event Link]", description: "Link to view event details" },
    { name: "[Check-in Link]", description: "Link for staff to check in" },
  ];
  
  // Handle save actions (placeholder for now)
  const handleSaveAssignmentTemplate = () => {
    console.log("Saving assignment template:", eventAssignmentTemplate);
    // Future: API call to save template
  };
  
  const handleSaveReminderTemplate = () => {
    console.log("Saving reminder template:", eventReminderTemplate);
    console.log("Reminder timing:", reminderTime, reminderUnit);
    // Future: API call to save template and timing
  };
  
  return (
    <div className="flex flex-col w-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Notification Templates</h1>
        <div className="flex items-center space-x-2">
          <Switch 
            id="notifications-enabled" 
            checked={notificationsEnabled}
            onCheckedChange={setNotificationsEnabled}
          />
          <Label htmlFor="notifications-enabled">
            {notificationsEnabled ? "Notifications Enabled" : "Notifications Disabled"}
          </Label>
        </div>
      </div>
      
      {/* Overall Notification Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Status</CardTitle>
          <CardDescription>
            Enable or disable all automated WhatsApp notifications from StaffLoop
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <p className="font-medium">Automated WhatsApp Notifications</p>
              <p className="text-sm text-gray-500">
                When enabled, StaffLoop will send automated messages for event assignments, reminders, and updates.
              </p>
            </div>
            <Switch 
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>
          
          <div className={`p-4 rounded-md ${notificationsEnabled ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
            <p>
              {notificationsEnabled 
                ? "WhatsApp notifications are currently enabled. Staff will receive messages according to your templates and settings."
                : "WhatsApp notifications are currently disabled. No automated messages will be sent to staff."}
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Assignment Notification Card */}
      <Card>
        <CardHeader>
          <CardTitle>Event Assignment Message</CardTitle>
          <CardDescription>
            This message is sent to staff when they are newly assigned to an event.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea 
            value={eventAssignmentTemplate}
            onChange={(e) => setEventAssignmentTemplate(e.target.value)}
            placeholder="Enter your message template..."
            className="min-h-[150px]"
            disabled={!notificationsEnabled}
          />
          
          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-sm font-medium text-blue-700 mb-2">Available Placeholders:</p>
            <div className="flex flex-wrap gap-2">
              {placeholders.map((placeholder) => (
                <Badge 
                  key={placeholder.name} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-blue-100"
                  title={placeholder.description}
                >
                  {placeholder.name}
                </Badge>
              ))}
            </div>
          </div>
          
          <Button 
            onClick={handleSaveAssignmentTemplate}
            disabled={!notificationsEnabled}
          >
            Save Template
          </Button>
        </CardContent>
      </Card>
      
      {/* Reminder Notification Card */}
      <Card>
        <CardHeader>
          <CardTitle>Event Reminder Message</CardTitle>
          <CardDescription>
            This message is sent as a reminder before the event starts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea 
            value={eventReminderTemplate}
            onChange={(e) => setEventReminderTemplate(e.target.value)}
            placeholder="Enter your reminder message template..."
            className="min-h-[150px]"
            disabled={!notificationsEnabled}
          />
          
          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-sm font-medium text-blue-700 mb-2">Available Placeholders:</p>
            <div className="flex flex-wrap gap-2">
              {placeholders.map((placeholder) => (
                <Badge 
                  key={placeholder.name} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-blue-100"
                  title={placeholder.description}
                >
                  {placeholder.name}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mt-4">
            <Label htmlFor="reminder-time" className="min-w-28">Send Reminder:</Label>
            <div className="flex space-x-2">
              <Input 
                id="reminder-time" 
                type="number" 
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-20"
                min="1"
                max="72"
                disabled={!notificationsEnabled}
              />
              <Select 
                value={reminderUnit} 
                onValueChange={setReminderUnit}
                disabled={!notificationsEnabled}
              >
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hours">hours</SelectItem>
                  <SelectItem value="days">days</SelectItem>
                </SelectContent>
              </Select>
              <span className="ml-2 text-gray-500">before event start</span>
            </div>
          </div>
          
          <Button 
            onClick={handleSaveReminderTemplate}
            className="mt-4"
            disabled={!notificationsEnabled}
          >
            Save Template & Schedule
          </Button>
        </CardContent>
      </Card>
      
      {/* Future Notification Types */}
      <Card className="bg-gray-50 border-dashed">
        <CardHeader>
          <CardTitle>Coming Soon: Additional Notification Types</CardTitle>
          <CardDescription>
            We're working on more notification types to help you stay connected with your staff.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-gray-500">
            <li>Check-in confirmation messages</li>
            <li>Post-event thank you messages</li>
            <li>Payment confirmation notifications</li>
            <li>Custom broadcast messages to all staff</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
} 