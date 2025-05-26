/**
 * Attendance-related API functions
 */

import { apiRequest } from "@/lib/queryClient";

/**
 * Staff check-in interface
 */
export interface CheckInRequest {
  staffId: number;
  eventId: number;
  image?: string;
  location: { 
    latitude: number; 
    longitude: number;
  };
}

export interface CheckInResponse {
  success: boolean;
  staffId: number;
  eventId: number;
  checkInTime: string;
  message: string;
}

/**
 * Staff clock-out interface
 */
export interface ClockOutRequest {
  staffId: number;
  eventId: number;
  image?: string;
  location: { 
    latitude: number; 
    longitude: number;
  };
}

export interface ClockOutResponse {
  success: boolean;
  staffId: number;
  eventId: number;
  checkInTime: string;
  clockOutTime: string;
  shiftDuration: {
    hours: number;
    minutes: number;
  };
  message: string;
}

/**
 * Check in a staff member for an event
 */
export async function checkIn(data: CheckInRequest): Promise<CheckInResponse> {
  try {
    // For demo purposes, simulate a successful API call
    // In a real app, this would be an actual API request using apiRequest
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return a mock successful response
    return {
      success: true,
      staffId: data.staffId,
      eventId: data.eventId,
      checkInTime: new Date().toISOString(),
      message: "Check-in successful"
    };
  } catch (error) {
    console.error("Error during check-in:", error);
    throw new Error("Failed to check in. Please try again.");
  }
}

/**
 * Clock out a staff member from an event
 */
export async function clockOut(data: ClockOutRequest): Promise<ClockOutResponse> {
  try {
    // For demo purposes, simulate a successful API call
    // In a real app, this would be an actual API request using apiRequest
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Get check-in time from sessionStorage
    let checkInTime = new Date().toISOString();
    try {
      const storedData = sessionStorage.getItem('checkInData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        if (parsedData.checkInTime) {
          checkInTime = parsedData.checkInTime;
        }
      }
    } catch (error) {
      console.error("Error retrieving check-in time:", error);
    }
    
    // Calculate shift duration
    const checkInDate = new Date(checkInTime);
    const clockOutDate = new Date();
    const durationMs = clockOutDate.getTime() - checkInDate.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    // Return a mock successful response
    return {
      success: true,
      staffId: data.staffId,
      eventId: data.eventId,
      checkInTime: checkInTime,
      clockOutTime: clockOutDate.toISOString(),
      shiftDuration: {
        hours,
        minutes
      },
      message: "Clock-out successful"
    };
  } catch (error) {
    console.error("Error during clock-out:", error);
    throw new Error("Failed to clock out. Please try again.");
  }
} 