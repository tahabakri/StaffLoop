import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { ChevronLeft, ChevronRight, Plus, UserPlus, Copy, Share2, Check, Trash2, Save, CalendarPlus } from "lucide-react";
import { format, addDays, isBefore, isAfter, parseISO } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Combobox } from "@/components/ui/combobox";
import { useQueryClient } from '@tanstack/react-query';
import { Switch } from "@/components/ui/switch";
import { GoogleGeofenceMapSelector } from "@/components/maps/GoogleGeofenceMapSelector";
import { useNavigate } from "react-router-dom";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useEventDraft } from "@/hooks/use-event-draft";
import { useBackendEventDraft } from "@/hooks/use-backend-event-draft";
import { EventData, Role, Staff, Team, Shift, EventSchedule, initialEventData } from "@/types/events";
import { downloadEventICS, EventCalendarData } from "@/utils/calendar";

interface SupervisorAccessToken {
  id: number;
  eventId: number;
  teamId: number;
  supervisorStaffId: number;
  accessToken: string;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
}

// Mock staff list
const mockStaffList = [
  { id: "1", name: "John Doe", role: "Organizer", contactInfo: "john@example.com" },
  { id: "2", name: "Jane Smith", role: "Staff", contactInfo: "jane@example.com" },
  { id: "3", name: "Bob Lee", role: "Staff", contactInfo: "bob@example.com" },
];

interface EventSetupProps {
  eventId?: string;
  isEditMode?: boolean;
}

