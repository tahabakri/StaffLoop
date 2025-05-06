import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import multer from "multer";
import { 
  insertEventSchema, 
  insertStaffAssignmentSchema, 
  checkInSchema,
  checkOutSchema,
  insertOnboardingSurveySchema,
  insertPaymentSchema,
  insertSupportTicketSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { parse } from "csv-parse/sync";
import { randomBytes } from "crypto";
import Stripe from "stripe";

// Configure multer storage for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Stripe with the secret key
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("Missing required Stripe secret: STRIPE_SECRET_KEY");
    process.exit(1);
  }
  
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });
  
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
  
  // Type for role stats
  type RoleStats = {
    [key: string]: {
      total: number;
      checkedIn: number;
    }
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
      const roleStats: RoleStats = {};
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

  // Staff Check-out Route
  app.post("/api/checkout", requireAuth, async (req, res) => {
    try {
      const checkOutData = checkOutSchema.parse(req.body);
      
      // Verify the user is checking out themselves
      if (req.user.id !== checkOutData.staffId) {
        return res.status(403).json({ message: "You can only check out yourself" });
      }
      
      const updatedAssignment = await storage.checkOutStaff(checkOutData);
      
      if (!updatedAssignment) {
        return res.status(404).json({ message: "No matching assignment found or not checked in" });
      }
      
      res.status(200).json(updatedAssignment);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error during check-out:", error);
      res.status(500).json({ message: "Failed to complete check-out" });
    }
  });
  
  // Manual override approval
  app.post("/api/override/approve/:assignmentId", requireOrganizer, async (req, res) => {
    try {
      const assignmentId = parseInt(req.params.assignmentId);
      const approverId = req.user.id;
      
      const updatedAssignment = await storage.approveOverride(assignmentId, approverId);
      
      if (!updatedAssignment) {
        return res.status(404).json({ message: "No matching assignment found or not a manual override" });
      }
      
      res.status(200).json(updatedAssignment);
    } catch (error) {
      console.error("Error approving override:", error);
      res.status(500).json({ message: "Failed to approve override" });
    }
  });
  
  // Onboarding survey routes
  app.post("/api/onboarding/survey", requireAuth, async (req, res) => {
    try {
      const surveyData = insertOnboardingSurveySchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const existingSurvey = await storage.getOnboardingSurveyByUserId(req.user.id);
      if (existingSurvey) {
        return res.status(400).json({ message: "You have already submitted an onboarding survey" });
      }
      
      const newSurvey = await storage.createOnboardingSurvey(surveyData);
      res.status(201).json(newSurvey);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating survey:", error);
      res.status(500).json({ message: "Failed to create survey" });
    }
  });
  
  app.get("/api/onboarding/survey", requireAuth, async (req, res) => {
    try {
      const survey = await storage.getOnboardingSurveyByUserId(req.user.id);
      
      if (!survey) {
        return res.status(404).json({ message: "No survey found" });
      }
      
      res.json(survey);
    } catch (error) {
      console.error("Error fetching survey:", error);
      res.status(500).json({ message: "Failed to fetch survey" });
    }
  });
  
  // Payment routes
  app.post("/api/payments/calculate", requireOrganizer, async (req, res) => {
    try {
      const { eventId, staffCount, daysCount } = req.body;
      
      if (!eventId || !staffCount || !daysCount) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Get event to verify ownership
      const event = await storage.getEvent(parseInt(eventId));
      if (!event || event.organizerId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized for this event" });
      }
      
      // Calculate payment (rate * staff * days)
      const rate = 5.0; // Set a base rate of $5 per staff member per day
      const amount = rate * parseInt(staffCount) * parseInt(daysCount);
      
      res.json({
        eventId: parseInt(eventId),
        organizerId: req.user.id,
        staffCount: parseInt(staffCount),
        daysCount: parseInt(daysCount),
        rate,
        amount,
        calculatedAt: new Date()
      });
    } catch (error) {
      console.error("Error calculating payment:", error);
      res.status(500).json({ message: "Failed to calculate payment" });
    }
  });
  
  app.post("/api/payments/create", requireOrganizer, async (req, res) => {
    try {
      const { eventId, staffCount, daysCount, rate, amount } = req.body;
      
      if (!eventId || !staffCount || !daysCount || !rate || !amount) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Get event to verify ownership
      const event = await storage.getEvent(parseInt(eventId));
      if (!event || event.organizerId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized for this event" });
      }
      
      // Check if there's already a payment for this event
      const existingPayment = await storage.getPaymentByEventId(parseInt(eventId));
      if (existingPayment) {
        return res.status(400).json({ message: "A payment already exists for this event" });
      }
      
      // Create payment record
      const payment = await storage.createPayment({
        eventId: parseInt(eventId),
        organizerId: req.user.id,
        staffCount: parseInt(staffCount),
        daysCount: parseInt(daysCount),
        rate: parseFloat(rate),
        amount: parseFloat(amount)
      });
      
      res.status(201).json(payment);
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(500).json({ message: "Failed to create payment" });
    }
  });
  
  // Create Stripe payment intent
  app.post("/api/payments/:paymentId/intent", requireOrganizer, async (req, res) => {
    try {
      const paymentId = parseInt(req.params.paymentId);
      const payment = await storage.getPayment(paymentId);
      
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      
      if (payment.organizerId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized for this payment" });
      }
      
      // Create a payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(payment.amount * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          paymentId: payment.id.toString(),
          eventId: payment.eventId.toString()
        },
        receipt_email: req.user.email
      });
      
      // Update payment record with Stripe ID
      await storage.updatePaymentStatus(paymentId, "pending", paymentIntent.id);
      
      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntent: paymentIntent.id
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Failed to create payment intent" });
    }
  });
  
  // Confirm payment and activate event
  app.post("/api/payments/:paymentId/confirm", requireOrganizer, async (req, res) => {
    try {
      const paymentId = parseInt(req.params.paymentId);
      const { paymentIntentId } = req.body;
      
      if (!paymentIntentId) {
        return res.status(400).json({ message: "Payment intent ID is required" });
      }
      
      const payment = await storage.getPayment(paymentId);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      
      if (payment.organizerId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized for this payment" });
      }
      
      // Verify payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (
        paymentIntent.status !== 'succeeded' || 
        paymentIntent.metadata.paymentId !== payment.id.toString()
      ) {
        return res.status(400).json({ message: "Invalid payment intent or payment not complete" });
      }
      
      // Update payment status
      const updatedPayment = await storage.updatePaymentStatus(paymentId, "completed", paymentIntentId);
      
      // Activate event
      const event = await storage.activateEvent(payment.eventId);
      
      res.json({
        payment: updatedPayment,
        event,
        success: true
      });
    } catch (error) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ message: "Failed to confirm payment" });
    }
  });
  
  // Support ticket routes
  app.post("/api/support/tickets", requireAuth, async (req, res) => {
    try {
      const ticketData = insertSupportTicketSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const newTicket = await storage.createSupportTicket(ticketData);
      res.status(201).json(newTicket);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating support ticket:", error);
      res.status(500).json({ message: "Failed to create support ticket" });
    }
  });
  
  app.get("/api/support/tickets", requireAuth, async (req, res) => {
    try {
      // If admin, can see all tickets or filter by assignee
      // If regular user, can only see their own tickets
      const userId = req.user.role === "admin" ? undefined : req.user.id;
      const assignedTo = req.query.assignedTo ? parseInt(req.query.assignedTo as string) : undefined;
      
      const tickets = await storage.listSupportTickets(userId, assignedTo);
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  });
  
  // Admin routes
  app.get("/api/admin/organizers/pending", requireAuth, async (req, res) => {
    try {
      // Ensure user is admin
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const pendingOrganizers = await storage.listPendingOrganizers();
      
      // Remove sensitive data
      const safeUsers = pendingOrganizers.map(user => {
        const { password, ...safeUser } = user;
        return safeUser;
      });
      
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching pending organizers:", error);
      res.status(500).json({ message: "Failed to fetch pending organizers" });
    }
  });
  
  app.post("/api/admin/organizers/:organizerId/approve", requireAuth, async (req, res) => {
    try {
      // Ensure user is admin
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const organizerId = parseInt(req.params.organizerId);
      const updatedUser = await storage.updateUserStatus(organizerId, "active");
      
      if (!updatedUser) {
        return res.status(404).json({ message: "Organizer not found" });
      }
      
      // Remove sensitive data
      const { password, ...safeUser } = updatedUser;
      
      res.json(safeUser);
    } catch (error) {
      console.error("Error approving organizer:", error);
      res.status(500).json({ message: "Failed to approve organizer" });
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
