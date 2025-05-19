import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { ChevronLeft, ChevronRight, Plus, UserPlus } from "lucide-react";
import { format, addDays, isBefore, isAfter, parseISO } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Combobox } from "@/components/ui/combobox";
import { useQueryClient } from '@tanstack/react-query';

interface Role {
  name: string;
  staffCount: number;
  assignedStaff: Staff[];
}

interface Staff {
  id: string;
  name: string;
  role: string;
  contactInfo: string;
}

interface EventSchedule {
  startTime: string;
  endTime: string;
}

interface EventData {
  name: string;
  location: string;
  isMultiDay: boolean;
  startDate: string;
  endDate: string;
  schedule: EventSchedule;
  description: string;
  roles: Role[];
}

// Mock staff list
const mockStaffList = [
  { id: "1", name: "John Doe", role: "Organizer", contactInfo: "john@example.com" },
  { id: "2", name: "Jane Smith", role: "Staff", contactInfo: "jane@example.com" },
  { id: "3", name: "Bob Lee", role: "Staff", contactInfo: "bob@example.com" },
];

const initialEventData: EventData = {
  name: "",
  location: "",
  isMultiDay: false,
  startDate: format(new Date(), "yyyy-MM-dd"),
  endDate: format(new Date(), "yyyy-MM-dd"),
  schedule: {
    startTime: "09:00",
    endTime: "17:00",
  },
  description: "",
  roles: [],
};

