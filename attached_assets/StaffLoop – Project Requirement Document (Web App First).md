## **StaffLoop – Project Requirement Document (Web App First)**

### **Overview**

StaffLoop is a streamlined staff scheduling and attendance management platform designed for event organizers in the UAE. The platform simplifies team coordination through features like facial recognition check-in, geolocation tagging, and easy scheduling.

---

### **Core Features**

#### **1\. Organizer Portal**

* **Sign Up / Onboarding**

  * Sign-up form includes company email, name, company name, phone, number of expected events, and staff size.

  * After sign-up, organizer is redirected to a short onboarding survey and then prompted to schedule a call.

  * Admin manually approves access after call and activates dashboard login.

* **Event Creation**

  * Organizers can create events with details like location, date, time, required number of staff, and duration.

  * Staff can be imported via CSV or added manually.

* **Staff Management**

  * Organizers can view assigned staff and their attendance.

  * Add supervisors and attach them to each event or shift.

* **Payment**

  * Organizers must complete payment before activating events.

  * Dynamic pricing: Organizer inputs number of days × staff × rate (e.g., AED 10/staff/day).

  * Payment gateway (e.g., Stripe, Telr, etc.).

---

#### **2\. Staff Portal**

* **Login**

  * Mobile browser optimized.

  * Login with phone number and OTP or password.

* **Check-In System**

  * Facial recognition check-in with geo-tagging.

  * Manual override option with supervisor approval if facial match fails.

* **Schedule View**

  * See assigned shifts, event details, supervisor contact.

  * Call supervisor directly from web app if issues arise.

---

#### **3\. Admin Panel**

* View and approve organizer sign-ups.

* Manage organizer accounts, staff rosters, payments, and attendance logs.

* Issue support tickets or handle chat requests.

---

### **Communication Integration**

* **WhatsApp API**

  * Replace SMS alerts with WhatsApp notifications.

  * Staff receive shift reminders, check-in confirmation, and event info via WhatsApp.

---

### **Support Tab**

* Integrated support tab for both staff and organizers to request help.

* Auto-email or in-app ticket system.

---

### **Technology Stack**

* **Frontend**: React.js (web-optimized, mobile responsive)

* **Backend**: Node.js or Django

* **Database**: Firebase / PostgreSQL / supabase

* **Facial Recognition**: AWS Rekognition or similar

* **Geolocation**: Browser-based location access (HTML5)

---

### **Phase 1 Deliverables**

* Web-based MVP for organizers and staff

* Admin dashboard for platform owner

* WhatsApp integration

* Payment gateway integration

* Attendance dashboard