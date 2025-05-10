# **📲 StaffLoop – App Flow Document**

---

## **1\. 👤 Organizer Flow**

### **A. Onboarding & Signup**

1. Organizer visits landing page

2. Clicks **"Sign Up"**

3. Fills out onboarding form:

   * Company name

   * Full name

   * Email

   * WhatsApp number

   * Industry

4. Gets confirmation message:  
    *"Thanks for signing up\! We’ll get in touch shortly."*

5. StaffLoop admin reviews and approves

6. Organizer receives login credentials via email or WhatsApp

7. Logs into dashboard

---

### **B. Dashboard – Organizer Panel**

**1\. Create Event**

* Click “Create Event”

* Fill:

  * Event name

  * Date & Time

  * Location (map \+ pin)

  * Number of staff

  * Roles (e.g., hostess, support)

  * Supervisor contact

**2\. Add Staff**

* Upload staff list (.CSV or manual input)

  * Name

  * WhatsApp number

* Invite staff (auto WhatsApp message sent with event link)

**3\. Make Payment**

* System calculates cost:  
   `#Staff × #Days × Rate`

* Select payment method (Stripe or PayTabs)

* Once paid, event is confirmed

**4\. View Attendance**

* Real-time view of:

  * Who checked in

  * Who’s late / absent

  * Facial match status

  * Manual override if needed

---

## **2\. 👷 Staff Flow**

### **A. Invitation & Access**

1. Receives WhatsApp invite link

2. Opens event info via mobile browser or app view

3. Sees:

   * Event name, date, location

   * Call supervisor button

   * "Check In" button (enabled on event day)

---

### **B. Check-In System**

1. Taps “Check In”

2. Launches camera for facial recognition

3. Simultaneously gets GPS location

4. System confirms:

   * Face match ✅

   * Location match ✅

5. If either fails:

   * Prompts to retry or call supervisor for manual approval

6. Sees “Checked In” confirmation screen

7. Can check out in same way (if required)

---

## **3\. 🧑‍💻 Admin Flow (You)**

### **A. Review Signups**

* View all new organizer submissions

* Approve / reject

* Assign login credentials

### **B. Monitor Events**

* View all active events

* Live check-in feed

* Manual override for unmatched check-ins

* Export reports per event (attendance %, late/no-shows, etc.)

## **🔄 Summary Diagram**

Here's the simplified journey:

scss  
CopyEdit  
`[Organizer Signup Form]`  
     `↓ (Admin Approval)`  
`[Organizer Dashboard]`  
     `↓`  
`[Create Event] → [Add Staff] → [Make Payment] → [Staff Notified via WhatsApp]`  
                                                      `↓`  
                                               `[Staff Check-In Flow]`  
                                                      `↓`  
                                        `[Live Attendance for Organizer]`  
                                                      `↓`  
                                         `[Reports + Export After Event]`  
