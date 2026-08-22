# Kakshyasathi

> Kakshyasathi is a dedicated Smart Classroom Management System for a single school. It combines student attendance, teacher classroom presence, timetables, substitute teachers, classroom Smart Boards, attendance terminals, notices, and personal academic information into one centralized platform.

The system uses the existing barcode/QR codes on school ID cards. Students and teachers do not need new cards or biometric devices.

By design, the Smart Board is not connected to the barcode scanner. Instead, every classroom has a separate **Attendance Terminal** consisting of an ESP32, barcode/QR scanner, RTC, local storage, and status indicators.

The Smart Board acts as the **classroom information and display system**, while the Attendance Terminal acts as the **physical attendance capture system**.

---

# 1. Problem Overview

The classroom process contains several activities that need to work together:

- Student attendance needs to be recorded quickly.
- Attendance should continue working even if Wi-Fi or the backend is temporarily unavailable.
- Teachers should be able to record when they enter and leave classrooms.
- The school needs to know which teacher is actually conducting a particular period.
- Substitute teachers need to be reflected immediately.
- Timetable changes may occur for particular days or periods.
- Smart Boards should display the current classroom information.
- Notices may need to reach all classes or selected classes.
- Students need access to their timetable, attendance history, and notices.
- Attendance hardware needs to synchronize with the central system when connectivity is restored.

Kakshyasathi brings these activities together into one system.

---

# 2. Proposed Solution

The central idea is:

> **Use a dedicated offline-capable Attendance Terminal to capture physical attendance while using the Smart Board as a live classroom information center.**

The system has four major participants:

```text
                         ADMIN
                           │
                           │ manages
                           ▼
                  KAKSHYASATHI SYSTEM
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
      STUDENT           TEACHER        CLASSROOM
          │                │                │
          │                │          ┌─────┴─────┐
          │                │          │           │
          │                │          ▼           ▼
          │                │     SMART BOARD  ATTENDANCE
          │                │                    TERMINAL
          │                │
          └────────────────┴──────────────┐
                                          │
                                          ▼
                                       BACKEND
```

The **Smart Board** displays classroom information.

The **Attendance Terminal** captures barcode/QR scans.

The **Backend** processes and stores the resulting events, and remains the single source of truth for every decision made above.

---

# 3. School Structure

Kakshyasathi is designed specifically for **one school**.

```text
School
 │
 ├── Classes
 │     │
 │     ├── Section A
 │     ├── Section B
 │     └── Section C
 │
 ├── Subjects
 │
 ├── Teachers
 │
 ├── Students
 │
 ├── Classrooms
 │     │
 │     ├── Smart Boards
 │     └── Attendance Terminals
 │
 └── Timetables
```

All classroom-related operations are performed at the **Section/Classroom level**.

A Section represents the group of students.

A Classroom represents the physical location.

A Smart Board represents the display device installed in that classroom.

An Attendance Terminal represents the physical attendance device installed in that classroom.

---

# 4. Roles

The system has three human roles and two device types.

```text
Human Roles
│
├── Admin
├── Teacher
└── Student

Devices
│
├── Smart Board
└── Attendance Terminal
```

The two devices have completely different responsibilities.

```text
SMART BOARD
    │
    └── Display information

ATTENDANCE TERMINAL
    │
    └── Capture attendance events
```

---

# 5. Admin

The Admin manages the complete school system.

The Admin manages:

- Academic year
- Students
- Teachers
- Classes
- Sections
- Subjects
- Classrooms
- Smart Boards
- Attendance Terminals
- Student-section assignments
- Global timetable
- Section timetables (including embedded period-timing overrides)
- Teacher assignments
- Substitute teachers
- Attendance records
- Device status
- Notices

Users are created and managed by the Admin.

Students and teachers do not create their own school accounts.

---

# 6. Teacher

Teachers receive credentials from the school.

A teacher can access:

- Personal timetable
- Assigned Sections
- Substitute assignments
- Notices
- Classroom presence history
- Personal presence information

