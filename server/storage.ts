import { 
  User, Event, StaffAssignment, OnboardingSurvey, Payment, SupportTicket, 
  InsertUser, InsertEvent, InsertStaffAssignment, InsertOnboardingSurvey, InsertPayment, InsertSupportTicket,
  CheckIn, CheckOut
} from "@shared/schema";
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
  listOrganizerUsers(): Promise<User[]>;
  listPendingOrganizers(): Promise<User[]>;
  updateUserStatus(id: number, status: string): Promise<User | undefined>;
  updateStripeCustomerId(id: number, stripeId: string): Promise<User | undefined>;

  // Onboarding methods
  getOnboardingSurvey(id: number): Promise<OnboardingSurvey | undefined>;
  getOnboardingSurveyByUserId(userId: number): Promise<OnboardingSurvey | undefined>;
  createOnboardingSurvey(survey: InsertOnboardingSurvey): Promise<OnboardingSurvey>;
  updateOnboardingSurvey(id: number, survey: Partial<OnboardingSurvey>): Promise<OnboardingSurvey | undefined>;

  // Event methods
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent, organizerId: number): Promise<Event>;
  listEvents(organizerId?: number): Promise<Event[]>;
  listActiveEvents(organizerId?: number): Promise<Event[]>;
  updateEvent(id: number, event: Partial<Event>): Promise<Event | undefined>;
  activateEvent(id: number): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;

  // Assignment methods
  getStaffAssignment(id: number): Promise<StaffAssignment | undefined>;
  createStaffAssignment(assignment: InsertStaffAssignment): Promise<StaffAssignment>;
  listStaffAssignments(eventId?: number, staffId?: number): Promise<StaffAssignment[]>;
  checkInStaff(data: CheckIn): Promise<StaffAssignment | undefined>;
  checkOutStaff(data: CheckOut): Promise<StaffAssignment | undefined>;
  approveOverride(assignmentId: number, approverId: number): Promise<StaffAssignment | undefined>;
  
  // Payment methods
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentByEventId(eventId: number): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(id: number, status: string, stripeId?: string): Promise<Payment | undefined>;
  listPayments(organizerId?: number): Promise<Payment[]>;
  
  // Support methods
  getSupportTicket(id: number): Promise<SupportTicket | undefined>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  updateSupportTicket(id: number, ticket: Partial<SupportTicket>): Promise<SupportTicket | undefined>;
  assignSupportTicket(id: number, assigneeId: number): Promise<SupportTicket | undefined>;
  closeSupportTicket(id: number): Promise<SupportTicket | undefined>;
  listSupportTickets(userId?: number, assignedTo?: number): Promise<SupportTicket[]>;
  
  // Session store for auth
  sessionStore: any;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private events: Map<number, Event>;
  private staffAssignments: Map<number, StaffAssignment>;
  private onboardingSurveys: Map<number, OnboardingSurvey>;
  private payments: Map<number, Payment>;
  private supportTickets: Map<number, SupportTicket>;
  sessionStore: any;
  private userIdCounter: number;
  private eventIdCounter: number;
  private assignmentIdCounter: number;
  private surveyIdCounter: number;
  private paymentIdCounter: number;
  private ticketIdCounter: number;

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.staffAssignments = new Map();
    this.onboardingSurveys = new Map();
    this.payments = new Map();
    this.supportTickets = new Map();
    
    this.userIdCounter = 1;
    this.eventIdCounter = 1;
    this.assignmentIdCounter = 1;
    this.surveyIdCounter = 1;
    this.paymentIdCounter = 1;
    this.ticketIdCounter = 1;
    
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

    // Add a staff user for Jane Smith (for staff login test)
    const hashedJanePass = await hashPassword("staffpassJane");
    const janeSmith = await this.createUser({
      email: "jane.smith@example.com",
      phone: "+971501234568",
      name: "Jane Smith",
      password: hashedJanePass,
      role: "staff",
      profileImage: "",
      confirmPassword: "staffpassJane"
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
    const { confirmPassword, ...userDataWithoutConfirm } = userData;
    
    const id = this.userIdCounter++;
    const now = new Date();
    
    const newUser: User = {
      id,
      email: userDataWithoutConfirm.email,
      phone: userDataWithoutConfirm.phone || null,
      name: userDataWithoutConfirm.name,
      password: userDataWithoutConfirm.password,
      role: userDataWithoutConfirm.role || "staff",
      profileImage: userDataWithoutConfirm.profileImage || null,
      companyName: userDataWithoutConfirm.companyName || null,
      estimatedEvents: userDataWithoutConfirm.estimatedEvents || null,
      estimatedStaff: userDataWithoutConfirm.estimatedStaff || null,
      accountStatus: userDataWithoutConfirm.accountStatus || "pending",
      emailVerificationToken: userDataWithoutConfirm.emailVerificationToken || null,
      emailVerifiedAt: userDataWithoutConfirm.emailVerifiedAt || null,
      stripeCustomerId: userDataWithoutConfirm.stripeCustomerId || null,
      onboardingCompleted: userDataWithoutConfirm.onboardingCompleted || false,
      isOtpVerifiedForInitialEnrollment: userDataWithoutConfirm.isOtpVerifiedForInitialEnrollment || false,
      isFacialEnrolled: userDataWithoutConfirm.isFacialEnrolled || false,
      createdAt: now,
    };
    
    this.users.set(id, newUser);
    return newUser;
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

  async listOrganizerUsers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === "organizer");
  }

  async listPendingOrganizers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      user => user.role === "organizer" && user.accountStatus === "pending"
    );
  }

  async updateUserStatus(id: number, status: "pending" | "active" | "suspended"): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, accountStatus: status };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateStripeCustomerId(id: number, stripeId: string): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    const updatedUser = {
      ...user,
      stripeCustomerId: stripeId,
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateStaffOtpVerification(id: number, isVerified: boolean): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    const updatedUser = {
      ...user,
      isOtpVerifiedForInitialEnrollment: isVerified,
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateStaffFacialEnrollment(id: number, isEnrolled: boolean): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    const updatedUser = {
      ...user,
      isFacialEnrolled: isEnrolled,
    };

    this.users.set(id, updatedUser);
    return updatedUser;
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
      isActive: false,
      staffCount: 0,
      duration: eventData.duration || 1,
      mapLocation: eventData.mapLocation || null,
      createdAt,
    };

    this.events.set(id, event);
    return event;
  }
  
  async listActiveEvents(organizerId?: number): Promise<Event[]> {
    let events = Array.from(this.events.values()).filter(event => event.isActive);
    if (organizerId) {
      events = events.filter(event => event.organizerId === organizerId);
    }
    return events;
  }
  
  async activateEvent(id: number): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;

    const updatedEvent = { ...event, isActive: true };
    this.events.set(id, updatedEvent);
    return updatedEvent;
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
      supervisorId: assignmentData.supervisorId || null,
      checkInTime: null,
      checkOutTime: null,
      checkInImage: "",
      checkOutImage: null,
      checkInLocation: null,
      checkOutLocation: null,
      manualOverride: false,
      overrideReason: null,
      overrideApprovedBy: null,
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
      manualOverride: data.manualOverride || false,
      overrideReason: data.overrideReason || null,
      isLate,
      isAbsent: false,
    };

    this.staffAssignments.set(assignment.id, updatedAssignment);
    return updatedAssignment;
  }
  
  async checkOutStaff(data: CheckOut): Promise<StaffAssignment | undefined> {
    const assignments = Array.from(this.staffAssignments.values());
    const assignment = assignments.find(
      a => a.staffId === data.staffId && a.eventId === data.eventId
    );

    if (!assignment) return undefined;
    
    // Ensure staff has checked in first
    if (!assignment.checkInTime) return undefined;

    const now = new Date();
    
    const updatedAssignment: StaffAssignment = {
      ...assignment,
      checkOutTime: now,
      checkOutImage: data.image || null,
      checkOutLocation: data.location || null,
    };

    this.staffAssignments.set(assignment.id, updatedAssignment);
    return updatedAssignment;
  }
  
  async approveOverride(assignmentId: number, approverId: number): Promise<StaffAssignment | undefined> {
    const assignment = this.staffAssignments.get(assignmentId);
    if (!assignment || !assignment.manualOverride) return undefined;
    
    // Check if approver exists and is an organizer
    const approver = this.users.get(approverId);
    if (!approver || approver.role !== "organizer") return undefined;
    
    const updatedAssignment: StaffAssignment = {
      ...assignment,
      overrideApprovedBy: approverId,
    };

    this.staffAssignments.set(assignmentId, updatedAssignment);
    return updatedAssignment;
  }
  
  // Onboarding survey methods
  async getOnboardingSurvey(id: number): Promise<OnboardingSurvey | undefined> {
    return this.onboardingSurveys.get(id);
  }
  
  async getOnboardingSurveyByUserId(userId: number): Promise<OnboardingSurvey | undefined> {
    return Array.from(this.onboardingSurveys.values()).find(
      survey => survey.userId === userId
    );
  }
  
  async createOnboardingSurvey(surveyData: InsertOnboardingSurvey): Promise<OnboardingSurvey> {
    const id = this.surveyIdCounter++;
    const createdAt = new Date();
    
    const survey: OnboardingSurvey = {
      id,
      userId: surveyData.userId,
      eventTypes: surveyData.eventTypes || null,
      eventFrequency: surveyData.eventFrequency || null,
      staffSize: surveyData.staffSize || null,
      additionalInfo: surveyData.additionalInfo || null,
      scheduledCall: surveyData.scheduledCall || null,
      createdAt,
    };
    
    this.onboardingSurveys.set(id, survey);
    return survey;
  }
  
  async updateOnboardingSurvey(id: number, surveyData: Partial<OnboardingSurvey>): Promise<OnboardingSurvey | undefined> {
    const survey = this.onboardingSurveys.get(id);
    if (!survey) return undefined;
    
    const updatedSurvey = { ...survey, ...surveyData };
    this.onboardingSurveys.set(id, updatedSurvey);
    return updatedSurvey;
  }
  
  // Payment methods
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }
  
  async getPaymentByEventId(eventId: number): Promise<Payment | undefined> {
    return Array.from(this.payments.values()).find(
      payment => payment.eventId === eventId
    );
  }
  
  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const id = this.paymentIdCounter++;
    const createdAt = new Date();
    
    const payment: Payment = {
      id,
      eventId: paymentData.eventId,
      organizerId: paymentData.organizerId,
      amount: paymentData.amount,
      staffCount: paymentData.staffCount,
      daysCount: paymentData.daysCount,
      rate: paymentData.rate,
      status: "pending",
      stripePaymentId: null,
      paymentDate: null,
      createdAt,
    };
    
    this.payments.set(id, payment);
    return payment;
  }
  
  async updatePaymentStatus(id: number, status: string, stripeId?: string): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    if (!payment) return undefined;
    
    const paymentDate = status === "completed" ? new Date() : payment.paymentDate;
    
    const updatedPayment = { 
      ...payment, 
      status, 
      stripePaymentId: stripeId || payment.stripePaymentId,
      paymentDate
    };
    
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }
  
  async listPayments(organizerId?: number): Promise<Payment[]> {
    let payments = Array.from(this.payments.values());
    if (organizerId) {
      payments = payments.filter(payment => payment.organizerId === organizerId);
    }
    return payments;
  }
  
  // Support ticket methods
  async getSupportTicket(id: number): Promise<SupportTicket | undefined> {
    return this.supportTickets.get(id);
  }
  
  async createSupportTicket(ticketData: InsertSupportTicket): Promise<SupportTicket> {
    const id = this.ticketIdCounter++;
    const createdAt = new Date();
    
    const ticket: SupportTicket = {
      id,
      userId: ticketData.userId,
      subject: ticketData.subject,
      message: ticketData.message,
      status: "open",
      assignedTo: null,
      createdAt,
      closedAt: null,
    };
    
    this.supportTickets.set(id, ticket);
    return ticket;
  }
  
  async updateSupportTicket(id: number, ticketData: Partial<SupportTicket>): Promise<SupportTicket | undefined> {
    const ticket = this.supportTickets.get(id);
    if (!ticket) return undefined;
    
    const updatedTicket = { ...ticket, ...ticketData };
    this.supportTickets.set(id, updatedTicket);
    return updatedTicket;
  }
  
  async assignSupportTicket(id: number, assigneeId: number): Promise<SupportTicket | undefined> {
    const ticket = this.supportTickets.get(id);
    if (!ticket) return undefined;
    
    // Check if assignee exists and is an admin
    const assignee = this.users.get(assigneeId);
    if (!assignee || assignee.role !== "admin") return undefined;
    
    const updatedTicket = { 
      ...ticket, 
      assignedTo: assigneeId,
      status: "in-progress" 
    };
    
    this.supportTickets.set(id, updatedTicket);
    return updatedTicket;
  }
  
  async closeSupportTicket(id: number): Promise<SupportTicket | undefined> {
    const ticket = this.supportTickets.get(id);
    if (!ticket) return undefined;
    
    const updatedTicket = { 
      ...ticket, 
      status: "closed",
      closedAt: new Date()
    };
    
    this.supportTickets.set(id, updatedTicket);
    return updatedTicket;
  }
  
  async listSupportTickets(userId?: number, assignedTo?: number): Promise<SupportTicket[]> {
    let tickets = Array.from(this.supportTickets.values());
    
    if (userId) {
      tickets = tickets.filter(ticket => ticket.userId === userId);
    }
    
    if (assignedTo) {
      tickets = tickets.filter(ticket => ticket.assignedTo === assignedTo);
    }
    
    return tickets;
  }
}

export const storage = new MemStorage();