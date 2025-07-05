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

  // New template states
  const [checkinConfirmationTemplate, setCheckinConfirmationTemplate] = useState(
    "Hi [Staff Name], you've successfully checked in for [Event Name] at [Check-in Time]. Welcome!"
  );

  const [postEventThankYouTemplate, setPostEventThankYouTemplate] = useState(
    "Thanks for your work at [Event Name], [Staff Name]! Your shift ended at [Clock-out Time]."
  );

  // State for reminder timing
  const [reminderTime, setReminderTime] = useState("24");
  const [reminderUnit, setReminderUnit] = useState("hours");

  // State for post-event thank you timing
  const [thankYouDelay, setThankYouDelay] = useState("2");
  
  // State for notification toggles
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [checkinConfirmationEnabled, setCheckinConfirmationEnabled] = useState(true);
  const [postEventThankYouEnabled, setPostEventThankYouEnabled] = useState(true);

  
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

  // Check-in confirmation placeholders
  const checkinPlaceholders = [
    { name: "[Staff Name]", description: "The staff member's full name" },
    { name: "[Event Name]", description: "The name of the event" },
    { name: "[Event Date]", description: "The date of the event" },
    { name: "[Event Time]", description: "The start time of the event" },
    { name: "[Check-in Time]", description: "The time when staff checked in" },
    { name: "[Location]", description: "The event venue/location" },
    { name: "[Supervisor Name]", description: "The name of the event supervisor" },
  ];

  // Post-event thank you placeholders
  const thankYouPlaceholders = [
    { name: "[Staff Name]", description: "The staff member's full name" },
    { name: "[Event Name]", description: "The name of the event" },
    { name: "[Event Date]", description: "The date of the event" },
    { name: "[Clock-out Time]", description: "The time when staff clocked out" },
    { name: "[Total Hours Worked]", description: "Total hours worked during the event" },
    { name: "[Organizer Company Name]", description: "The name of the organizing company" },
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

  const handleSaveCheckinConfirmationTemplate = () => {
    console.log("Saving check-in confirmation template:", checkinConfirmationTemplate);
    console.log("Check-in confirmation enabled:", checkinConfirmationEnabled);
    // Future: API call to save template
  };

  const handleSavePostEventThankYouTemplate = () => {
    console.log("Saving post-event thank you template:", postEventThankYouTemplate);
    console.log("Post-event thank you enabled:", postEventThankYouEnabled);
    console.log("Thank you delay:", thankYouDelay, "hours");
    // Future: API call to save template and timing
  };

  return (
    <div className="flex flex-col w-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Configure Auto-Messages</h1>
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
      
      {/* Check-in Confirmation Message Card */}
      <Card>
        <CardHeader>
          <CardTitle>Check-in Confirmation Message</CardTitle>
          <CardDescription>
            Message sent to staff immediately after a successful check-in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Switch 
              id="checkin-confirmation-enabled" 
              checked={checkinConfirmationEnabled}
              onCheckedChange={setCheckinConfirmationEnabled}
              disabled={!notificationsEnabled}
            />
            <Label htmlFor="checkin-confirmation-enabled">
              Enable Check-in Confirmation Messages
            </Label>
          </div>

          <Textarea 
            value={checkinConfirmationTemplate}
            onChange={(e) => setCheckinConfirmationTemplate(e.target.value)}
            placeholder="Enter your check-in confirmation message template..."
            className="min-h-[150px]"
            disabled={!notificationsEnabled || !checkinConfirmationEnabled}
          />
          
          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-sm font-medium text-blue-700 mb-2">Available Placeholders:</p>
            <div className="flex flex-wrap gap-2">
              {checkinPlaceholders.map((placeholder) => (
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
            onClick={handleSaveCheckinConfirmationTemplate}
            disabled={!notificationsEnabled || !checkinConfirmationEnabled}
          >
            Save Template
          </Button>
        </CardContent>
      </Card>

      {/* Post-Event Thank You Message Card */}
      <Card>
        <CardHeader>
          <CardTitle>Post-Event Thank You Message</CardTitle>
          <CardDescription>
            Message sent to staff after an event or their shift concludes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Switch 
              id="post-event-thankyou-enabled" 
              checked={postEventThankYouEnabled}
              onCheckedChange={setPostEventThankYouEnabled}
              disabled={!notificationsEnabled}
            />
            <Label htmlFor="post-event-thankyou-enabled">
              Enable Post-Event Thank You Messages
            </Label>
          </div>

          <Textarea 
            value={postEventThankYouTemplate}
            onChange={(e) => setPostEventThankYouTemplate(e.target.value)}
            placeholder="Enter your post-event thank you message template..."
            className="min-h-[150px]"
            disabled={!notificationsEnabled || !postEventThankYouEnabled}
          />
          
          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-sm font-medium text-blue-700 mb-2">Available Placeholders:</p>
            <div className="flex flex-wrap gap-2">
              {thankYouPlaceholders.map((placeholder) => (
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
            <Label htmlFor="thankyou-delay" className="min-w-28">Send</Label>
            <div className="flex space-x-2">
              <Input 
                id="thankyou-delay" 
                type="number" 
                value={thankYouDelay}
                onChange={(e) => setThankYouDelay(e.target.value)}
                className="w-20"
                min="0"
                max="24"
                disabled={!notificationsEnabled || !postEventThankYouEnabled}
              />
              <span className="ml-2 text-gray-500">hours after last clock-out</span>
            </div>
          </div>
          
          <Button 
            onClick={handleSavePostEventThankYouTemplate}
            disabled={!notificationsEnabled || !postEventThankYouEnabled}
          >
            Save Template
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 