When entering a classroom, the teacher scans their school ID card using the **Attendance Terminal installed in that classroom**.

The teacher does not interact with the Smart Board for attendance.

---

# 7. Student

Students receive their credentials from the school.

A student can access:

- Personal attendance
- Attendance history
- Timetable
- Notices
- Profile
- Section information

The student does not manually enter attendance.

Their ID card is scanned using the **Attendance Terminal**.

---

# 8. Smart Board

Every classroom has a Smart Board registered with Kakshyasathi.

The Smart Board is **not connected to the barcode scanner**.

Its purpose is to act as the classroom's information and display system.

```text
Smart Board
     │
     ▼
Classroom
     │
     ▼
Backend
     │
     ├── Timetable
     ├── Current Period
     ├── Teacher
     ├── Attendance
     ├── Substitution
     └── Notices
```

The Smart Board displays:

- Current date
- Current time
- Current period
- Subject
- Teacher
- Substitute teacher
- Period start/end time
- Next period
- Attendance summary
- Notices
- Timetable information
- Classroom status

The Smart Board continuously communicates with the backend to receive updated classroom information.

---

# 9. Attendance Terminal

Every classroom has a separate Attendance Terminal.

The Attendance Terminal is responsible for physically capturing student and teacher scans.

```text
              ATTENDANCE TERMINAL
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
       Scanner        RTC         MicroSD
        GM66        DS3231        Storage
          │
          ▼
        ESP32
          │
     ┌────┴────┐
     ▼         ▼
   Wi-Fi    Buzzer/LED
```

The terminal contains:

- **ESP32** — main controller
- **GM66 1D/2D Scanner** — barcode and QR scanner
- **DS3231 RTC** — accurate local timestamp
- **MicroSD** — offline event queue
- **Active Buzzer** — audio feedback
- **LEDs** — visual feedback

---

# 10. Attendance Terminal Identity

Each Attendance Terminal has its own permanent identity, tied to the room it is installed in — not to any particular Section.

For example:

```text
Attendance Terminal
        │
        ▼
AT-204
        │
        ▼
Classroom 204
```

This matters because a classroom can be used by different Sections at different times of day.

```text
Room 204
│
├── Period 1 → Section 10A
├── Period 2 → Section 11B
└── Period 3 → Section 12A
```

The backend determines which Section is currently using the classroom from the effective timetable, so the terminal itself never needs reconfiguring as the day progresses.

---

# 11. Attendance Terminal Hardware

The hardware architecture is:

```text
                    GM66
                     │
                  UART TTL
                     │
                     ▼
                   ESP32
                ┌────┼────┐
                │    │    │
                ▼    ▼    ▼
             DS3231 SD Card Wi-Fi
                │
                │
                ├───────────────┐
                │               │
                ▼               ▼
             Timestamp       Backend
                                │
                                ▼
                           Central System
```

The ESP32 controls the complete terminal.

---

# 12. Barcode and QR Scanning

The GM66 scanner supports:

- 1D barcodes
- 2D QR codes

The scanner reads the optical pattern and sends the decoded value to the ESP32 through UART TTL.

```text
Student / Teacher
       │
       ▼
School ID Card
       │
       ▼
Barcode / QR
       │
       ▼
GM66 Scanner
       │
       ▼
ESP32
       │
       ▼
Attendance Event
```

The same terminal can therefore identify both students and teachers, using the same card and the same scanner.

---

# 13. Attendance Event

A physical scan should first be treated as an **Attendance Scan Event**, independent of whatever the backend later decides it means.

The event contains information such as:

```text
Event ID
Terminal ID
Barcode
Scan Timestamp
Sequence Number
Sync Status
```

For example:

```text
Event ID:
AT-204-0001842

Terminal:
AT-204

Barcode:
STU-00124

Scan Time:
10:18:23

Sequence:
1842
```

The backend then interprets this event and determines what the scan means.

---

# 14. Online Attendance Flow

When the terminal has an active network connection:

