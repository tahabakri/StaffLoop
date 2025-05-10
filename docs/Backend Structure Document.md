# **🛠 StaffLoop – Backend Structure Document**

---

## **🧱 1\. Architecture Overview**

* **Architecture Type**: Modular Monolith (scalable to microservices later)

* **Tech Stack**:

  * **Language**: Node.js (TypeScript)

  * **Framework**: Express.js or NestJS (preferred)

  * **Database**: PostgreSQL (primary), Redis (cache)

  * **ORM**: Prisma or TypeORM

  * **Auth**: JWT-based auth (with refresh tokens)

  * **Storage**: AWS S3 or Cloudinary (for face scans, profile photos)

  * **Notifications**: WhatsApp Business API (Twilio, WATI, or Zoko)

---

## **🧩 2\. Core Modules**

### **1\. Auth Module**

* Sign up, Sign in (Organizers & Staff)

* OTP Verification (Optional for staff)

* JWT Access \+ Refresh tokens

* Role-based access: Admin, Organizer, Staff

---

### **2\. Organizer Module**

* Register company details

* Create & manage events

* Import or manually add staff list

* Event dashboard: dates, number of staff, shifts, costs

* Payment module: Stripe or Paymob API

* Download attendance/export reports

---

### **3\. Staff Module**

* View assigned shifts/events

* Check-in/out (with geolocation & face verification)

* Call supervisor (emergency contact via WhatsApp deep link)

* Update contact details

* Track shift history

---

### **4\. Event Module**

* Create multi-day events

* Assign shifts per staff

* Check-in windows (time range, geofencing)

* Add tags (venue, category, type)

* Export CSVs of attendance logs

---

### **5\. Attendance Module**

* Log time of check-in/out

* Store face verification snapshot

* Match geolocation

* Manual override (supervisor confirmation)

* Attendance status: On-time, Late, Absent

---

### **6\. Admin Panel**

* View all organizers

* Monitor event volumes & staff activity

* Manually verify facial re-checks if detection fails

* Support management tab

---

### **7\. Payment Module**

* Select number of staff × days × rate (on event creation)

* Auto-calculate total

* Pay to unlock dashboard access

* Stripe integration (Card/ApplePay)

* Invoice and receipt generation

---

### **8\. Notification Module**

* WhatsApp messages for:

  * Organizer onboarding

  * Event confirmations

  * Staff shift reminders

  * Emergency alerts

* WhatsApp API integration (Twilio, WATI, Zoko)

---

## **🗃 3\. Database Tables (Sample)**

| Table | Key Fields |
| ----- | ----- |
| Users | id, name, email, phone, role, passwordHash |
| Companies | id, name, industry, contact\_email |
| Events | id, title, company\_id, date\_start, date\_end |
| Shifts | id, event\_id, start\_time, end\_time, location |
| StaffAssignments | staff\_id, event\_id, shift\_id |
| Attendance | id, staff\_id, shift\_id, check\_in, face\_url, geo |
| Payments | id, event\_id, amount, status, transaction\_id |

---

## **🧪 4\. APIs to Expose (Example)**

| Endpoint | Method | Auth Required | Description |
| ----- | ----- | ----- | ----- |
| `/auth/signup` | POST | No | Organizer or Staff sign up |
| `/auth/login` | POST | No | Login and get JWT |
| `/events/create` | POST | Organizer | Create new event |
| `/staff/import` | POST | Organizer | Bulk import staff via CSV |
| `/attendance/check-in` | POST | Staff | Geo \+ Face check-in |
| `/admin/verify-face/:id` | POST | Admin | Manually verify face check-in fallback |

---

## **🔐 5\. Security**

* Store all sensitive data encrypted

* Rate limit login & attendance check-in

* OTP/2FA for admin-level access

* Logs of all critical actions (audit logs)

---

## **🌐 6\. Hosting & DevOps**

* **API Hosting**: Vercel (serverless) or Render/DigitalOcean App Platform

* **DB Hosting**: Supabase, PlanetScale, or Railway (PostgreSQL)

* **CI/CD**: GitHub Actions

* **Logging & Monitoring**: LogRocket, Sentry, or self-hosted Prometheus

