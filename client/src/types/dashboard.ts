export interface Event {
  id: number;
  name: string;
  date: string;
  location: string;
  status: 'draft' | 'upcoming' | 'ongoing' | 'ended';
  checkedInStaff: number;
  totalStaff: number;
}

export interface Staff {
  id: number;
  name: string;
  role: string;
  status: 'checked-in' | 'late' | 'absent';
  checkInTime?: string;
}

export interface CheckIn {
  id: number;
  staffId: number;
  eventId: number;
  timestamp: string;
  status: 'on-time' | 'late';
  staffName: string;
  staffRole: string;
}

export interface TimeRange {
  type: 'today' | 'week' | 'month' | 'custom';
  startDate?: string;
  endDate?: string;
}

export interface RoleStats {
  total: number;
  checkedIn: number;
}

export interface DashboardStats {
  totalStaff: number;
  checkedIn: number;
  late: number;
  absent: number;
  roleStats: Record<string, RoleStats>;
}

export interface EventTimelineItem {
  id: number;
  name: string;
  date: string;
  location: string;
  status: 'upcoming' | 'ongoing' | 'ended';
  checkedInStaff: number;
  totalStaff: number;
}

export interface CalendarEvent {
  id: number;
  title: string;
  start: string;
  end: string;
  location: string;
  status: 'upcoming' | 'ongoing' | 'ended';
} 