```text
Student
   │
   ▼
Scans ID Card
   │
   ▼
GM66
   │
   ▼
ESP32
   │
   ▼
Create Scan Event
   │
   ▼
Send to Backend
   │
   ▼
Backend validates event
   │
   ▼
Identify Student
   │
   ▼
Identify Terminal
   │
   ▼
Identify Classroom
   │
   ▼
Determine Current Session
   │
   ▼
Create Attendance Record
```

The terminal immediately receives the result.

```text
SUCCESS
   │
   ├── Green LED
   └── Success beep
```

---

# 15. Offline Attendance Flow

The Attendance Terminal must continue working even when Wi-Fi or the backend is unavailable.

```text
Student
   │
   ▼
Scan ID Card
   │
   ▼
GM66
   │
   ▼
ESP32
   │
   ▼
DS3231 Timestamp
   │
   ▼
Save Event to MicroSD
   │
   ▼
Mark Event as Pending
   │
   ▼
Audio + Visual Feedback
```

For example:

```text
Wi-Fi unavailable

Student scans

        ↓

AT-204-0001842
STU-00124
10:18:23

        ↓

Saved locally ✓
```

The student does not have to wait for the server, and gets the same feedback as an online scan.

---

# 16. Offline Queue

The MicroSD card acts as the local queue.

```text
MicroSD
│
├── AT-204-0001842
├── AT-204-0001843
├── AT-204-0001844
├── AT-204-0001845
└── AT-204-0001846
```

Each record remains locally stored until the backend confirms successful synchronization.

This prevents attendance data from being lost because of temporary network failure.

---

# 17. Automatic Synchronization

When the network connection is restored:

```text
Wi-Fi Restored
      │
      ▼
Attendance Terminal
      │
      ▼
Read Pending Events
      │
      ▼
Send Events to Backend
      │
      ▼
Backend Validates
      │
      ▼
Backend Acknowledges
      │
      ▼
Mark Events as Synced
      │
      ▼
Remove / Archive Local Events
```

The terminal automatically performs this process without requiring manual intervention.

---

# 18. Reliable Synchronization

Every scan should have a unique Event ID or sequence number, scoped to its terminal.

For example:

```text
AT-204-0001842
AT-204-0001843
AT-204-0001844
```

This prevents duplicate attendance when a synchronization request is retried.

For example:

```text
Terminal sends:

AT-204-0001842

        ↓

Backend saves event

        ↓

Network response is lost

        ↓

Terminal sends again

        ↓

Backend sees:

AT-204-0001842 already processed

        ↓

No duplicate record
```

---

# 19. DS3231 RTC

The DS3231 provides the terminal with an accurate local timestamp, independent of the network.

This matters because attendance may be captured while the terminal has no network connection.

```text
                 Internet
                    │
                    ▼
              Synchronize Time
                    │
                    ▼
                  DS3231
                    │
                    ▼
              Accurate Local Time
                    │
                    ▼
                Scan Event
```

The system maintains two timestamps:

```text
Scanned At
Received At
```

For example:

```text
Scanned At:
10:18:23

Received At:
10:25:41
```

The **scanned time** represents when the student actually scanned.

The backend receiving the event later should never make the student appear late merely because the network was unavailable at the time — lateness is always judged against Scanned At, not Received At.

---

# 20. Attendance Session

The backend determines the attendance session associated with a scan.

```text
Attendance Terminal
        │
        ▼
Classroom
        │
        ▼
Current Date + Time
        │
        ▼
Effective Timetable
        │
        ▼
Current Section
        │
        ▼
Current Period
        │
        ▼
Attendance Session
```

The terminal does not need to make the final business decision.

The backend remains the source of truth.

---

# 21. Student Attendance

With this terminal architecture, the student flow is:

```text
Student arrives
      │
      ▼
Scans ID card
      │
      ▼
Attendance Terminal
      │
      ▼
Scan Event
      │
      ▼
Backend
      │
      ▼
Identify Student
      │
      ▼
Determine Classroom
      │
      ▼
Determine Current Session
      │
      ▼
Validate Student
      │
      ▼
Mark Attendance
```

