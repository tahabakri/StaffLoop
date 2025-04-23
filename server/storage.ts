import { User, Event, StaffAssignment, InsertUser, InsertEvent, InsertStaffAssignment, CheckIn } from "@shared/schema";
import { nanoid } from "nanoid";
import session from "express-session";
import createMemoryStore from "memorystore";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const MemoryStore = createMemoryStore(session);

// Password hashing helpers
const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// The Storage Interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  listUsers(): Promise<User[]>;
  listStaffUsers(): Promise<User[]>;

  // Event methods
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent, organizerId: number): Promise<Event>;
  listEvents(organizerId?: number): Promise<Event[]>;
  updateEvent(id: number, event: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;

  // Assignment methods
  getStaffAssignment(id: number): Promise<StaffAssignment | undefined>;
  createStaffAssignment(assignment: InsertStaffAssignment): Promise<StaffAssignment>;
  listStaffAssignments(eventId?: number, staffId?: number): Promise<StaffAssignment[]>;
  checkInStaff(data: CheckIn): Promise<StaffAssignment | undefined>;
  
  // Session store for auth
  sessionStore: any;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private events: Map<number, Event>;
  private staffAssignments: Map<number, StaffAssignment>;
  sessionStore: any;
  private userIdCounter: number;
  private eventIdCounter: number;
  private assignmentIdCounter: number;

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.staffAssignments = new Map();
    this.userIdCounter = 1;
    this.eventIdCounter = 1;
    this.assignmentIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    this.initializeData();
  }

  private async initializeData() {
    // Hash the password before creating user
    const hashedOrganizerPassword = await hashPassword("password123");
    
    // Add a sample organizer account for testing
    const organizer = await this.createUser({
      email: "organizer@example.com",
      phone: "+971501234567",
      name: "Test Organizer",
      password: hashedOrganizerPassword,
      role: "organizer",
      profileImage: "",
      confirmPassword: "password123"
    });
    
    // Add mock events
    const event1 = await this.createEvent({
      name: "Tech Conference 2025",
      location: "Dubai World Trade Centre",
      date: new Date("2025-05-15"),
      startTime: "09:00",
      endTime: "18:00",
      description: "Annual technology conference featuring the latest innovations and industry leaders."
    }, organizer.id);
    
    // Create hashed passwords for staff users
    const hashedStaffPass1 = await hashPassword("staffpass1");
    const hashedStaffPass2 = await hashPassword("staffpass2");
    const hashedStaffPass3 = await hashPassword("staffpass3");
    const hashedStaffPass4 = await hashPassword("staffpass4");
    const hashedStaffPass5 = await hashPassword("staffpass5");
    
    // Add staff users
    const staffUsers = await Promise.all([
      this.createUser({
        email: "sarah@example.com",
        phone: "+971501234001",
        name: "Sarah Johnson",
        password: hashedStaffPass1,
        role: "staff",
        profileImage: "",
        confirmPassword: "staffpass1"
      }),
      this.createUser({
        email: "ahmed@example.com",
        phone: "+971501234002",
        name: "Ahmed Al-Farsi",
        password: hashedStaffPass2,
        role: "staff",
        profileImage: "",
        confirmPassword: "staffpass2"
      }),
      this.createUser({
        email: "priya@example.com",
        phone: "+971501234003",
        name: "Priya Sharma",
        password: hashedStaffPass3,
        role: "staff",
        profileImage: "",
        confirmPassword: "staffpass3"
      }),
      this.createUser({
        email: "michael@example.com",
        phone: "+971501234004",
        name: "Michael Wong",
        password: hashedStaffPass4,
        role: "staff",
        profileImage: "",
        confirmPassword: "staffpass4"
      }),
      this.createUser({
        email: "layla@example.com",
        phone: "+971501234005",
        name: "Layla Mubarak",
        password: hashedStaffPass5,
        role: "staff",
        profileImage: "",
        confirmPassword: "staffpass5"
      })
    ]);
    
    // Create staff assignments for event 1
    const assignments = await Promise.all([
      this.createStaffAssignment({
        eventId: event1.id,
        staffId: staffUsers[0].id,
        role: "Registration"
      }),
      this.createStaffAssignment({
        eventId: event1.id,
        staffId: staffUsers[1].id,
        role: "Security"
      }),
      this.createStaffAssignment({
        eventId: event1.id,
        staffId: staffUsers[2].id,
        role: "Technical Support"
      }),
      this.createStaffAssignment({
        eventId: event1.id,
        staffId: staffUsers[3].id,
        role: "Catering"
      }),
      this.createStaffAssignment({
        eventId: event1.id,
        staffId: staffUsers[4].id,
        role: "Host"
      })
    ]);
    
    // Simulate some check-ins
    const now = new Date();
    const assignment1 = assignments[0];
    const assignment2 = assignments[1];
    
    // Update assignment directly with check-in data
    this.staffAssignments.set(assignment1.id, {
      ...assignment1,
      checkInTime: new Date(now.getTime() - 30 * 60000), // 30 minutes ago
      checkInImage: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDAiIGZpbGw9IiNlMmU4ZjAiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjM4IiByPSIxMiIgZmlsbD0iIzhiYTJiZiIvPjxwYXRoIGQ9Ik0yNSw4NSBDMjUsNjUgNzUsNjUgNzUsODUiIGZpbGw9IiM4YmEyYmYiLz48L3N2Zz4=",
      checkInLocation: { latitude: 25.197197, longitude: 55.274376 },
      isLate: false
    });
    
    this.staffAssignments.set(assignment2.id, {
      ...assignment2,
      checkInTime: new Date(now.getTime() - 10 * 60000), // 10 minutes ago
      checkInImage: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDAiIGZpbGw9IiNlMmU4ZjAiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjM4IiByPSIxMiIgZmlsbD0iIzhiYTJiZiIvPjxwYXRoIGQ9Ik0yNSw4NSBDMjUsNjUgNzUsNjUgNzUsODUiIGZpbGw9IiM4YmEyYmYiLz48L3N2Zz4=",
      checkInLocation: { latitude: 25.197225, longitude: 55.274399 },
      isLate: true
    });
    
    // Add another event
    await this.createEvent({
      name: "Art Exhibition Opening",
      location: "Alserkal Avenue, Dubai",
      date: new Date("2025-06-08"),
      startTime: "18:00",
      endTime: "22:00",
      description: "Opening night of the International Art Exhibition featuring artists from around the world."
    }, organizer.id);
    
    // Add a future event
    await this.createEvent({
      name: "Music Festival 2025",
      location: "Dubai Media City Amphitheatre",
      date: new Date("2025-10-15"),
      startTime: "16:00",
      endTime: "23:59",
      description: "Annual music festival featuring top local and international artists across multiple genres."
    }, organizer.id);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.phone === phone
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    
    const user: User = {
      id,
      email: userData.email,
      phone: userData.phone || "",
      name: userData.name,
      password: userData.password,
      role: (userData.role as "organizer" | "staff") || "staff",
      profileImage: userData.profileImage || "",
      createdAt,
    };

    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async listUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async listStaffUsers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === "staff");
  }

  // Event methods
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(eventData: InsertEvent, organizerId: number): Promise<Event> {
    const id = this.eventIdCounter++;
    const createdAt = new Date();
    
    const event: Event = {
      id,
      name: eventData.name,
      location: eventData.location,
      date: eventData.date,
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      description: eventData.description || "",
      organizerId,
      createdAt,
    };

    this.events.set(id, event);
    return event;
  }

  async listEvents(organizerId?: number): Promise<Event[]> {
    let events = Array.from(this.events.values());
    if (organizerId) {
      events = events.filter(event => event.organizerId === organizerId);
    }
    return events;
  }

  async updateEvent(id: number, eventData: Partial<Event>): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;

    const updatedEvent = { ...event, ...eventData };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }

  // Assignment methods
  async getStaffAssignment(id: number): Promise<StaffAssignment | undefined> {
    return this.staffAssignments.get(id);
  }

  async createStaffAssignment(assignmentData: InsertStaffAssignment): Promise<StaffAssignment> {
    const id = this.assignmentIdCounter++;
    const createdAt = new Date();
    
    const assignment: StaffAssignment = {
      id,
      eventId: assignmentData.eventId,
      staffId: assignmentData.staffId,
      role: assignmentData.role,
      checkInTime: null,
      checkInImage: "",
      checkInLocation: null,
      isLate: false,
      isAbsent: false,
      createdAt,
    };

    this.staffAssignments.set(id, assignment);
    return assignment;
  }

  async listStaffAssignments(eventId?: number, staffId?: number): Promise<StaffAssignment[]> {
    let assignments = Array.from(this.staffAssignments.values());
    if (eventId) {
      assignments = assignments.filter(assignment => assignment.eventId === eventId);
    }
    if (staffId) {
      assignments = assignments.filter(assignment => assignment.staffId === staffId);
    }
    return assignments;
  }

  async checkInStaff(data: CheckIn): Promise<StaffAssignment | undefined> {
    const assignments = Array.from(this.staffAssignments.values());
    const assignment = assignments.find(
      a => a.staffId === data.staffId && a.eventId === data.eventId
    );

    if (!assignment) return undefined;

    // Check if this event has an associated time
    const event = this.events.get(assignment.eventId);
    if (!event) return undefined;

    const now = new Date();
    const checkInTime = now;
    
    // Check if late (comparing to event start time)
    // This is a simplified version - in real app we'd need to parse time strings properly
    const isLate = false; // Just a placeholder - would need actual time comparison

    const updatedAssignment: StaffAssignment = {
      ...assignment,
      checkInTime,
      checkInImage: data.image,
      checkInLocation: data.location,
      isLate,
      isAbsent: false,
    };

    this.staffAssignments.set(assignment.id, updatedAssignment);
    return updatedAssignment;
  }
}

export const storage = new MemStorage();