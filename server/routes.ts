import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import multer from "multer";
import { insertEventSchema, insertStaffAssignmentSchema, checkInSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { parse } from "csv-parse/sync";

// Configure multer storage for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Auth check middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Organizer role check middleware
  const requireOrganizer = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || req.user.role !== "organizer") {
      return res.status(403).json({ message: "Organizer access required" });
    }
    next();
  };

  // Event Routes
  app.get("/api/events", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const isOrganizer = req.user.role === "organizer";
      
      // If organizer, get events they created, otherwise get all events
      const events = isOrganizer 
        ? await storage.listEvents(userId)
        : await storage.listEvents();
      
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/events/:id", requireAuth, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.post("/api/events", requireOrganizer, async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const newEvent = await storage.createEvent(eventData, req.user.id);
      res.status(201).json(newEvent);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.delete("/api/events/:id", requireOrganizer, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      if (event.organizerId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to delete this event" });
      }
      
      const success = await storage.deleteEvent(eventId);
      
      if (success) {
        res.status(200).json({ message: "Event deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete event" });
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Staff Assignment Routes
  app.get("/api/assignments", requireAuth, async (req, res) => {
    try {
      const eventId = req.query.eventId ? parseInt(req.query.eventId as string) : undefined;
      const staffId = req.query.staffId ? parseInt(req.query.staffId as string) : undefined;
      
      const assignments = await storage.listStaffAssignments(eventId, staffId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  app.post("/api/assignments", requireOrganizer, async (req, res) => {
    try {
      const assignmentData = insertStaffAssignmentSchema.parse(req.body);
      const newAssignment = await storage.createStaffAssignment(assignmentData);
      res.status(201).json(newAssignment);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating assignment:", error);
      res.status(500).json({ message: "Failed to create assignment" });
    }
  });

  // Staff Check-in Route
  app.post("/api/checkin", requireAuth, async (req, res) => {
    try {
      const checkInData = checkInSchema.parse(req.body);
      
      // Verify the user is checking in themselves
      if (req.user.id !== checkInData.staffId) {
        return res.status(403).json({ message: "You can only check in yourself" });
      }
      
      const updatedAssignment = await storage.checkInStaff(checkInData);
      
      if (!updatedAssignment) {
        return res.status(404).json({ message: "No matching assignment found" });
      }
      
      res.status(200).json(updatedAssignment);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error during check-in:", error);
      res.status(500).json({ message: "Failed to complete check-in" });
    }
  });

  // CSV Upload for Staff/Events
  app.post("/api/upload/staff", requireOrganizer, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const csvContent = req.file.buffer.toString("utf8");
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
      });

      const eventId = req.body.eventId ? parseInt(req.body.eventId) : null;
      if (!eventId) {
        return res.status(400).json({ message: "Event ID is required" });
      }

      // Verify event exists and belongs to this organizer
      const event = await storage.getEvent(eventId);
      if (!event || event.organizerId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized for this event" });
      }
      
      let created = 0;
      let errors = [];

      for (const record of records) {
        try {
          // Check if user exists by email or create a new one
          let user = await storage.getUserByEmail(record.email);
          
          if (!user) {
            // Create new staff user
            user = await storage.createUser({
              email: record.email,
              name: record.name,
              phone: record.phone || "",
              password: await randomPassword(), // Would be hashed in createUser
              role: "staff",
              profileImage: "",
              confirmPassword: ""  // Not needed here as we're bypassing validation
            });
          }
          
          // Create assignment
          await storage.createStaffAssignment({
            eventId,
            staffId: user.id,
            role: record.role || "Staff Member"
          });
          
          created++;
        } catch (error) {
          errors.push({ row: record, error: error.message });
        }
      }
      
      res.status(200).json({
        message: `Processed ${records.length} staff records, created ${created} assignments`,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      console.error("Error processing CSV:", error);
      res.status(500).json({ message: "Failed to process CSV file" });
    }
  });

  // Get user list for organizers
  app.get("/api/staff", requireOrganizer, async (req, res) => {
    try {
      const staffUsers = await storage.listStaffUsers();
      
      // Remove sensitive data
      const safeUsers = staffUsers.map(user => {
        const { password, ...safeUser } = user;
        return safeUser;
      });
      
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching staff:", error);
      res.status(500).json({ message: "Failed to fetch staff list" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats/:eventId", requireOrganizer, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      if (event.organizerId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to view this event" });
      }
      
      const assignments = await storage.listStaffAssignments(eventId);
      
      const totalStaff = assignments.length;
      const checkedIn = assignments.filter(a => a.checkInTime !== null).length;
      const late = assignments.filter(a => a.isLate).length;
      const absent = assignments.filter(a => a.isAbsent).length;
      
      // Group by role
      const roleStats = {};
      assignments.forEach(a => {
        if (!roleStats[a.role]) {
          roleStats[a.role] = { total: 0, checkedIn: 0 };
        }
        roleStats[a.role].total++;
        if (a.checkInTime) {
          roleStats[a.role].checkedIn++;
        }
      });
      
      res.json({
        totalStaff,
        checkedIn,
        late,
        absent,
        roleStats
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });

  // Create http server
  const httpServer = createServer(app);

  return httpServer;
}

// Helper function to generate random passwords for staff users
async function randomPassword() {
  return `staff-${randomBytes(4).toString("hex")}`;
}