The system prevents duplicate attendance for the same attendance session.

---

# 22. Teacher Classroom Presence

Teacher presence is tracked separately from student attendance.

```text
Teacher
   │
   ▼
Enters Classroom
   │
   ▼
Scans ID Card
   │
   ▼
Attendance Terminal
   │
   ▼
Scan Event
   │
   ▼
Backend
   │
   ▼
Identify Teacher
   │
   ▼
Identify Classroom
   │
   ▼
Identify Current Period
   │
   ▼
Record Teacher Entry
```

The system can therefore record:

```text
Teacher
+
Date
+
Classroom
+
Section
+
Period
+
Entry Time
```

---

# 23. Teacher Exit

The same terminal records teacher exit activity, using the same scan.

Conceptually:

```text
Teacher scans
      │
      ▼
Determine current presence state
      │
      ├── Not inside
      │      ↓
      │    ENTER
      │
      └── Already inside
             ↓
            EXIT
```

Therefore the system can maintain:

```text
10:12:31
Mr. Sharma
ENTER
Room 204

10:59:12
Mr. Sharma
EXIT
Room 204
```

This creates a historical classroom-presence record without any extra action from the teacher.

---

# 24. Global Timetable

The global timetable defines when normal periods occur.

```text
Period 1
10:15 – 11:00

Period 2
11:00 – 11:45

Period 3
11:45 – 12:30

Period 4
12:30 – 1:15
```

The global timetable defines **when periods normally occur**.

It does not determine which subject or teacher belongs to a particular Section.

---

# 25. Section Timetable

Each Section has its own timetable.

```text
Grade 10 - Section A
Sunday

│
├── Period 1 → Mathematics → Teacher A
├── Period 2 → Science → Teacher B
├── Period 3 → English → Teacher C
└── Period 4 → Computer → Teacher D
```

The Section timetable represents the normal weekly schedule.

---

# 26. Classroom Assignment

The physical classroom is separate from the Section.

```text
Section
   │
   ▼
Timetable Entry
   │
   ▼
Classroom
   │
   ├──────────────┐
   ▼              ▼
Smart Board   Attendance Terminal
```

Both devices know which physical classroom they belong to, while the timetable determines which Section is using that classroom at a particular time.

---

# 27. Effective Timetable

The system determines the actual schedule by combining:

```text
Section Timetable Entry
  (section + day + period,
   with its own timing already
   embedded on the entry)
      +
Global Period
  (fallback timing, used only
   when the entry has no
   embedded override)
      +
Substitution
  (date-specific teacher change)
      ↓
Effective Classroom Schedule
```

This determines:

- Current period
- Current subject
- Effective teacher
- Substitute teacher
- Actual start time
- Actual end time
- Next period

A substitution is layered on top of the Section Timetable at read time — it is date-specific, so it is never written into the weekly schedule itself. Period timing works differently: it lives directly on the Section Timetable entry (see §29), so no separate date-scoped layer is needed to resolve it.

---

# 28. Substitute Teacher Flow

If the regular teacher is absent:

```text
Regular Timetable
       │
       ▼
Teacher Absent
       │
       ▼
Admin Assigns Substitute
       │
       ▼
Effective Timetable Changes
for Specific Day
       │
       ├───────────────┐
       ▼               ▼
Smart Board       Attendance
displays           Terminal
substitute        recognizes
teacher            effective teacher
```

The normal timetable is not permanently modified.

---

# 29. Special Period Timing

Some sections need a period to run on a different schedule than the rest of the school, on a recurring basis — not just for one date. A common example is a practical/lab period.

```text
Normal Period 4 (Global Timetable)
12:10 – 12:50

Section 12-D, Friday, Period 4 (Physics Practical)
12:10 – 1:10
```

Rather than layering this on as a separate date-based override, the custom timing is **embedded directly on that section's timetable entry** for that day and period. Every other section's Period 4 on the Global Timetable is untouched — only Section 12-D's Friday-Period-4 entry carries its own `customStartTime`/`customEndTime`.

