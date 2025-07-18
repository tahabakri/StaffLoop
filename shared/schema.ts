import { pgTable, text, serial, integer, boolean, timestamp, json, real, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Types
export const userRoles = ["organizer", "staff", "admin"] as const;
export type UserRole = typeof userRoles[number];

// Account Status Types
export const accountStatus = ["pending", "active", "verified", "suspended"] as const;
export type AccountStatus = typeof accountStatus[number];

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  name: text("name").notNull(),
  password: text("password").notNull(),
  role: text("role").$type<UserRole>().notNull().default("staff"),
  profileImage: text("profile_image"),
  companyName: text("company_name"),
  estimatedEvents: integer("estimated_events"),
  estimatedStaff: integer("estimated_staff"),
  accountStatus: text("account_status").$type<AccountStatus>().default("pending"),
  emailVerificationToken: text("email_verification_token"),
  emailVerifiedAt: timestamp("email_verified_at"),
  stripeCustomerId: text("stripe_customer_id"),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  isOtpVerifiedForInitialEnrollment: boolean("is_otp_verified_for_initial_enrollment").default(false),
  isFacialEnrolled: boolean("is_facial_enrolled").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Staff Table (users with role="staff")
export const staffTable = pgTable("staff", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  role: text("role"), // Role within the organization, not to be confused with user role
  isSupervisor: boolean("is_supervisor").default(false),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Roles Table (for event roles)
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users)
  .omit({ 
    id: true, 
    createdAt: true, 
    accountStatus: true, 
    stripeCustomerId: true 
  })
  .extend({
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Onboarding Survey Table
export const onboardingSurveys = pgTable("onboarding_surveys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  eventTypes: text("event_types"), // E.g., concerts, conferences, etc.
  eventFrequency: text("event_frequency"), // E.g., weekly, monthly, etc.
  staffSize: integer("staff_size"),
  additionalInfo: text("additional_info"),
  scheduledCall: timestamp("scheduled_call"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOnboardingSurveySchema = createInsertSchema(onboardingSurveys)
  .omit({ id: true, createdAt: true });

// Events Table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  date: timestamp("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  description: text("description"),
  organizerId: integer("organizer_id").notNull(),
  isActive: boolean("is_active").default(false),
  staffCount: integer("staff_count").default(0),
  duration: integer("duration").default(1), // In days
  mapLocation: json("map_location"), // For storing pin coordinates
  createdAt: timestamp("created_at").defaultNow(),
  hasTeams: boolean("has_teams").default(false), // Flag to indicate if this event uses team organization
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  organizerId: true,
  isActive: true,
  staffCount: true,
  createdAt: true,
});

// Teams Table
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Team Roles Table - NEW
export const teamRoles = pgTable("team_roles", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  staffCount: integer("staff_count").notNull().default(1),
  description: text("description"),
  isSupervisory: boolean("is_supervisory").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Supervisor Event Access Tokens Table
export const supervisorEventAccessTokens = pgTable("supervisor_event_access_tokens", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  teamId: integer("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  supervisorStaffId: integer("supervisor_staff_id").notNull().references(() => staffTable.id, { onDelete: "cascade" }),
  accessToken: text("access_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Event Staff Assignments Table
export const eventStaffAssignments = pgTable("event_staff_assignments", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  staffId: integer("staff_id").notNull().references(() => staffTable.id, { onDelete: "cascade" }),
  roleId: integer("role_id").references(() => roles.id),
  teamId: integer("team_id").references(() => teams.id), // Optional team assignment
  teamRoleId: integer("team_role_id").references(() => teamRoles.id), // NEW: Reference to team-specific role
  checkInTime: timestamp("check_in_time"),
  checkOutTime: timestamp("check_out_time"),
  status: text("status").default("not-checked-in"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Staff Event Assignment Table
export const staffAssignments = pgTable("staff_assignments", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  staffId: integer("staff_id").notNull(),
  role: text("role").notNull(),
  supervisorId: integer("supervisor_id"),
  checkInTime: timestamp("check_in_time"),
  checkOutTime: timestamp("check_out_time"),
  checkInImage: text("check_in_image"),
  checkOutImage: text("check_out_image"),
  checkInLocation: json("check_in_location"),
  checkOutLocation: json("check_out_location"),
  manualOverride: boolean("manual_override").default(false),
  overrideReason: text("override_reason"),
  overrideApprovedBy: integer("override_approved_by"),
  isLate: boolean("is_late").default(false),
  isAbsent: boolean("is_absent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStaffAssignmentSchema = createInsertSchema(staffAssignments).omit({
  id: true,
  checkInTime: true,
  checkOutTime: true,
  checkInImage: true,
  checkOutImage: true,
  checkInLocation: true,
  checkOutLocation: true,
  manualOverride: true,
  overrideReason: true,
  overrideApprovedBy: true,
  isLate: true,
  isAbsent: true,
  createdAt: true,
});

export const checkInSchema = z.object({
  staffId: z.number(),
  eventId: z.number(),
  image: z.string(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  manualOverride: z.boolean().optional(),
  overrideReason: z.string().optional(),
});

export const checkOutSchema = z.object({
  staffId: z.number(),
  eventId: z.number(),
  image: z.string().optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
});

// Payments Table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  organizerId: integer("organizer_id").notNull(),
  amount: real("amount").notNull(),
  staffCount: integer("staff_count").notNull(),
  daysCount: integer("days_count").notNull(),
  rate: real("rate").notNull(),
  status: text("status").notNull(), // pending, completed, failed
  stripePaymentId: text("stripe_payment_id"),
  paymentDate: timestamp("payment_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  status: true,
  stripePaymentId: true,
  paymentDate: true,
  createdAt: true,
});

// Support Tickets Table
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("open"), // open, in-progress, closed
  assignedTo: integer("assigned_to"),
  createdAt: timestamp("created_at").defaultNow(),
  closedAt: timestamp("closed_at"),
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  status: true,
  assignedTo: true,
  createdAt: true,
  closedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertOnboardingSurvey = z.infer<typeof insertOnboardingSurveySchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type StaffAssignment = typeof staffAssignments.$inferSelect;
export type InsertStaffAssignment = z.infer<typeof insertStaffAssignmentSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type CheckIn = z.infer<typeof checkInSchema>;
export type CheckOut = z.infer<typeof checkOutSchema>;
export type Team = typeof teams.$inferSelect;
export type TeamRole = typeof teamRoles.$inferSelect;
export type SupervisorAccessToken = typeof supervisorEventAccessTokens.$inferSelect;
export type EventStaffAssignment = typeof eventStaffAssignments.$inferSelect;

// Schema for creating a supervisor access token
export const createSupervisorAccessTokenSchema = z.object({
  eventId: z.number(),
  teamId: z.number(),
  supervisorStaffId: z.number(),
});

export type CreateSupervisorAccessToken = z.infer<typeof createSupervisorAccessTokenSchema>;