export function EventSetup() {
  const [currentStep, setCurrentStep] = useState(1);
  const [eventData, setEventData] = useState<EventData>(initialEventData);
  const [isCreating, setIsCreating] = useState(false);
  const [showNewStaffDialog, setShowNewStaffDialog] = useState(false);
  const [staffSearch, setStaffSearch] = useState("");
  const [isStaffLoading, setIsStaffLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const steps = [
    { id: 1, title: "Event Type and Dates" },
    { id: 2, title: "Event Schedule" },
    { id: 3, title: "Roles and Staff Requirements" },
    { id: 4, title: "Assign Staff" },
    { id: 5, title: "Review and Confirm" },
  ];

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!eventData.name || !eventData.location || !eventData.startDate) {
          toast({
            title: "Missing Information",
            description: "Please fill in all required fields.",
            variant: "destructive",
          });
          return false;
        }
        if (eventData.isMultiDay && isBefore(parseISO(eventData.endDate), parseISO(eventData.startDate))) {
          toast({
            title: "Invalid Date Range",
            description: "End date cannot be before start date.",
            variant: "destructive",
          });
          return false;
        }
        return true;
      case 2:
        if (!eventData.schedule.startTime || !eventData.schedule.endTime) {
          toast({
            title: "Missing Schedule",
            description: "Please set event start and end times.",
            variant: "destructive",
          });
          return false;
        }
        return true;
      case 3:
        if (eventData.roles.length === 0) {
          toast({
            title: "No Roles Defined",
            description: "Please add at least one role.",
            variant: "destructive",
          });
          return false;
        }
        return true;
      case 4:
        const hasUnassignedRoles = eventData.roles.some(role => role.assignedStaff.length === 0);
        if (hasUnassignedRoles) {
          toast({
            title: "Unassigned Roles",
            description: "Please assign staff to all roles.",
            variant: "destructive",
          });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleCreateEvent = async () => {
    setIsCreating(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Success",
        description: "Event created and added to dropdown!",
      });
      // Invalidate events query so dropdowns update
      await queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setEventData(initialEventData);
      setCurrentStep(1);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>Event Type</Label>
              <RadioGroup
                value={eventData.isMultiDay ? "multi" : "single"}
                onValueChange={(value) => setEventData(prev => ({ ...prev, isMultiDay: value === "multi" }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="single" id="single" />
                  <Label htmlFor="single">Single-Day Event</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="multi" id="multi" />
                  <Label htmlFor="multi">Multi-Day Event</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Event Name</Label>
                <Input
                  id="name"
                  value={eventData.name}
                  onChange={(e) => setEventData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter event name"
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={eventData.location}
                  onChange={(e) => setEventData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter event location"
                />
              </div>

              <div className="grid gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={eventData.startDate}
                    onChange={(e) => setEventData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>

                {eventData.isMultiDay && (
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={eventData.endDate}
                      onChange={(e) => setEventData(prev => ({ ...prev, endDate: e.target.value }))}
                      min={eventData.startDate}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={eventData.schedule.startTime}
                  onChange={(e) => setEventData(prev => ({
                    ...prev,
                    schedule: { ...prev.schedule, startTime: e.target.value }
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={eventData.schedule.endTime}
                  onChange={(e) => setEventData(prev => ({
                    ...prev,
                    schedule: { ...prev.schedule, endTime: e.target.value }
                  }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={eventData.description}
                onChange={(e) => setEventData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter event description"
                rows={4}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              {eventData.roles.map((role, index) => (
                <div key={index} className="flex items-end gap-4">
                  <div className="flex-1">
                    <Label>Role Name</Label>
                    <Input
                      value={role.name}
                      onChange={(e) => {
                        const newRoles = [...eventData.roles];
                        newRoles[index] = { ...role, name: e.target.value };
                        setEventData(prev => ({ ...prev, roles: newRoles }));
                      }}
                      placeholder="Enter role name"
                    />
                  </div>
                  <div className="w-32">
                    <Label>Staff Count</Label>
                    <Input
                      type="number"
                      min="1"
                      value={role.staffCount}
                      onChange={(e) => {
                        const newRoles = [...eventData.roles];
                        newRoles[index] = { ...role, staffCount: parseInt(e.target.value) };
                        setEventData(prev => ({ ...prev, roles: newRoles }));
                      }}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      const newRoles = eventData.roles.filter((_, i) => i !== index);
                      setEventData(prev => ({ ...prev, roles: newRoles }));
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}

              <Button
                variant="outline"
                onClick={() => setEventData(prev => ({
                  ...prev,
                  roles: [...prev.roles, { name: "", staffCount: 1, assignedStaff: [] }]
                }))}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Role
              </Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {eventData.roles.map((role, roleIndex) => (
              <div key={roleIndex} className="space-y-4">
                <h3 className="font-medium">{role.name}</h3>
                <div className="space-y-2">
                  {role.assignedStaff.map((staff, staffIndex) => (
                    <div key={staffIndex} className="flex items-center gap-4">
                      <div className="flex-1">
                        <Input value={staff.name} disabled />
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          const newRoles = [...eventData.roles];
                          newRoles[roleIndex].assignedStaff = role.assignedStaff.filter((_, i) => i !== staffIndex);
                          setEventData(prev => ({ ...prev, roles: newRoles }));
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  {role.assignedStaff.length < role.staffCount && (
                    <div className="flex flex-col gap-2">
                      <Label>Assign Existing Staff</Label>
                      <Combobox
                        value={staffSearch}
                        onValueChange={setStaffSearch}
                        options={
                          staffSearch
                            ? mockStaffList.filter(s => s.name.toLowerCase().includes(staffSearch.toLowerCase()))
                            : mockStaffList
                        }
                        getOptionLabel={s => `${s.name} (${s.role})`}
                        getOptionValue={s => s.id}
                        onSelect={staffId => {
                          const staff = mockStaffList.find(s => s.id === staffId);
                          if (staff) {
                            const newRoles = [...eventData.roles];
                            newRoles[roleIndex].assignedStaff.push(staff);
                            setEventData(prev => ({ ...prev, roles: newRoles }));
                            setStaffSearch("");
                            toast({ title: "Staff assigned successfully" });
                          }
                        }}
                        placeholder="Search staff by name..."
                        className="w-full border border-gray-300 rounded-md"
                        loading={isStaffLoading}
                        renderNoOptions={() => (
                          <Button
                            variant="outline"
                            className="w-full mt-2"
                            onClick={() => setShowNewStaffDialog(true)}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add New Staff
                          </Button>
                        )}
                      />
                      {isStaffLoading && <Spinner className="mx-auto mt-2" />}
                    </div>
                  )}
                  <Dialog open={showNewStaffDialog} onOpenChange={setShowNewStaffDialog}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Staff</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Staff Name</Label>
                          <Input placeholder="Enter staff name" />
                        </div>
                        <div>
                          <Label>Contact Info</Label>
                          <Input placeholder="Enter email or phone" />
                        </div>
                        <Button
                          onClick={() => {
                            const newRoles = [...eventData.roles];
                            newRoles[roleIndex].assignedStaff.push({
                              id: Math.random().toString(),
                              name: staffSearch || "New Staff",
                              role: role.name,
                              contactInfo: "contact@example.com"
                            });
                            setEventData(prev => ({ ...prev, roles: newRoles }));
                            setShowNewStaffDialog(false);
                            setStaffSearch("");
                            toast({ title: "Staff assigned successfully" });
                          }}
                        >
                          Add Staff
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium">Event Details</h3>
              <div className="grid gap-2">
                <div>
                  <span className="text-sm text-gray-500">Name:</span>
                  <p>{eventData.name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Location:</span>
                  <p>{eventData.location}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Date:</span>
                  <p>
                    {format(parseISO(eventData.startDate), "PPP")}
                    {eventData.isMultiDay && ` - ${format(parseISO(eventData.endDate), "PPP")}`}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Time:</span>
                  <p>{eventData.schedule.startTime} - {eventData.schedule.endTime}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Roles and Staff</h3>
              {eventData.roles.map((role, index) => (
                <div key={index} className="space-y-2">
                  <p className="font-medium">{role.name}</p>
                  <div className="pl-4">
                    {role.assignedStaff.map((staff, staffIndex) => (
                      <p key={staffIndex} className="text-sm text-gray-600">
                        {staff.name}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create New Event</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Progress Steps */}
            <div className="flex justify-between">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center ${
                    step.id === currentStep ? "text-primary" : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      step.id === currentStep
                        ? "border-primary bg-primary text-white"
                        : step.id < currentStep
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-gray-300"
                    }`}
                  >
                    {step.id}
                  </div>
                  <span className="text-xs mt-2">{step.title}</span>
                </div>
              ))}
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              {currentStep === steps.length ? (
                <Button
                  onClick={handleCreateEvent}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <Spinner className="mr-2 h-4 w-4" />
                  ) : (
                    "Create Event"
                  )}
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
