import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Types
export const userRoles = ["organizer", "staff"] as const;
export type UserRole = typeof userRoles[number];

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  name: text("name").notNull(),
  password: text("password").notNull(),
  role: text("role").$type<UserRole>().notNull().default("staff"),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true })
  .extend({
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

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
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  organizerId: true,
  createdAt: true,
});

// Staff Event Assignment Table
export const staffAssignments = pgTable("staff_assignments", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  staffId: integer("staff_id").notNull(),
  role: text("role").notNull(),
  checkInTime: timestamp("check_in_time"),
  checkInImage: text("check_in_image"),
  checkInLocation: json("check_in_location"),
  isLate: boolean("is_late").default(false),
  isAbsent: boolean("is_absent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStaffAssignmentSchema = createInsertSchema(staffAssignments).omit({
  id: true,
  checkInTime: true,
  checkInImage: true,
  checkInLocation: true,
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
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type StaffAssignment = typeof staffAssignments.$inferSelect;
export type InsertStaffAssignment = z.infer<typeof insertStaffAssignmentSchema>;
export type CheckIn = z.infer<typeof checkInSchema>;
