import { generateEventICS, EventCalendarData } from './calendar';

// Simple test to verify ICS generation
async function testCalendarGeneration() {
  const testEvent: EventCalendarData = {
    id: 'test-event-123',
    name: 'Test Event',
    description: 'This is a test event for StaffLoop',
    location: 'Dubai World Trade Centre',
    startDateTime: '2024-01-15T09:00:00.000Z',
    endDateTime: '2024-01-15T17:00:00.000Z',
  };

  try {
    const icsContent = await generateEventICS(testEvent);
    console.log('✅ ICS generation successful!');
    console.log('Generated ICS content:');
    console.log(icsContent);
    return true;
  } catch (error) {
    console.error('❌ ICS generation failed:', error);
    return false;
  }
}

// Export the test function for use
export { testCalendarGeneration }; 