export function EventSetup({ eventId, isEditMode = false }: EventSetupProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [eventData, setEventData] = useState<EventData>(initialEventData);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [showNewStaffDialog, setShowNewStaffDialog] = useState(false);
  const [staffSearch, setStaffSearch] = useState("");
  const [isStaffLoading, setIsStaffLoading] = useState(false);
  const [supervisorSearch, setSupervisorSearch] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [accessToken, setAccessToken] = useState<SupervisorAccessToken | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Use the custom draft hooks
  const {
    draftData,
    hasDraft,
    showDraftDialog,
    setShowDraftDialog,
    debouncedSaveDraft,
    clearDraft
  } = useEventDraft<EventData>(initialEventData, isEditMode);
  
  // Backend draft hook
  const { isSaving, saveAsDraft } = useBackendEventDraft();

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [createdEvent, setCreatedEvent] = useState<{ id: string; data: EventData } | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const steps = [
    { id: 1, title: "Event Type and Dates" },
    { id: 2, title: "Event Schedule" },
    { id: 3, title: "Teams, Roles & Requirements" },
    { id: 4, title: "Assign Staff" },
    { id: 5, title: "Review and Confirm" },
  ];

  // Resume draft
  const resumeDraft = useCallback(() => {
    if (draftData) {
      setEventData(draftData.eventData);
      setCurrentStep(draftData.step);
      setShowDraftDialog(false);
      
      toast({
        title: "Draft Loaded",
        description: "Your saved draft has been loaded successfully.",
      });
    }
  }, [draftData, toast, setShowDraftDialog]);

  // Discard draft
  const discardDraft = useCallback(() => {
    clearDraft();
    setShowDraftDialog(false);
    
    toast({
      title: "Draft Discarded",
      description: "The saved draft has been discarded.",
    });
  }, [clearDraft, toast, setShowDraftDialog]);

  // Save draft when eventData changes
  useEffect(() => {
    // Don't save draft in edit mode
    if (isEditMode) return;
    
    // Only save if there's actual data (not just the initial state)
    if (eventData.name || eventData.location !== initialEventData.location) {
      debouncedSaveDraft(eventData, currentStep);
    }
  }, [eventData, currentStep, debouncedSaveDraft, isEditMode]);

  // Handle saving draft to backend
  const handleSaveAsDraft = async () => {
    // Validate minimum required fields
    if (!eventData.name) {
      toast({
        title: "Missing Information",
        description: "Please provide at least an event name before saving as draft.",
        variant: "destructive",
      });
      return;
    }
    
    const result = await saveAsDraft(eventData, eventId);
    
    if (result.success) {
      // Clear localStorage draft since we now have a backend draft
      clearDraft();
      
      // Navigate back to events list
      navigate('/events');
    }
  };

  // Fetch event data if in edit mode
  useEffect(() => {
    if (isEditMode && eventId) {
      const fetchEventData = async () => {
        setIsLoading(true);
        try {
          // In a real app, this would be an API call
          // const response = await fetch(`/api/events/${eventId}`);
          // const data = await response.json();
          
          // For now, we'll use mock data
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock data for editing - in a real app, this would come from the API
          const mockEventData: EventData = {
            name: `Event #${eventId}`,
            location: "Dubai World Trade Centre",
            isMultiDay: true,
            startDate: format(new Date(), "yyyy-MM-dd"),
            endDate: format(addDays(new Date(), 2), "yyyy-MM-dd"),
            schedule: {
              startTime: "10:00",
              endTime: "18:00",
              hasShifts: false,
              shifts: [],
            },
            description: "This is a mock event for editing demonstration",
            roles: [
              {
                id: "1",
                name: "Security",
                staffCount: 5,
                assignedStaff: mockStaffList.slice(0, 2),
              }
            ],
            hasTeams: false,
            teams: [],
            geofence: {
              latitude: 25.2048,
              longitude: 55.2708,
              radiusMeters: 100,
            },
          };
          
          setEventData(mockEventData);
          toast({
            title: "Event loaded",
            description: "Event details have been loaded for editing.",
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to load event details. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchEventData();
    }
  }, [isEditMode, eventId, toast]);

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
        
        if (eventData.schedule.hasShifts) {
          if (eventData.schedule.shifts.length === 0) {
            toast({
              title: "Missing Shifts",
              description: "You've indicated this event has shifts, but no shifts have been defined.",
              variant: "destructive",
            });
            return false;
          }
          
          // Validate each shift
          for (const shift of eventData.schedule.shifts) {
            if (!shift.startTime || !shift.endTime) {
              toast({
                title: "Incomplete Shift",
                description: "All shifts must have start and end times defined.",
                variant: "destructive",
              });
              return false;
            }
            
            // Validate shift times fall within overall event times
            if (shift.startTime < eventData.schedule.startTime || shift.endTime > eventData.schedule.endTime) {
              toast({
                title: "Invalid Shift Times",
                description: "Shift times must fall within the overall event time window.",
                variant: "destructive",
              });
              return false;
            }
          }
        }
        
        return true;
      case 3:
        if (eventData.hasTeams) {
          // Validate teams and their roles when teams are enabled
          if (eventData.teams.length === 0) {
            toast({
              title: "No Teams Defined",
              description: "You've indicated this event has teams, but no teams have been defined.",
              variant: "destructive",
            });
            return false;
          }
          
          // Validate that each team has a name, supervisor, and at least one role
          for (const team of eventData.teams) {
            if (!team.name.trim()) {
              toast({
                title: "Incomplete Team",
                description: "All teams must have a name.",
                variant: "destructive",
              });
              return false;
            }
            
            if (team.roles.length === 0) {
              toast({
                title: "No Roles Defined",
                description: `Team "${team.name}" has no roles defined. Each team must have at least one role for team members.`,
                variant: "destructive",
              });
              return false;
            }
            
            // Validate each role within the team
            for (const role of team.roles) {
              if (!role.name.trim()) {
                toast({
                  title: "Incomplete Role",
                  description: `A role in team "${team.name}" has no name defined.`,
                  variant: "destructive",
                });
                return false;
              }
              
              if (eventData.schedule.hasShifts) {
                // Validate staff counts for each shift
                let hasValidShiftCount = false;
                let missingShifts = [];
                
                for (const shift of eventData.schedule.shifts) {
                  const shiftId = shift.name || `shift-${eventData.schedule.shifts.indexOf(shift)}`;
                  const staffCount = role.shiftStaffCounts?.[shiftId] || 0;
                  
                  if (staffCount > 0) {
                    hasValidShiftCount = true;
                  } else {
                    missingShifts.push(shift.name || `Shift ${eventData.schedule.shifts.indexOf(shift) + 1}`);
                  }
                }
                
                if (!hasValidShiftCount) {
                  toast({
                    title: "Invalid Staff Count",
                    description: `Role "${role.name}" in team "${team.name}" must require at least one staff member in at least one shift.`,
                    variant: "destructive",
                  });
                  return false;
                }
                
                if (missingShifts.length > 0 && missingShifts.length < eventData.schedule.shifts.length) {
                  toast({
                    title: "Warning: Incomplete Shift Staffing",
                    description: `Role "${role.name}" in team "${team.name}" has no staff assigned for: ${missingShifts.join(', ')}. You can continue, but these shifts won't have staff assigned.`,
                  });
                  // This is a warning, not an error, so we continue
                }
              } else {
                // Validate overall staff count when no shifts
                if (!role.staffCount || role.staffCount < 1) {
                  toast({
                    title: "Invalid Staff Count",
                    description: `Role "${role.name}" in team "${team.name}" must require at least one staff member.`,
                    variant: "destructive",
                  });
                  return false;
                }
              }
            }
          }
        } else {
          // Validate global roles when teams are disabled
        if (eventData.roles.length === 0) {
          toast({
            title: "No Roles Defined",
            description: "Please add at least one role.",
            variant: "destructive",
          });
          return false;
          }
          
          // Validate each global role
          for (const role of eventData.roles) {
            if (!role.name.trim()) {
              toast({
                title: "Incomplete Role",
                description: "All roles must have a name.",
                variant: "destructive",
              });
              return false;
            }
            
            if (eventData.schedule.hasShifts) {
              // Validate staff counts for each shift
              let hasValidShiftCount = false;
              let missingShifts = [];
              
              for (const shift of eventData.schedule.shifts) {
                const shiftId = shift.name || `shift-${eventData.schedule.shifts.indexOf(shift)}`;
                const staffCount = role.shiftStaffCounts?.[shiftId] || 0;
                
                if (staffCount > 0) {
                  hasValidShiftCount = true;
                } else {
                  missingShifts.push(shift.name || `Shift ${eventData.schedule.shifts.indexOf(shift) + 1}`);
                }
              }
              
              if (!hasValidShiftCount) {
                toast({
                  title: "Invalid Staff Count",
                  description: `Role "${role.name}" must require at least one staff member in at least one shift.`,
                  variant: "destructive",
                });
                return false;
              }
              
              if (missingShifts.length > 0 && missingShifts.length < eventData.schedule.shifts.length) {
                toast({
                  title: "Warning: Incomplete Shift Staffing",
                  description: `Role "${role.name}" has no staff assigned for: ${missingShifts.join(', ')}. You can continue, but these shifts won't have staff assigned.`,
                });
                // This is a warning, not an error, so we continue
              }
            } else {
              // Validate overall staff count when no shifts
              if (!role.staffCount || role.staffCount < 1) {
                toast({
                  title: "Invalid Staff Count",
                  description: `Role "${role.name}" must require at least one staff member.`,
                  variant: "destructive",
                });
                return false;
              }
            }
          }
        }
        return true;
      case 4:
        if (eventData.hasTeams) {
          // Validate that staff are assigned to roles within teams
          let hasUnassignedRoles = false;
          let unassignedRoleDetails = "";
          
          for (const team of eventData.teams) {
            for (const role of team.roles) {
              if (role.assignedStaff.length === 0) {
                hasUnassignedRoles = true;
                unassignedRoleDetails += `\n- ${role.name} in team ${team.name}`;
              } else if (role.assignedStaff.length < role.staffCount) {
                hasUnassignedRoles = true;
                unassignedRoleDetails += `\n- ${role.name} in team ${team.name} (${role.assignedStaff.length}/${role.staffCount})`;
              }
            }
          }
          
          if (hasUnassignedRoles) {
            toast({
              title: "Unassigned Roles",
              description: `Please assign staff to all roles:${unassignedRoleDetails}`,
              variant: "destructive",
            });
            return false;
          }
        } else {
          // Validate staff assignments for global roles
        const hasUnassignedRoles = eventData.roles.some(role => role.assignedStaff.length === 0);
        if (hasUnassignedRoles) {
          toast({
            title: "Unassigned Roles",
            description: "Please assign staff to all roles.",
            variant: "destructive",
          });
          return false;
          }
        }
        return true;
      case 5:
        // No validation needed for review step
        return true;
      case 6:
        // No validation needed for review step
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
      
      if (isEditMode) {
        toast({
          title: "Success",
          description: "Event updated successfully!",
        });
        
        // Navigate back to events list
        navigate('/events');
      } else {
        // Clear draft after successful submission
        clearDraft();
        
        // Generate a mock event ID for the created event
        const eventId = Math.floor(Math.random() * 10000).toString();
        
        // Store the created event data for the success dialog
        setCreatedEvent({ id: eventId, data: eventData });
        setShowSuccessDialog(true);
      }
      
      // Invalidate events query so dropdowns update
      await queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      
    } catch (error) {
      toast({
        title: "Error",
        description: isEditMode 
          ? "Failed to update event. Please try again." 
          : "Failed to create event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Cancel event creation and navigate back to events list
  const handleCancel = () => {
    // If there's data, confirm before leaving
    if (eventData.name || eventData.location !== initialEventData.location) {
      // Show confirmation dialog
      setShowCancelDialog(true);
    } else {
      // No data to lose, just navigate back
      navigate('/events');
    }
  };

  // Confirm cancel and discard draft
  const confirmCancel = () => {
    clearDraft();
    setShowCancelDialog(false);
    navigate('/events');
  };

  // Function to generate access token for supervisor
  const handleGenerateToken = async (team: Team, staff?: Staff) => {
    if (!staff) {
      toast({
        title: "No Supervisor Selected",
        description: "Please select a staff member to grant supervisor access.",
        variant: "destructive",
      });
      return;
    }

    setCurrentTeam(team);
    setShowTokenDialog(true);
    setIsGeneratingToken(true);
    setAccessToken(null);
    setCopySuccess(false);

    try {
      // In a real app, this would be an API call
      // const response = await fetch("/api/supervisor-access", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     eventId: parseInt(eventId || "0"),
      //     teamId: parseInt(team.id),
      //     supervisorStaffId: parseInt(staff.id)
      //   })
      // });
      // const data = await response.json();

      // Mock response for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockToken: SupervisorAccessToken = {
        id: 1,
        eventId: parseInt(eventId || "0"),
        teamId: parseInt(team.id),
        supervisorStaffId: parseInt(staff.id),
        accessToken: "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        createdAt: new Date().toISOString()
      };

      setAccessToken(mockToken);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate access token. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingToken(false);
    }
  };

  // Function to copy token to clipboard
  const handleCopyToken = () => {
    if (accessToken) {
      navigator.clipboard.writeText(accessToken.accessToken);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  // Handle add to calendar from success dialog
  const handleAddToCalendarFromSuccess = async () => {
    if (!createdEvent) return;

    try {
      // Create start and end datetime from the event data
      const startDate = new Date(createdEvent.data.startDate);
      const [startHour, startMinute] = createdEvent.data.schedule.startTime.split(':').map(Number);
      startDate.setHours(startHour, startMinute, 0, 0);

      const endDate = createdEvent.data.isMultiDay 
        ? new Date(createdEvent.data.endDate)
        : new Date(createdEvent.data.startDate);
      const [endHour, endMinute] = createdEvent.data.schedule.endTime.split(':').map(Number);
      endDate.setHours(endHour, endMinute, 0, 0);

      const calendarEvent: EventCalendarData = {
        id: createdEvent.id,
        name: createdEvent.data.name,
        description: createdEvent.data.description || `StaffLoop Event - ${createdEvent.data.name}`,
        location: createdEvent.data.location,
        startDateTime: startDate.toISOString(),
        endDateTime: endDate.toISOString(),
      };

      await downloadEventICS(calendarEvent);
      
      toast({
        title: "Calendar File Downloaded",
        description: "The event has been added to your calendar file. Open it with your preferred calendar application.",
      });
    } catch (error) {
      console.error('Error adding to calendar:', error);
      toast({
        title: "Error",
        description: "Failed to generate calendar file. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle success dialog actions
  const handleSuccessDialogComplete = () => {
    setShowSuccessDialog(false);
    setCreatedEvent(null);
    setEventData(initialEventData);
    setCurrentStep(1);
    navigate('/events');
  };

  // Function to share token via WhatsApp
  const handleShareViaWhatsApp = () => {
    if (accessToken && currentTeam) {
      // Find the supervisor staff member from the assigned staff in team roles
      let supervisorStaff: Staff | undefined;
      
      // Look through all roles in the team to find the staff member with ID matching the token's supervisorStaffId
      for (const role of currentTeam.roles) {
        const foundStaff = role.assignedStaff.find(s => parseInt(s.id) === accessToken.supervisorStaffId);
        if (foundStaff) {
          supervisorStaff = foundStaff;
          break;
        }
      }
      
      if (supervisorStaff) {
        const eventName = eventData.name || "the event";
        // Generate a supervisor access URL with the token
        const accessUrl = `${window.location.origin}/supervisor-access?token=${accessToken.accessToken}`;
        const message = `Hello ${supervisorStaff.name}, you've been granted supervisor access for ${eventName}. Please use this link to access your team dashboard: ${accessUrl}`;
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${supervisorStaff.contactInfo}?text=${encodedMessage}`, '_blank');
      }
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
              
              {/* Geofence Map Selector */}
              <div>
                <Label>Geofence Configuration</Label>
                <GoogleGeofenceMapSelector
                  initialLocation={eventData.location}
                  initialLatitude={eventData.geofence.latitude}
                  initialLongitude={eventData.geofence.longitude}
                  initialRadius={eventData.geofence.radiusMeters}
                  onGeofenceChange={(latitude, longitude, radius) => {
                    setEventData(prev => ({
                      ...prev,
                      geofence: {
                        latitude,
                        longitude,
                        radiusMeters: radius
                      }
                    }));
                  }}
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
                <Label htmlFor="startTime">Overall Event Start Time</Label>
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
                <Label htmlFor="endTime">Overall Event End Time</Label>
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

            <div className="flex items-center space-x-2">
              <Switch
                id="hasShifts"
                checked={eventData.schedule.hasShifts}
                onCheckedChange={(checked) => setEventData(prev => ({
                  ...prev,
                  schedule: { ...prev.schedule, hasShifts: checked }
                }))}
              />
              <Label htmlFor="hasShifts">Does this event have specific work shifts?</Label>
            </div>

            {eventData.schedule.hasShifts && (
              <div className="space-y-4 border p-4 rounded-md">
                <h3 className="font-medium">Define Shifts</h3>
                {eventData.schedule.shifts.map((shift, index) => (
                  <div key={index} className="grid grid-cols-3 gap-4 items-end">
                    <div>
                      <Label htmlFor={`shift-name-${index}`}>Shift Name (Optional)</Label>
                      <Input
                        id={`shift-name-${index}`}
                        value={shift.name}
                        onChange={(e) => {
                          const newShifts = [...eventData.schedule.shifts];
                          newShifts[index] = { ...shift, name: e.target.value };
                          setEventData(prev => ({
                            ...prev,
                            schedule: { ...prev.schedule, shifts: newShifts }
                          }));
                        }}
                        placeholder="e.g., Morning Crew"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`shift-start-${index}`}>Shift Start Time</Label>
                      <Input
                        id={`shift-start-${index}`}
                        type="time"
                        value={shift.startTime}
                        onChange={(e) => {
                          const newShifts = [...eventData.schedule.shifts];
                          newShifts[index] = { ...shift, startTime: e.target.value };
                          setEventData(prev => ({
                            ...prev,
                            schedule: { ...prev.schedule, shifts: newShifts }
                          }));
                        }}
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Label htmlFor={`shift-end-${index}`}>Shift End Time</Label>
                        <Input
                          id={`shift-end-${index}`}
                          type="time"
                          value={shift.endTime}
                          onChange={(e) => {
                            const newShifts = [...eventData.schedule.shifts];
                            newShifts[index] = { ...shift, endTime: e.target.value };
                            setEventData(prev => ({
                              ...prev,
                              schedule: { ...prev.schedule, shifts: newShifts }
                            }));
                          }}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newShifts = eventData.schedule.shifts.filter((_, i) => i !== index);
                          setEventData(prev => ({
                            ...prev,
                            schedule: { ...prev.schedule, shifts: newShifts }
                          }));
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    // Default to event start/end times for new shift
                    const newShift: Shift = {
                      name: "",
                      startTime: eventData.schedule.startTime,
                      endTime: eventData.schedule.endTime
                    };
                    setEventData(prev => ({
                      ...prev,
                      schedule: {
                        ...prev.schedule,
                        shifts: [...prev.schedule.shifts, newShift]
                      }
                    }));
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Shift
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  Note: Shifts will apply to all days of the event.
                </p>
              </div>
            )}

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
              <div className="flex items-center space-x-2">
                <Switch
                  id="hasTeams"
                  checked={eventData.hasTeams}
                  onCheckedChange={(checked) => setEventData(prev => ({
                    ...prev,
                    hasTeams: checked
                  }))}
                />
                <Label htmlFor="hasTeams">Organize staff into specific teams for this event</Label>
              </div>
              
              {eventData.hasTeams ? (
                // Team-based organization (new UI)
                <div className="space-y-6 border p-4 rounded-md">
                  <h3 className="font-medium">Define Teams and Their Staffing</h3>
                  <p className="text-sm text-gray-500">
                    First, create teams with distinct names. Then, define the roles and staff counts needed within each team.
                    Don't forget to include a "Team Supervisor" role for each team that needs leadership.
                  </p>
                  
                  {/* Team List */}
                  {eventData.teams.map((team, teamIndex) => (
                    <div key={team.id} className="border rounded-md p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <Label htmlFor={`team-name-${teamIndex}`}>Team Name</Label>
                          <Input
                            id={`team-name-${teamIndex}`}
                            value={team.name}
                            onChange={(e) => {
                              const newTeams = [...eventData.teams];
                              newTeams[teamIndex] = { ...team, name: e.target.value };
                              setEventData(prev => ({
                                ...prev,
                                teams: newTeams
                              }));
                            }}
                            placeholder="e.g., Gate Scanners, VIP Hospitality"
                            className="mt-1"
                          />
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newTeams = eventData.teams.filter((_, i) => i !== teamIndex);
                            setEventData(prev => ({
                              ...prev,
                              teams: newTeams
                            }));
                          }}
                          className="text-red-500 hover:text-red-700 ml-4 mt-6"
                        >
                          Remove Team
                        </Button>
                      </div>
                      
                      {/* Roles within this team */}
                      <div className="space-y-4 mt-4">
                        <h4 className="font-medium text-sm">Roles & Staff for {team.name || "This Team"}</h4>
                        
                        {team.roles.map((role, roleIndex) => (
                          <div key={role.id} className="flex flex-col gap-2 pl-4 border-l-2 border-gray-200">
                            <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <Label>Role Name</Label>
                    <Input
                      value={role.name}
                      onChange={(e) => {
                                    const newTeams = [...eventData.teams];
                                    const newRoles = [...team.roles];
                                    newRoles[roleIndex] = { ...role, name: e.target.value };
                                    newTeams[teamIndex] = { ...team, roles: newRoles };
                                    setEventData(prev => ({ ...prev, teams: newTeams }));
                                  }}
                                  placeholder="e.g., Team Supervisor, Usher, Greeter"
                    />
                  </div>
                              
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  const newTeams = [...eventData.teams];
                                  const newRoles = team.roles.filter((_, i) => i !== roleIndex);
                                  newTeams[teamIndex] = { ...team, roles: newRoles };
                                  setEventData(prev => ({ ...prev, teams: newTeams }));
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                            
                            {/* Staff Count - Either global or per-shift based on event configuration */}
                            {eventData.schedule.hasShifts ? (
                              // Show staff count inputs for each shift
                              <div className="space-y-3 bg-gray-50 p-3 rounded-md">
                                <Label className="font-medium text-sm">Staff Count per Shift</Label>
                                {eventData.schedule.shifts.map((shift, shiftIndex) => {
                                  const shiftId = shift.name || `shift-${shiftIndex}`;
                                  const staffCount = role.shiftStaffCounts?.[shiftId] || 0;
                                  
                                  return (
                                    <div key={shiftIndex} className="flex items-center gap-2">
                                      <Label className="w-32 text-sm">
                                        {shift.name || `Shift ${shiftIndex + 1}`}:
                                      </Label>
                                      <Input
                                        type="number"
                                        min="0"
                                        value={staffCount}
                                        onChange={(e) => {
                                          const newTeams = [...eventData.teams];
                                          const newRoles = [...team.roles];
                                          
                                          // Initialize shiftStaffCounts if needed
                                          if (!newRoles[roleIndex].shiftStaffCounts) {
                                            newRoles[roleIndex].shiftStaffCounts = {};
                                          }
                                          
                                          // Update the staff count for this shift
                                          newRoles[roleIndex].shiftStaffCounts = {
                                            ...newRoles[roleIndex].shiftStaffCounts,
                                            [shiftId]: parseInt(e.target.value) || 0
                                          };
                                          
                                          newTeams[teamIndex] = { ...team, roles: newRoles };
                                          setEventData(prev => ({ ...prev, teams: newTeams }));
                                        }}
                                        className="w-20"
                                      />
                                      <span className="text-xs text-gray-500">staff needed</span>
                                    </div>
                                  );
                                })}
                                <p className="text-xs text-gray-500 mt-1">
                                  Set how many staff members are needed for this role in each shift
                                </p>
                              </div>
                            ) : (
                              // Single staff count input for the entire event
                              <div className="ml-4 flex items-center gap-2">
                  <div className="w-32">
                    <Label>Staff Count</Label>
                    <Input
                      type="number"
                      min="1"
                      value={role.staffCount}
                                    onChange={(e) => {
                                      const newTeams = [...eventData.teams];
                                      const newRoles = [...team.roles];
                                      newRoles[roleIndex] = { ...role, staffCount: parseInt(e.target.value) };
                                      newTeams[teamIndex] = { ...team, roles: newRoles };
                                      setEventData(prev => ({ ...prev, teams: newTeams }));
                                    }}
                                  />
                                </div>
                                <span className="text-xs text-gray-500 mb-2">staff needed overall</span>
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {/* Suggested Roles */}
                        {team.roles.length === 0 && (
                          <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700 mb-2">
                            <p className="font-medium">Suggested Roles:</p>
                            <p>Start by adding a "Team Supervisor" role with a staff count of 1.</p>
                            <p>Then add the other roles needed for this team.</p>
                          </div>
                        )}
                        
                        {/* Add Role to Team Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Check if there's already a Team Supervisor role
                            const hasSupervisorRole = team.roles.some(r => 
                              r.name.toLowerCase().includes("supervisor") || 
                              r.name.toLowerCase().includes("leader") || 
                              r.name.toLowerCase().includes("captain")
                            );
                            
                            // Suggested Team Supervisor as first role if none exists
                            const newRole = { 
                              id: Math.random().toString(), 
                              name: hasSupervisorRole ? "" : "Team Supervisor", 
                              staffCount: 1,
                              shiftStaffCounts: eventData.schedule.hasShifts 
                                ? eventData.schedule.shifts.reduce((acc, shift, idx) => {
                                    const shiftId = shift.name || `shift-${idx}`;
                                    acc[shiftId] = 1; // Default 1 staff per shift
                                    return acc;
                                  }, {} as { [shiftId: string]: number })
                                : undefined,
                              assignedStaff: [],
                              teamId: team.id
                            };
                            
                            const newTeams = [...eventData.teams];
                            newTeams[teamIndex] = { 
                              ...team, 
                              roles: [...team.roles, newRole] 
                            };
                            setEventData(prev => ({ ...prev, teams: newTeams }));
                          }}
                          className="ml-4"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Role to this Team
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add Team Button */}
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newTeam: Team = {
                        id: Math.random().toString(), // In a real app, this would be generated on the server
                        name: "",
                        roles: []
                      };
                      setEventData(prev => ({
                        ...prev,
                        teams: [...prev.teams, newTeam]
                      }));
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Team
                  </Button>
                </div>
              ) : (
                // Original UI for global roles (no teams)
                <div className="space-y-4">
                  {eventData.roles.map((role, index) => (
                    <div key={role.id} className="flex flex-col gap-2">
                      <div className="flex items-end gap-4">
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
                      
                      {/* Staff Count - Either global or per-shift based on event configuration */}
                      {eventData.schedule.hasShifts ? (
                        // Show staff count inputs for each shift
                        <div className="space-y-3 bg-gray-50 p-3 rounded-md ml-4">
                          <Label className="font-medium text-sm">Staff Count per Shift</Label>
                          {eventData.schedule.shifts.map((shift, shiftIndex) => {
                            const shiftId = shift.name || `shift-${shiftIndex}`;
                            const staffCount = role.shiftStaffCounts?.[shiftId] || 0;
                            
                            return (
                              <div key={shiftIndex} className="flex items-center gap-2">
                                <Label className="w-32 text-sm">
                                  {shift.name || `Shift ${shiftIndex + 1}`}:
                                </Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={staffCount}
                                  onChange={(e) => {
                                    const newRoles = [...eventData.roles];
                                    
                                    // Initialize shiftStaffCounts if needed
                                    if (!newRoles[index].shiftStaffCounts) {
                                      newRoles[index].shiftStaffCounts = {};
                                    }
                                    
                                    // Update the staff count for this shift
                                    newRoles[index].shiftStaffCounts = {
                                      ...newRoles[index].shiftStaffCounts,
                                      [shiftId]: parseInt(e.target.value) || 0
                                    };
                                    
                                    setEventData(prev => ({ ...prev, roles: newRoles }));
                                  }}
                                  className="w-20"
                                />
                                <span className="text-xs text-gray-500">staff needed</span>
                              </div>
                            );
                          })}
                          <p className="text-xs text-gray-500 mt-1">
                            Set how many staff members are needed for this role in each shift
                          </p>
                        </div>
                      ) : (
                        // Single staff count input for the entire event
                        <div className="ml-4 flex items-center gap-2">
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
                          <span className="text-xs text-gray-500">staff needed overall</span>
                        </div>
                      )}
                </div>
              ))}

              <Button
                variant="outline"
                    onClick={() => {
                      const newRole = {
                        id: Math.random().toString(), 
                        name: "", 
                        staffCount: 1,
                        shiftStaffCounts: eventData.schedule.hasShifts 
                          ? eventData.schedule.shifts.reduce((acc, shift, idx) => {
                              const shiftId = shift.name || `shift-${idx}`;
                              acc[shiftId] = 1; // Default 1 staff per shift
                              return acc;
                            }, {} as { [shiftId: string]: number })
                          : undefined,
                        assignedStaff: [] 
                      };
                      
                      setEventData(prev => ({
                  ...prev,
                        roles: [...prev.roles, newRole]
                      }));
                    }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Role
              </Button>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {eventData.hasTeams ? (
              // Team-based staff assignment UI
              <div>
                <h3 className="font-medium mb-4">Assign Staff to Teams</h3>
                {eventData.teams.map((team, teamIndex) => (
                  <div key={team.id} className="border rounded-md p-4 mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">{team.name}</h4>
                    </div>
                    
                    {team.roles.map((role, roleIndex) => {
                      // Check if this is a supervisory role
                      const isSupervisorRole = role.name.toLowerCase().includes('supervisor') || 
                                              role.name.toLowerCase().includes('leader') || 
                                              role.name.toLowerCase().includes('captain');
                      
                      return (
                        <div key={role.id} className="mb-6 pl-4 border-l-2 border-gray-200">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="font-medium">{role.name}</h5>
                          </div>
                          
                          {eventData.schedule.hasShifts ? (
                            // Shift-specific staff assignments
                            <div className="space-y-4">
                              {eventData.schedule.shifts.map((shift, shiftIndex) => {
                                const shiftId = shift.name || `shift-${shiftIndex}`;
                                const staffCount = role.shiftStaffCounts?.[shiftId] || 0;
                                
                                // Skip shifts with no staff requirement
                                if (staffCount === 0) return null;
                                
                                // Get staff assigned to this role for this shift
                                const assignedStaff = role.assignedStaff.filter(
                                  staff => staff.shiftId === shiftId
                                );
                                
                                return (
                                  <div key={shiftIndex} className="bg-gray-50 p-3 rounded-md">
                                    <div className="flex justify-between items-center mb-2">
                                      <h6 className="font-medium text-sm">
                                        {shift.name || `Shift ${shiftIndex + 1}`} ({shift.startTime} - {shift.endTime})
                                      </h6>
                                      <p className="text-sm text-gray-600">
                                        {assignedStaff.length}/{staffCount} assigned
                                      </p>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      {assignedStaff.map((staff, staffIndex) => (
                                        <div key={staffIndex} className="flex items-center gap-4">
                                          <div className="flex-1">
                                            <Input value={staff.name} disabled />
                                          </div>
                                          
                                          {/* Grant Supervisor Access Button (only for supervisor roles) */}
                                          {isSupervisorRole && (
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => handleGenerateToken(team, staff)}
                                              className="mr-2"
                                            >
                                              <Share2 className="h-4 w-4 mr-2" />
                                              Grant Access
                                            </Button>
                                          )}
                                          
                                          <Button
                                            variant="ghost"
                                            onClick={() => {
                                              const newTeams = [...eventData.teams];
                                              const newRoles = [...team.roles];
                                              newRoles[roleIndex].assignedStaff = role.assignedStaff.filter(
                                                s => !(s.id === staff.id && s.shiftId === shiftId)
                                              );
                                              newTeams[teamIndex] = { ...team, roles: newRoles };
                                              setEventData(prev => ({ ...prev, teams: newTeams }));
                                            }}
                                          >
                                            Remove
                                          </Button>
                                        </div>
                                      ))}
                                      
                                      {assignedStaff.length < staffCount && (
                                        <div className="flex flex-col gap-2">
                                          <Label>Assign Staff to {role.name} for {shift.name || `Shift ${shiftIndex + 1}`}</Label>
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
                                                const newTeams = [...eventData.teams];
                                                const newRoles = [...team.roles];
                                                newRoles[roleIndex].assignedStaff.push({
                                                  ...staff,
                                                  teamId: team.id,
                                                  shiftId: shiftId
                                                });
                                                newTeams[teamIndex] = { ...team, roles: newRoles };
                                                setEventData(prev => ({ ...prev, teams: newTeams }));
                                                setStaffSearch("");
                                                
                                                const message = isSupervisorRole
                                                  ? `${staff.name} assigned as supervisor for ${team.name} (${shift.name || `Shift ${shiftIndex + 1}`}). You can now grant them access.`
                                                  : `${staff.name} assigned as ${role.name} in team ${team.name} for ${shift.name || `Shift ${shiftIndex + 1}`}`;
                                                
                                                toast({ 
                                                  title: "Staff assigned successfully",
                                                  description: message
                                                });
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
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            // Non-shift staff assignments (original UI)
                            <div className="space-y-2">
                              {role.assignedStaff.map((staff, staffIndex) => (
                                <div key={staffIndex} className="flex items-center gap-4">
                                  <div className="flex-1">
                                    <Input value={staff.name} disabled />
                                  </div>
                                  
                                  {/* Grant Supervisor Access Button (only for supervisor roles) */}
                                  {isSupervisorRole && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleGenerateToken(team, staff)}
                                      className="mr-2"
                                    >
                                      <Share2 className="h-4 w-4 mr-2" />
                                      Grant Access
                                    </Button>
                                  )}
                                  
                                  <Button
                                    variant="ghost"
                                    onClick={() => {
                                      const newTeams = [...eventData.teams];
                                      const newRoles = [...team.roles];
                                      newRoles[roleIndex].assignedStaff = role.assignedStaff.filter(
                                        s => s.id !== staff.id
                                      );
                                      newTeams[teamIndex] = { ...team, roles: newRoles };
                                      setEventData(prev => ({ ...prev, teams: newTeams }));
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
                                        const newTeams = [...eventData.teams];
                                        const newRoles = [...team.roles];
                                        newRoles[roleIndex].assignedStaff.push({
                                          ...staff,
                                          role: role.name
                                        });
                                        newTeams[teamIndex] = { ...team, roles: newRoles };
                                        setEventData(prev => ({ ...prev, teams: newTeams }));
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
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Note about assigning supervisors */}
                    {!team.roles.some(r => 
                      r.name.toLowerCase().includes('supervisor') || 
                      r.name.toLowerCase().includes('leader') || 
                      r.name.toLowerCase().includes('captain')
                    ) && (
                      <div className="mt-4 bg-yellow-50 p-3 rounded-md">
                        <p className="text-sm text-yellow-700">
                          <strong>Note:</strong> This team doesn't have a supervisory role defined. 
                          Go back to Step 3 to add a "Team Supervisor" role if this team needs leadership.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              // Global roles (no teams) staff assignment UI
              <div className="space-y-6">
                {eventData.roles.map((role, index) => (
                  <div key={index} className="space-y-4">
                <h3 className="font-medium">{role.name}</h3>
                    
                    {eventData.schedule.hasShifts ? (
                      // Shift-specific staff assignments for global roles
                      <div className="space-y-4">
                        {eventData.schedule.shifts.map((shift, shiftIndex) => {
                          const shiftId = shift.name || `shift-${shiftIndex}`;
                          const staffCount = role.shiftStaffCounts?.[shiftId] || 0;
                          
                          // Skip shifts with no staff requirement
                          if (staffCount === 0) return null;
                          
                          // Get staff assigned to this role for this shift
                          const assignedStaff = role.assignedStaff.filter(
                            staff => staff.shiftId === shiftId
                          );
                          
                          return (
                            <div key={shiftIndex} className="bg-gray-50 p-3 rounded-md">
                              <div className="flex justify-between items-center mb-2">
                                <h6 className="font-medium text-sm">
                                  {shift.name || `Shift ${shiftIndex + 1}`} ({shift.startTime} - {shift.endTime})
                                </h6>
                                <p className="text-sm text-gray-600">
                                  {assignedStaff.length}/{staffCount} assigned
                                </p>
                              </div>
                              
                              <div className="space-y-2">
                                {assignedStaff.map((staff, staffIndex) => (
                                  <div key={staffIndex} className="flex items-center gap-4">
                                    <div className="flex-1">
                                      <Input value={staff.name} disabled />
                                    </div>
                                    <Button
                                      variant="ghost"
                                      onClick={() => {
                                        const newRoles = [...eventData.roles];
                                        newRoles[index].assignedStaff = role.assignedStaff.filter(
                                          s => !(s.id === staff.id && s.shiftId === shiftId)
                                        );
                                        setEventData(prev => ({ ...prev, roles: newRoles }));
                                      }}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                ))}
                                
                                {assignedStaff.length < staffCount && (
                                  <div className="flex flex-col gap-2">
                                    <Label>Assign Staff to {role.name} for {shift.name || `Shift ${shiftIndex + 1}`}</Label>
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
                                          newRoles[index].assignedStaff.push({
                                            ...staff,
                                            role: role.name,
                                            shiftId: shiftId
                                          });
                                          setEventData(prev => ({ ...prev, roles: newRoles }));
                                          setStaffSearch("");
                                          toast({ 
                                            title: "Staff assigned successfully",
                                            description: `${staff.name} assigned as ${role.name} for ${shift.name || `Shift ${shiftIndex + 1}`}`
                                          });
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
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      // Non-shift staff assignments for global roles (original UI)
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
                                newRoles[index].assignedStaff = role.assignedStaff.filter((_, i) => i !== staffIndex);
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
                                  newRoles[index].assignedStaff.push({
                                    ...staff,
                                    role: role.name
                                  });
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
                    </div>
                  )}
                      </div>
                    )}
                  </div>
                ))}
                
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
                          // Implementation would depend on which role we're adding staff to
                            setShowNewStaffDialog(false);
                            setStaffSearch("");
                          toast({ title: "Staff added successfully" });
                          }}
                        >
                          Add Staff
                        </Button>
                      </div>
                    <DialogFooter>
                      <Button 
                        variant="secondary" 
                        onClick={() => setShowNewStaffDialog(false)}
                      >
                        Close
                      </Button>
                    </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
            )}
            
            {/* Supervisor Access Token Dialog */}
            <Dialog open={showTokenDialog} onOpenChange={setShowTokenDialog}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {currentTeam?.name ? `Grant Access to ${currentTeam.name} Supervisor` : 'Grant Supervisor Access'}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  {isGeneratingToken ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Spinner className="h-8 w-8 mb-4" />
                      <p>Generating access token...</p>
              </div>
                  ) : accessToken ? (
                    <div className="space-y-4">
                      <div>
                        <Label>Access Token</Label>
                        <div className="flex mt-1">
                          <Input 
                            value={accessToken.accessToken} 
                            readOnly 
                            className="flex-1 font-mono text-sm"
                          />
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="ml-2" 
                            onClick={handleCopyToken}
                          >
                            {copySuccess ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          This token will expire on {format(new Date(accessToken.expiresAt), "PPP")}
                        </p>
                      </div>
                      
                      <div>
                        <Label>Share with Supervisor</Label>
                        <p className="text-sm text-gray-500 mt-1">
                          Send this token to the supervisor via WhatsApp to grant them access to manage their team.
                        </p>
                        <Button 
                          variant="default" 
                          className="mt-2 w-full" 
                          onClick={handleShareViaWhatsApp}
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Share via WhatsApp
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center text-gray-500">
                      No access token generated yet.
                    </div>
                  )}
                </div>
                
                <DialogFooter className="sm:justify-end">
                  <Button 
                    variant="secondary" 
                    onClick={() => setShowTokenDialog(false)}
                  >
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                  <span className="text-sm text-gray-500">Check-in Radius:</span>
                  <p>{eventData.geofence.radiusMeters} meters</p>
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
                {eventData.schedule.hasShifts && (
                  <div>
                    <span className="text-sm text-gray-500">Shifts:</span>
                    <div className="pl-4">
                      {eventData.schedule.shifts.map((shift, index) => (
                        <p key={index} className="text-sm">
                          {shift.name ? `${shift.name}: ` : `Shift ${index + 1}: `}
                          {shift.startTime} - {shift.endTime}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {eventData.hasTeams ? (
              // Team-based organization review
              <div className="space-y-4">
                <h3 className="font-medium">Team Organization</h3>
                {eventData.teams.map((team, teamIndex) => (
                  <div key={teamIndex} className="border rounded-md p-4 mb-4">
                    <h4 className="font-medium mb-3">{team.name}</h4>
                    
                    <div className="space-y-3 pl-4 mt-4">
                      <h5 className="text-sm font-medium">Team Members:</h5>
                      
                      {team.roles.map((role, roleIndex) => {
                        const isSupervisorRole = role.name.toLowerCase().includes('supervisor') || 
                                               role.name.toLowerCase().includes('leader') || 
                                               role.name.toLowerCase().includes('captain');
                        
                        return (
                          <div 
                            key={roleIndex} 
                            className={`pl-4 border-l-2 ${isSupervisorRole ? 'border-blue-200' : 'border-gray-200'}`}
                          >
                            <p className={`font-medium ${isSupervisorRole ? 'text-blue-700' : ''}`}>
                              {role.name}
                            </p>
                            
                            {/* Show staff requirements based on shifts or overall */}
                            {eventData.schedule.hasShifts ? (
                              <div className="pl-4 text-sm text-gray-600">
                                <p>Staff requirements per shift:</p>
                                <ul className="list-disc pl-5">
                                  {eventData.schedule.shifts.map((shift, shiftIndex) => {
                                    const shiftId = shift.name || `shift-${shiftIndex}`;
                                    const staffCount = role.shiftStaffCounts?.[shiftId] || 0;
                                    
                                    return (
                                      <li key={shiftIndex}>
                                        {shift.name || `Shift ${shiftIndex + 1}`}: {role.assignedStaff.filter(s => 
                                          s.shiftId === shiftId).length}/{staffCount} assigned
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            ) : (
                              <p className="pl-4 text-sm text-gray-600">
                                {role.assignedStaff.length}/{role.staffCount} assigned
                              </p>
                            )}
                            
                            <div className="pl-4">
                              {eventData.schedule.hasShifts ? (
                                // Group staff by shift
                                eventData.schedule.shifts.map((shift, shiftIndex) => {
                                  const shiftId = shift.name || `shift-${shiftIndex}`;
                                  const staffForShift = role.assignedStaff.filter(s => s.shiftId === shiftId);
                                  
                                  if (staffForShift.length === 0) return null;
                                  
                                  return (
                                    <div key={shiftIndex} className="mb-2">
                                      <p className="text-xs text-gray-500">{shift.name || `Shift ${shiftIndex + 1}`}:</p>
                                      {staffForShift.map((staff, staffIndex) => (
                                        <p 
                                          key={staffIndex} 
                                          className={`text-sm ${isSupervisorRole ? 'text-blue-600' : 'text-gray-600'}`}
                                        >
                                          {staff.name}
                                        </p>
                                      ))}
                                    </div>
                                  );
                                })
                              ) : (
                                // List all staff
                                role.assignedStaff.map((staff, staffIndex) => (
                                  <p 
                                    key={staffIndex} 
                                    className={`text-sm ${isSupervisorRole ? 'text-blue-600' : 'text-gray-600'}`}
                                  >
                                    {staff.name}
                                  </p>
                                ))
                              )}
                              
                              {role.assignedStaff.length === 0 && (
                                <p className="text-sm text-gray-400 italic">No staff assigned</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      
                      {team.roles.length === 0 && (
                        <p className="text-sm text-gray-400 italic pl-4">No roles defined for this team</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Original global roles review
              <div className="space-y-4">
                <h3 className="font-medium">Roles and Staff</h3>
                {eventData.roles.map((role, index) => (
                  <div key={index} className="space-y-2">
                    <p className="font-medium">{role.name}</p>
                    
                    {/* Show staff requirements based on shifts or overall */}
                    {eventData.schedule.hasShifts ? (
                      <div className="pl-4 text-sm text-gray-600">
                        <p>Staff requirements per shift:</p>
                        <ul className="list-disc pl-5">
                          {eventData.schedule.shifts.map((shift, shiftIndex) => {
                            const shiftId = shift.name || `shift-${shiftIndex}`;
                            const staffCount = role.shiftStaffCounts?.[shiftId] || 0;
                            
                            return (
                              <li key={shiftIndex}>
                                {shift.name || `Shift ${shiftIndex + 1}`}: {role.assignedStaff.filter(s => 
                                  s.shiftId === shiftId).length}/{staffCount} assigned
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ) : (
                      <p className="pl-4 text-sm text-gray-600">
                        {role.assignedStaff.length}/{role.staffCount} assigned
                      </p>
                    )}
                    
                    <div className="pl-4">
                      {eventData.schedule.hasShifts ? (
                        // Group staff by shift
                        eventData.schedule.shifts.map((shift, shiftIndex) => {
                          const shiftId = shift.name || `shift-${shiftIndex}`;
                          const staffForShift = role.assignedStaff.filter(s => s.shiftId === shiftId);
                          
                          if (staffForShift.length === 0) return null;
                          
                          return (
                            <div key={shiftIndex} className="mb-2">
                              <p className="text-xs text-gray-500">{shift.name || `Shift ${shiftIndex + 1}`}:</p>
                              {staffForShift.map((staff, staffIndex) => (
                                <p key={staffIndex} className="text-sm text-gray-600">
                                  {staff.name}
                                </p>
                              ))}
                            </div>
                          );
                        })
                      ) : (
                        // List all staff
                        role.assignedStaff.map((staff, staffIndex) => (
                          <p key={staffIndex} className="text-sm text-gray-600">
                            {staff.name}
                          </p>
                        ))
                      )}
                      
                      {role.assignedStaff.length === 0 && (
                        <p className="text-sm text-gray-400 italic">No staff assigned</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 6:
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
                  <span className="text-sm text-gray-500">Check-in Radius:</span>
                  <p>{eventData.geofence.radiusMeters} meters</p>
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
                {eventData.schedule.hasShifts && (
                  <div>
                    <span className="text-sm text-gray-500">Shifts:</span>
                    <div className="pl-4">
                      {eventData.schedule.shifts.map((shift, index) => (
                        <p key={index} className="text-sm">
                          {shift.name ? `${shift.name}: ` : `Shift ${index + 1}: `}
                          {shift.startTime} - {shift.endTime}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {eventData.hasTeams && eventData.teams.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium">Team Organization</h3>
                <div className="pl-4">
                  {eventData.teams.map((team, index) => {
                    // Find supervisor role for this team
                    const supervisorRole = team.roles.find(role => 
                      role.name.toLowerCase().includes('supervisor') || 
                      role.name.toLowerCase().includes('leader') || 
                      role.name.toLowerCase().includes('captain')
                    );
                    
                    // Get the first assigned supervisor staff if any
                    const supervisorStaff = supervisorRole?.assignedStaff[0];
                    
                    return (
                      <div key={index} className="mb-2">
                        <p className="font-medium">{team.name}</p>
                        <p className="text-sm text-gray-600 pl-4">
                          Supervisor: {supervisorStaff ? supervisorStaff.name : "Not assigned"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="font-medium">Roles and Staff</h3>
              {eventData.roles.map((role, index) => (
                <div key={index} className="space-y-2">
                  <p className="font-medium">{role.name}</p>
                  <div className="pl-4">
                    {role.assignedStaff.map((staff, staffIndex) => (
                      <p key={staffIndex} className="text-sm text-gray-600">
                        {staff.name}
                        {staff.teamId && eventData.hasTeams && (
                          <span className="ml-2 text-blue-500">
                            (Team: {eventData.teams.find(t => t.id === staff.teamId)?.name || "Unknown"})
                          </span>
                        )}
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

  // Update the final button text based on edit mode
  const finalButtonText = isEditMode ? "Update Event" : "Create Event";

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {isEditMode ? "Edit Event" : "Create New Event"}
          </CardTitle>
          {!isEditMode && hasDraft && (
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1 text-gray-500 hover:text-red-500"
              onClick={() => setShowDraftDialog(true)}
            >
              <span className="text-xs">Saved Draft</span>
            </Button>
          )}
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
              <div className="flex gap-2">
                {currentStep === 1 ? (
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleBack}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                )}
                
                {/* Save as Draft button - always visible */}
                <Button
                  variant="secondary"
                  onClick={handleSaveAsDraft}
                  disabled={isSaving}
                  className="gap-2"
                >
                  {isSaving ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  Save as Draft
                </Button>
              </div>

              {currentStep === steps.length ? (
                <Button
                  onClick={handleCreateEvent}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <Spinner className="mr-2 h-4 w-4" />
                  ) : isEditMode ? "Update Event" : "Create Event"}
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

      {/* Draft Dialog */}
      <Dialog open={showDraftDialog} onOpenChange={setShowDraftDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resume Draft?</DialogTitle>
            <DialogDescription>
              You have an unfinished event draft. Would you like to resume editing it or start a new event?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {draftData && (
              <div className="border rounded-md p-3 bg-gray-50">
                <p className="font-medium">{draftData.eventData.name || "Unnamed Event"}</p>
                <p className="text-sm text-gray-600">{draftData.eventData.location || "No location set"}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Last edited: {new Date(draftData.timestamp).toLocaleString()}
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="sm:justify-start gap-2">
            <Button 
              variant="default" 
              onClick={resumeDraft}
            >
              Resume Draft
            </Button>
            <Button 
              variant="outline" 
              onClick={discardDraft}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Discard Draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. If you leave now, your draft will be saved automatically. You can resume editing later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancel}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Event Creation Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-green-600">Event Created Successfully! 🎉</DialogTitle>
            <DialogDescription className="text-center">
              Your event "{createdEvent?.data.name}" has been created and is ready to go.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-3 py-4">
            <Button 
              onClick={handleAddToCalendarFromSuccess}
              className="flex items-center gap-2"
              variant="outline"
            >
              <CalendarPlus className="h-4 w-4" />
              Add to Calendar
            </Button>
            
            <Button 
              onClick={handleSuccessDialogComplete}
              className="flex items-center gap-2"
            >
              Continue to Events
            </Button>
          </div>
          
          <DialogFooter className="sm:justify-center">
            <p className="text-xs text-gray-500 text-center">
              You can always add this event to your calendar later from the event details page.
            </p>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
