import { createEvent } from 'ics';

export interface EventCalendarData {
  id: string;
  name: string;
  description?: string;
  location: string;
  startDateTime: string; // ISO string format
  endDateTime: string; // ISO string format
}

/**
 * Generates and downloads an .ics calendar file for an event
 * @param event The event data to create a calendar entry for
 * @returns Promise that resolves when the download is initiated
 */
export const downloadEventICS = async (event: EventCalendarData): Promise<void> => {
  try {
    // Parse start and end date times
    const startDate = new Date(event.startDateTime);
    const endDate = new Date(event.endDateTime);

    // Convert to array format expected by ics library [year, month, day, hour, minute]
    const start: [number, number, number, number, number] = [
      startDate.getFullYear(),
      startDate.getMonth() + 1, // ics expects 1-based month
      startDate.getDate(),
      startDate.getHours(),
      startDate.getMinutes(),
    ];

    const end: [number, number, number, number, number] = [
      endDate.getFullYear(),
      endDate.getMonth() + 1, // ics expects 1-based month
      endDate.getDate(),
      endDate.getHours(),
      endDate.getMinutes(),
    ];

    // Create the event description with StaffLoop branding
    const description = [
      event.description || '',
      event.description ? '\n\n' : '',
      `View event details in StaffLoop: ${window.location.origin}/events/${event.id}/manage`,
    ].join('');

    // Generate the .ics content
    const icsContent = await new Promise<string>((resolve, reject) => {
      createEvent({
        title: event.name,
        description,
        location: event.location,
        start,
        end,
        status: 'CONFIRMED',
        busyStatus: 'BUSY',
        organizer: { name: 'StaffLoop', email: 'events@staffloop.com' },
        productId: 'staffloop/calendar',
        uid: `${event.id}@staffloop.com`, // Unique identifier
      }, (error, value) => {
        if (error) {
          reject(error);
        } else {
          resolve(value);
        }
      });
    });

    // Create blob and trigger download
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // Sanitize filename by replacing spaces and special characters
    const sanitizedName = event.name.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${sanitizedName}_StaffLoop_Event.ics`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the object URL
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Error generating calendar file:', error);
    throw new Error('Failed to generate calendar file. Please try again.');
  }
};

/**
 * Creates an .ics calendar event for the current event
 * @param event The event data
 * @returns Promise that resolves to the .ics content as a string
 */
export const generateEventICS = async (event: EventCalendarData): Promise<string> => {
  const startDate = new Date(event.startDateTime);
  const endDate = new Date(event.endDateTime);

  const start: [number, number, number, number, number] = [
    startDate.getFullYear(),
    startDate.getMonth() + 1,
    startDate.getDate(),
    startDate.getHours(),
    startDate.getMinutes(),
  ];

  const end: [number, number, number, number, number] = [
    endDate.getFullYear(),
    endDate.getMonth() + 1,
    endDate.getDate(),
    endDate.getHours(),
    endDate.getMinutes(),
  ];

  const description = [
    event.description || '',
    event.description ? '\n\n' : '',
    `View event details in StaffLoop: ${window.location.origin}/events/${event.id}/manage`,
  ].join('');

  return new Promise((resolve, reject) => {
    createEvent({
      title: event.name,
      description,
      location: event.location,
      start,
      end,
      status: 'CONFIRMED',
      busyStatus: 'BUSY',
      organizer: { name: 'StaffLoop', email: 'events@staffloop.com' },
      productId: 'staffloop/calendar',
      uid: `${event.id}@staffloop.com`,
    }, (error, value) => {
      if (error) {
        reject(error);
      } else {
        resolve(value);
      }
    });
  });
}; 