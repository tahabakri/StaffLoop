import { Event } from "@/types/dashboard";

// Base API URL - should be configured in environment variables in a real app
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

/**
 * Fetch events for a specific date range
 * @param startDate ISO date string for the start of the range
 * @param endDate ISO date string for the end of the range
 * @returns Promise with array of events
 */
export async function fetchEvents(startDate?: string, endDate?: string): Promise<Event[]> {
  // In a real implementation, this would make an API call with the date range
  // return fetch(`${API_BASE_URL}/events?startDate=${startDate}&endDate=${endDate}`)
  //   .then(res => {
  //     if (!res.ok) throw new Error("Failed to fetch events");
  //     return res.json();
  //   });

  // For now, return mock data
  // This would be replaced with real API call in production
  return Promise.resolve(MOCK_EVENTS);
}

/**
 * Fetch a single event by ID
 * @param eventId The event ID to fetch
 * @returns Promise with event data
 */
export async function fetchEventById(eventId: number): Promise<Event> {
  // In a real implementation, this would make an API call
  // return fetch(`${API_BASE_URL}/events/${eventId}`)
  //   .then(res => {
  //     if (!res.ok) throw new Error("Failed to fetch event");
  //     return res.json();
  //   });

  // For now, return mock data
  const event = MOCK_EVENTS.find(e => e.id === eventId);
  if (!event) {
    return Promise.reject(new Error("Event not found"));
  }
  return Promise.resolve(event);
}

// Mock events data for development
const MOCK_EVENTS: Event[] = [
  { 
    id: 1, 
    name: "Tech Conference 2025", 
    date: "2025-05-15", 
    location: "Dubai World Trade Centre", 
    status: "upcoming",
    checkedInStaff: 0,
    totalStaff: 25
  },
  { 
    id: 2, 
    name: "Summer Festival", 
    date: "2025-06-08", 
    location: "Alserkal Avenue, Dubai", 
    status: "upcoming",
    checkedInStaff: 0,
    totalStaff: 40
  },
  { 
    id: 3, 
    name: "Music Festival 2025", 
    date: "2025-10-15", 
    location: "Dubai Media City Amphitheatre", 
    status: "ongoing",
    checkedInStaff: 28,
    totalStaff: 50
  },
  { 
    id: 4, 
    name: "New Year's Eve Celebration", 
    date: "2025-12-31", 
    location: "Palm Jumeirah", 
    status: "upcoming",
    checkedInStaff: 0,
    totalStaff: 100
  },
  { 
    id: 5, 
    name: "Winter Market", 
    date: "2024-12-20", 
    location: "Madinat Jumeirah", 
    status: "ended",
    checkedInStaff: 75,
    totalStaff: 80
  },
  { 
    id: 6, 
    name: "Corporate Event Draft", 
    date: "2025-08-10", 
    location: "Dubai Marina", 
    status: "draft",
    checkedInStaff: 0,
    totalStaff: 0
  },
]; 