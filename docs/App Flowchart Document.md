# **🔄 StaffLoop – App Flowchart Document**

---

## **🎯 Overview**

This app has two main user flows:

* **Organizer Flow**: Creating events, assigning shifts, managing staff, tracking attendance.

* **Staff Flow**: Viewing assigned events, checking in/out, verifying attendance.

---

## **🧩 FLOW DIAGRAM (Text-Based)**

### **👤 Organizer Flow**

1. **Landing Page**

   * → Click “Sign Up as Organizer”

2. **Organizer Sign Up**

   * → Fill details (name, org, email, phone)

   * → WhatsApp confirmation (optional or later)

3. **Dashboard Access**

   * → Create Event

     * Set name, dates, location

     * Choose number of staff

     * Choose if facial verification is enabled

     * Upload staff list (CSV or form)

   * → System estimates cost

   * → Organizer pays (Stripe or Paymob)

   * → Access granted to event dashboard

4. **Dashboard Options**

   * View Event Overview

   * Assign shifts to staff

   * Monitor live attendance

   * Export data

   * Send reminders to staff (via WhatsApp)

---

### **👷 Staff Flow**

1. **Landing Page**

   * → Click “I’m Staff / Check In”

2. **Staff Login or OTP Access**

   * → Phone number login (OTP or WhatsApp verify)

   * → See list of assigned shifts

3. **Event Day**

   * → Tap “Check-In”

     * System opens camera for face scan

     * Captures geolocation

   * → If matched, check-in confirmed

   * → After shift ends, tap “Check-Out”

4. **Post-Event**

   * → View shift history

   * → View attendance status

   * → Contact organizer via WhatsApp (link)

---

### **🛠 Admin Flow**

1. **Login to Admin Panel**

   * View all organizers

   * Approve organizer verification (if manual step)

   * Manually verify face-check failures

   * View system logs

   * Manage platform usage, billing

---

## **🗺 Optional: Visual Flowchart (Text Tree Version)**

mathematica  
CopyEdit  
`[Landing Page]`  
    `├── Organizer Signup`  
    `│     └── Dashboard`  
    `│           ├── Create Event`  
    `│           │     └── Upload Staff + Payment`  
    `│           └── Monitor & Export Attendance`  
    `│`  
    `└── Staff Login`  
          `└── Assigned Shifts`  
                `├── Check-In (Face + Geo)`  
                `└── Check-Out`

---

## **🔧 Automation Points**

* WhatsApp auto-notifications after event creation

* Facial match scoring (auto-verified vs manual fallback)

* Payment required before dashboard access

* Attendance logging sent to organizer instantly

