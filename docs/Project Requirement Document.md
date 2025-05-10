# **📄 Project Requirements Document**

**Project Name:** StaffLoop  
 **Prepared By:** Saleh  
 **Last Updated:** May 9, 2025

---

## **1\. 💡 Project Overview**

**StaffLoop** is a web-based platform built to streamline event staff scheduling, attendance tracking, and check-in verification for event organizers in the UAE. Unlike generic time-tracking apps, StaffLoop is tailored for short-term or recurring event operations and supports facial check-in, WhatsApp-based notifications, and flexible per-event pricing.

---

## **2\. 🎯 Objectives**

* Help event organizers create and manage staffing schedules quickly.

* Enable staff to check in using facial recognition \+ location verification.

* Support organizer onboarding through an automated flow with manual approval.

* Offer a frictionless event creation system with per-event pricing.

* Replace SMS with WhatsApp for staff notifications.

* Keep the system lightweight, intuitive, and focused.

  ---

  ## **3\. 👥 Target Users**

  ### **Organizers**

* Event agencies, production companies, F\&B vendors, pop-up managers.

* Primary goals: create events, schedule staff, monitor attendance.

  ### **Staff**

* Temporary workers, hostesses, promoters, waiters, support crew.

* Primary goals: receive shift details, check in/out easily, stay in sync with organizers.

  ---

  ## **4\. 🧩 Core Features**

  ### **A. Organizer Onboarding**

* Signup page with form:

  * Company name, email, WhatsApp number, role, industry.

* Auto-response email confirming submission.

* Manual approval with onboarding call.

* Upon approval, email/password login credentials sent.

  ### **B. Organizer Dashboard**

* Event creation form:

  * Event name, date(s), location, number of staff, role type, supervisor contact.

* Staff import:

  * Upload .CSV file with name \+ phone number.

* Per-event payment:

  * Calculate based on: `#Staff x #Days x Rate Per Staff`

  * Payment via Stripe (or local gateway), required before event goes live.

* Support tab with WhatsApp link or live chat.

  ### **C. Staff App (or Web View)**

* Receive event info via WhatsApp.

* Facial check-in \+ geo-location tracking.

* Manual check-in with supervisor approval if face not recognized.

* Call supervisor button.

* View schedule and assigned shifts.

  ### **D. Admin Panel (for you)**

* View organizer submissions.

* Approve or reject onboarding.

* Monitor live check-ins.

* Manually confirm identity on failed check-ins.

* Event metrics: attendance rate, late/no-show stats, per-event reports.

  ---

  ## **5\. 💰 Monetization & Pricing**

* **Per-event model**:  
   Example: 40 staff × 10 AED/staff × 5 days \= 2,000 AED

* Payment required before staff can check in.

  ---

  ## **6\. 🛠️ Tech Stack Suggestions**

* **Frontend:** React.js / Next.js

* **Backend:** Node.js \+ Express

* **Auth:** Firebase or Auth0

* **Database:** PostgreSQL or Supabase

* **Face Recognition:** AWS Rekognition / Trueface

* **Maps \+ Geo:** Google Maps API

* **Messaging:** WhatsApp Cloud API

* **Payments:** Stripe / PayTabs

  ---

  ## **7\. 📅 Milestones (Sample)**

| Phase | Timeline |
| ----- | ----- |
| UX/UI Wireframes | Week 1 |
| MVP Backend Setup | Week 2 |
| Organizer Onboarding | Week 3 |
| Staff Check-in Module | Week 4 |
| Payment Integration | Week 5 |
| Testing & Launch | Week 6–7 |

  ---

  ## **8\. 🔒 Security & Compliance**

* Store check-in data securely.

* Ensure GDPR & UAE privacy compliance.

* Store facial data temporarily or allow opt-out.

  ---

  ## **9\. 🚀 Future Ideas (Optional Phase 2\)**

* Mobile app version

* Analytics dashboard for organizers

* QR fallback check-in

* Arabic language support

* Staff rating system