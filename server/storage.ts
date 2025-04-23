import { User, Event, StaffAssignment, InsertUser, InsertEvent, InsertStaffAssignment, CheckIn } from "@shared/schema";
import { nanoid } from "nanoid";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private events: Map<number, Event>;
  private staffAssignments: Map<number, StaffAssignment>;
  sessionStore: session.SessionStore;
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

    // Add a sample organizer account for testing
    this.createUser({
      email: "organizer@example.com",
      phone: "+971501234567",
      name: "Test Organizer",
      password: "password123", // This will be hashed in auth.ts
      role: "organizer",
      profileImage: "",
      confirmPassword: "password123"
    });
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
      role: userData.role || "staff",
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