```text
Section Timetable Entry
│
├── section:   12-D
├── dayOfWeek: friday
├── period:    4
├── subject:   Physics (Practical)
├── customStartTime: 12:10
└── customEndTime:   1:10
```

Because the lab period runs longer, the section's break afterward is naturally shorter that day — the next period (or the tiffin break) for that section simply starts once Period 4 actually ends, without needing a separate rule for the break itself.

If the entry has no `customStartTime`/`customEndTime`, the section is assumed to follow the Global Timetable's normal period timing for that period.

---

# 30. Smart Board Daily Operation

The Smart Board continuously monitors the classroom schedule.

```text
Current Time
     │
     ▼
Determine Current Period
     │
     ▼
Find Section Timetable Entry
  (its timing is already
   embedded on the entry)
     │
     ▼
Check Substitution
     │
     ▼
Display Effective Classroom Information
```

The Smart Board does not need to know anything about the physical scanner.

It receives the processed classroom state from the backend.

---

# 31. Attendance Terminal vs Smart Board

The responsibilities are intentionally separated.

```text
┌──────────────────────┬─────────────────────────┐
│ SMART BOARD          │ ATTENDANCE TERMINAL     │
├──────────────────────┼─────────────────────────┤
│ Display date/time    │ Scan barcode/QR         │
│ Display period       │ Timestamp scan           │
│ Display subject      │ Store offline events     │
│ Display teacher      │ Synchronize events       │
│ Display attendance   │ Buzzer feedback          │
│ Display notices      │ LED feedback             │
│ Display timetable    │ Wi-Fi communication      │
│ Display substitute   │                          │
└──────────────────────┴─────────────────────────┘
```

This separation makes the system more reliable and easier to maintain: a fault in one device never disables the other.

---

# 32. Backend Communication

The communication architecture:

```text
                   BACKEND
                      │
          ┌───────────┴───────────┐
          │                       │
          ▼                       ▼
    Smart Board             Attendance Terminal
          │                       │
          │                       │
    REST/WebSocket            REST/API
          │                       │
          ▼                       ▼
      Display                Scan Events
```

The Attendance Terminal never needs to communicate directly with the Smart Board.

The backend acts as the central source of truth.

---

# 33. Real-Time Attendance Update

When a student scans successfully:

```text
Student
   │
   ▼
Attendance Terminal
   │
   ▼
Backend
   │
   ├── Save Attendance
   │
   └── Publish Update
             │
             ▼
        Smart Board
             │
             ▼
     Attendance count updates
```

For example:

```text
Before:

Present: 31

Student scans

        ↓

Backend processes scan

        ↓

Smart Board:

Present: 32
```

---

# 34. Notice System

The Admin can send notices to:

### All Sections

```text
Notice
   ↓
Every Section
   ↓
Every relevant Smart Board
   ↓
Students
```

### One Section

```text
Notice
   ↓
Section 10-A
   ↓
10-A Smart Board
   ↓
Students of 10-A
```

### Multiple Selected Sections

```text
Notice
   ↓
10-A
10-B
9-A
   ↓
Selected Smart Boards
   +
Selected Students
```

The targeting system remains independent from the Attendance Terminal.

---

# 35. Student Experience

```text
Receive School Credentials
          │
          ▼
        Login
          │
          ▼
    Student Portal
          │
     ┌────┼─────┐
     ▼    ▼     ▼
Attendance Timetable Notices
```

The student can view historical attendance throughout the academic year.

---

# 36. Teacher Experience

```text
Receive Credentials
        │
        ▼
      Login
        │
        ▼
  Teacher Portal
        │
   ┌────┼─────────┐
   ▼    ▼         ▼
Timetable Sections Notices
        │
        ▼
Classroom Presence
```

Teacher classroom presence is generated primarily from the Attendance Terminal scans.

---

# 37. Admin Experience

