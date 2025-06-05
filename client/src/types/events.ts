import { format } from "date-fns";

export interface Role {
  id: string;
  name: string;
  staffCount: number; // Used when event has no shifts
  shiftStaffCounts?: { [shiftId: string]: number }; // Maps shift ID to staff count when event has shifts
  assignedStaff: Staff[];
  teamId?: string; // Optional team ID for when teams are used
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  contactInfo: string;
  teamId?: string; // Optional team ID for staff assignment
  shiftId?: string; // Optional shift ID for when event has shifts
}

export interface Team {
  id: string;
  name: string;
  roles: Role[]; // Roles specific to this team
}

export interface Shift {
  name: string;
  startTime: string;
  endTime: string;
}

export interface EventSchedule {
  startTime: string;
  endTime: string;
  hasShifts: boolean;
  shifts: Shift[];
}

export interface EventData {
  name: string;
  location: string;
  isMultiDay: boolean;
  startDate: string;
  endDate: string;
  schedule: EventSchedule;
  description: string;
  roles: Role[]; // Global roles (used when hasTeams is false)
  hasTeams: boolean; // Flag to indicate if this event uses team organization
  teams: Team[]; // Array of teams for this event
  geofence: {
    latitude: number;
    longitude: number;
    radiusMeters: number;
  };
}

export const initialEventData: EventData = {
  name: "",
  location: "",
  isMultiDay: false,
  startDate: format(new Date(), "yyyy-MM-dd"),
  endDate: format(new Date(), "yyyy-MM-dd"),
  schedule: {
    startTime: "09:00",
    endTime: "17:00",
    hasShifts: false,
    shifts: [],
  },
  description: "",
  roles: [], // Global roles when hasTeams is false
  hasTeams: false,
  teams: [], // Teams with their own roles when hasTeams is true
  geofence: {
    latitude: 25.2048, // Default to Dubai coordinates
    longitude: 55.2708,
    radiusMeters: 100, // Default 100 meters
  },
}; 