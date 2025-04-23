import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-AE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(time: Date | string): string {
  if (!time) return '';
  const d = typeof time === 'string' ? new Date(time) : time;
  return d.toLocaleTimeString('en-AE', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatTimeFromString(timeString: string): string {
  // Handle HH:MM format
  const [hours, minutes] = timeString.split(':').map(Number);
  
  if (isNaN(hours) || isNaN(minutes)) {
    return timeString;
  }
  
  const date = new Date();
  date.setHours(hours, minutes, 0);
  
  return date.toLocaleTimeString('en-AE', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function calculateTimeDifference(time1: string | Date, time2: string | Date): string {
  const date1 = typeof time1 === 'string' ? new Date(time1) : time1;
  const date2 = typeof time2 === 'string' ? new Date(time2) : time2;
  
  const diffMs = date1.getTime() - date2.getTime();
  const diffMins = Math.round(diffMs / 60000);
  
  if (diffMins === 0) {
    return 'On time';
  } else if (diffMins > 0) {
    return `${diffMins} ${diffMins === 1 ? 'min' : 'mins'} late`;
  } else {
    return `${Math.abs(diffMins)} ${Math.abs(diffMins) === 1 ? 'min' : 'mins'} early`;
  }
}

export function getInitials(name: string): string {
  if (!name) return '';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function isLateForEvent(eventStartTime: string, checkInTime: string): boolean {
  // Compare times - in a real app, would need proper date-time handling
  const eventStart = new Date(`2000-01-01 ${eventStartTime}`);
  const checkIn = new Date(`2000-01-01 ${checkInTime}`);
  
  return checkIn > eventStart;
}

// Calculate percentage with fixed decimal places
export function calculatePercentage(value: number, total: number, decimalPlaces = 0): number {
  if (total === 0) return 0;
  const percentage = (value / total) * 100;
  const factor = Math.pow(10, decimalPlaces);
  return Math.round(percentage * factor) / factor;
}