```text
                         ADMIN
                           │
          ┌────────────────┼─────────────────┐
          ▼                ▼                 ▼
        Users           Classes           Subjects
                           │
                           ▼
                        Sections
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
        Classrooms     Smart Boards   Attendance
                                      Terminals
             │
             ▼
         Timetable
             │
      ┌──────┼──────┐
      ▼      ▼      ▼
Substitution Timing Notices
```

The Admin can also monitor Attendance Terminal status in real time:

```text
AT-204
Online ✓

AT-205
Offline ⚠

AT-206
Syncing...

AT-207
Maintenance
```

---

# 38. Complete Classroom Architecture

The final physical classroom architecture is:

```text
                         CLASSROOM
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
        ┌─────────────┐             ┌─────────────────┐
        │ SMART BOARD │             │   ATTENDANCE    │
        │             │             │    TERMINAL     │
        │ Display     │             │                 │
        │ Schedule    │             │ ESP32           │
        │ Period      │             │ GM66            │
        │ Teacher     │             │ DS3231          │
        │ Notices     │             │ MicroSD         │
        │ Attendance  │             │ Buzzer + LEDs   │
        └──────┬──────┘             └────────┬────────┘
               │                             │
               │                             │
               └──────────────┬──────────────┘
                              │
                              ▼
                           BACKEND
```

---

# 39. Complete School-Day Flow

```text
                    START OF DAY
                          │
                          ▼
                  Students arrive
                          │
                          ▼
                  Scan ID Cards
                          │
                          ▼
                Attendance Terminal
                          │
                 ┌────────┴────────┐
                 │                 │
              Online            Offline
                 │                 │
                 ▼                 ▼
              Backend           MicroSD
                 │                 │
                 │            Network returns
                 │                 │
                 │                 ▼
                 │              Backend
                 │                 │
                 └────────┬────────┘
                          ▼
                 Attendance Processed
                          │
                          ▼
                    Classes Begin
                          │
                          ▼
                  Teacher Enters
                          │
                          ▼
                 Teacher Scans ID
                          │
                          ▼
                 Teacher Presence
                          │
                          ▼
                  Period Continues
                          │
             ┌────────────┴────────────┐
             │                         │
             ▼                         ▼
        Smart Board              Attendance Terminal
        displays class           records scans
             │                         │
             └────────────┬────────────┘
                          ▼
                       Backend
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
         Attendance    Presence      Notices
             │            │            │
             ▼            ▼            ▼
        Smart Board   Admin Panel   Students
                          │
                          ▼
                    Next Period
                          │
                          ▼
                 Repeat Throughout Day
```

---

# 40. Final System Architecture

```text
                           KAKSHYASATHI
                                │
        ┌───────────────────────┼────────────────────────┐
        │                       │                        │
        ▼                       ▼                        ▼
     ADMIN                  BACKEND                 USERS
        │                       │               ┌──────┼──────┐
        │                       │               ▼      ▼      ▼
        │                       │            Student Teacher Admin
        │                       │
        │          ┌────────────┼────────────┐
        │          │            │            │
        ▼          ▼            ▼            ▼
   Management  Timetable   Attendance     Notices
                    │            │
                    │            ▼
                    │      Scan Events
                    │            │
                    │            ▼
                    │     Attendance Terminal
                    │            │
                    │      ┌─────┼─────┐
                    │      ▼     ▼     ▼
                    │    GM66  RTC    SD
                    │      │
                    │     ESP32
                    │
                    ▼
               Classroom
                    │
              ┌─────┴─────┐
              ▼           ▼
         Smart Board  Attendance
                      Terminal
              │           │
              │           │
              └─────┬─────┘
                    │
                    ▼
                 BACKEND
                    │
          ┌─────────┼──────────┐
          ▼         ▼          ▼
      Smart Board  Admin    Student
       Display     Panel     Portal
```

---

## Core Architectural Principle

> **The Smart Board represents the classroom's visual state, while the Attendance Terminal represents the classroom's physical attendance input. Both are independently connected to the backend and are associated with the same physical classroom.**

The backend remains the **central source of truth** for timetable, attendance sessions, teacher presence, substitutions, notices, and classroom state.