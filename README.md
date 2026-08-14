# Kakshyasathi — Smart Attendance & Classroom Display System

## 1. Solution Overview

**Kakshyasathi** is a smart classroom management system designed to connect the school's **students, teachers, administrators, and classroom Smart Boards** into one centralized platform.

The system replaces manual attendance and classroom information management with an automated system using the **barcode already printed on every school ID card**.

The key idea is simple:

> **The Smart Board becomes the central device inside each classroom.**

A barcode scanner is connected directly to the Android Smart Board. When a student or teacher scans their existing school ID card, the Smart Board sends the scanned ID to Kakshyasathi, which identifies the person and performs the appropriate action.

There is **no need for new ID cards, fingerprint scanners, ESP devices, or paper attendance**.

---

# 2. Core System Architecture

```text
                         KAKSHYASATHI
                              │
             ┌────────────────┴────────────────┐
             │                                 │
       Central System                     Classroom System
       Next.js + MongoDB                 Android Smart Board
             │                                 │
             │                         ┌───────┴────────┐
             │                         │                │
             │                   Kakshyasathi PWA   Barcode Scanner
             │                         │                │
             └──────────── Internet ───┴────────────────┘
```

The school has one central Kakshyasathi system, while every classroom has its own Smart Board running the Kakshyasathi PWA.

---

# 3. The Four Main Roles

Kakshyasathi has four major entities/roles.

### ADMIN

The central management authority.

The admin can:

* Manage students
* Manage teachers
* Manage classes
* Create and modify schedules
* Assign teachers
* Assign substitutes
* Manage classrooms
* Send notices
* Monitor attendance
* View teacher presence
* View classroom activity
* Manage school-wide settings

---

### TEACHER

Teachers use Kakshyasathi to:

* View their timetable
* See assigned classes
* Check their classroom assignments
* Scan their ID when entering a classroom
* View class attendance
* Monitor students
* View notices
* View their teaching history

---

### STUDENT

Students can:

* View their timetable
* View attendance
* View attendance history
* View notices
* See upcoming periods
* View their class information

Students don't create accounts themselves.

Their accounts are **created and managed by the school**.

---

### CLASSROOM / SMART BOARD

The classroom isn't a normal user account.

Instead, each Smart Board is registered as a **classroom device**.

For example:

```text
Grade 12 - A
     │
     └── Smart Board #12A
```

The Smart Board knows:

* Which classroom it belongs to
* Current period
* Current subject
* Assigned teacher
* Substitute teacher
* Attendance status
* Notices
* Next period

---

# 4. Smart Board Architecture

Every classroom Smart Board runs the Kakshyasathi PWA.

The Smart Board is connected directly to the barcode scanner.

```text
Student ID
     │
     ▼
Barcode
     │
     ▼
Barcode Scanner
     │
     │ USB / Bluetooth
     ▼
Android Smart Board
     │
     ▼
Kakshyasathi PWA
     │
     ▼
Kakshyasathi Server
```

The barcode scanner behaves like an input device.

The Smart Board doesn't need an ESP or another intermediate device.

This reduces:

* Hardware cost
* Complexity
* Installation requirements
* Failure points
* Maintenance

---

# 5. Attendance Flow

The attendance system is designed to work automatically.

## Student enters classroom

```text
Student enters class
        │
        ▼
Scans existing school ID card
        │
        ▼
Barcode scanner reads ID
        │
        ▼
Smart Board receives ID
        │
        ▼
Kakshyasathi identifies student
        │
        ▼
Checks current classroom
        │
        ▼
Checks current period
        │
        ▼
Checks student's class
        │
        ▼
Attendance recorded
```

The student doesn't need to:

* Enter their name
* Enter a username
* Press an attendance button
* Use a fingerprint scanner
* Carry another card

---

# 6. Attendance Validation

Kakshyasathi doesn't blindly mark someone present.

When a barcode is scanned, the system checks the context.

For example:

```text
Barcode
   │
   ▼
Identify Student
   │
   ▼
Which class does the student belong to?
   │
   ▼
Which classroom is scanning?
   │
   ▼
What period is currently active?
   │
   ▼
Is the student expected in this classroom?
   │
   ├── YES ──→ Mark Present
   │
   └── NO ───→ Reject / Flag Scan
```

This prevents a student from another class accidentally being marked present in the wrong classroom.

---

# 7. Attendance on the Smart Board

The Smart Board continuously displays the live attendance.

For example:

```text
┌─────────────────────────────────────────────┐
│             GRADE 12 — A                    │
│                                             │
│             Mathematics                     │
│             Period 3                        │
│                                             │
│             Mr. Sharma                      │
│                                             │
│          ┌─────────────────┐                │
│          │    37 / 40      │                │
│          │     PRESENT     │                │
│          └─────────────────┘                │
│                                             │
│        Attendance is active                 │
│                                             │
│ Next Period                                 │
│ Physics • 11:00 AM • Mrs. Thapa             │
└─────────────────────────────────────────────┘
```

When a student scans:

```text
✓ PRESENT

Sagar Thapa

Attendance recorded
```

The confirmation appears temporarily and then the board returns to the normal classroom display.

---

# 8. Teacher Attendance & Classroom Presence

The same barcode system is used for teachers.

When a teacher enters the classroom:

```text
Teacher enters
      │
      ▼
Scans ID card
      │
      ▼
Smart Board identifies teacher
      │
      ▼
Checks current period
      │
      ▼
Checks scheduled teacher
      │
      ▼
Teacher presence recorded
```

The system records:

* Teacher
* Classroom
* Subject
* Period
* Date
* Entry time
* Exit time

This creates a history of classroom activity.

---

# 9. Substitute Teacher System

The admin can assign a substitute when the normal teacher is unavailable.

For example:

```text
Normal Schedule

Period 4
Mathematics
Mr. Sharma
```

Admin changes the schedule for that day:

```text
Substitute

Period 4
Mathematics
Mrs. Thapa
```

The Smart Board automatically displays:

```text
Mathematics

Teacher:
Mrs. Thapa

Substitute for:
Mr. Sharma
```

When Mrs. Thapa scans her ID:

```text
Teacher scanned
       │
       ▼
Kakshyasathi checks today's schedule
       │
       ▼
Substitute assigned?
       │
       ▼
YES
       │
       ▼
Teacher presence recorded
```

This removes confusion about who is supposed to teach the class.

---

# 10. Timetable System

The timetable is centrally controlled by the administrator.

For each period:

```text
Period
   │
   ├── Start time
   ├── End time
   ├── Subject
   ├── Teacher
   ├── Class
   └── Classroom
```

The Smart Board automatically determines the current period based on the time.

For example:

```text
10:00 – 10:45
Mathematics
Mr. Sharma

10:45 – 11:30
Physics
Mrs. Thapa
```

At 10:45, the Smart Board automatically changes to Physics.

---

# 11. Smart Board Main Screen

The Smart Board should primarily act as a **classroom information display**, rather than looking like a normal dashboard.

A typical screen:

```text
┌─────────────────────────────────────────────────────────────┐
│ KAKSHYASATHI                               Friday, 10:42 AM  │
│                                                             │
│ Grade 12 — A                                                │
│                                                             │
│                    MATHEMATICS                              │
│                       Period 3                              │
│                                                             │
│                    Mr. Sharma                               │
│                                                             │
│              Attendance: 37 / 40                            │
│                                                             │
│              ─────────────────────                          │
│                                                             │
│ Next Period                                                 │
│ Physics • 11:00 AM • Mrs. Thapa                            │
│                                                             │
│ ─────────────────────────────────────────────────────────── │
│ 📢 Notice: Science Exhibition tomorrow                     │
└─────────────────────────────────────────────────────────────┘
```

The interface should require almost no interaction from teachers or students.

---

# 12. Live Clock & Period Information

The Smart Board continuously shows:

* Current date
* Current time
* Current period
* Period start time
* Period end time
* Subject
* Teacher
* Substitute teacher
* Next period

This means the Smart Board becomes a **digital classroom timetable**.

---

# 13. Notice / Announcement System

Administrators can send notices from the central dashboard.

There are two major types.

### Class-specific notice

Example:

```text
Grade 12-A

"Physics practical will be held tomorrow."
```

Only the Smart Board of Grade 12-A receives it.

Students in that class can also see the notice in their student portal.

---

### School-wide notice

Example:

```text
ALL CLASSES

"School will remain closed tomorrow."
```

The notice is broadcast to:

```text
Smart Board 1
Smart Board 2
Smart Board 3
Smart Board 4
...
```

and also appears in student accounts.

---

# 14. Notice Flow

```text
Admin Dashboard
       │
       ▼
Create Notice
       │
       ▼
Select Audience
       │
       ├── Specific Class
       │
       └── All Classes
       │
       ▼
Kakshyasathi Server
       │
       ├───────────────┐
       ▼               ▼
Smart Boards       Student Accounts
```

This gives the school one centralized announcement system.

---

# 15. Student Dashboard

Students don't need to manage attendance manually.

Their dashboard can show:

```text
Good Morning, Sagar

Grade 12 — A

Today's Schedule

09:00  Mathematics
10:00  Physics
11:00  Chemistry
12:00  Computer Science
```

Then:

```text
Attendance

Mathematics       94%
Physics           91%
Chemistry         97%
Computer Science  96%

Overall           94.5%
```

Students can also view:

* Attendance history
* Timetable
* Notices
* Upcoming periods
* Class information

---

# 16. Attendance History

Instead of only showing:

```text
Present: 37 / 40
```

the system stores historical records.

For example:

```text
August 14

Mathematics
✓ Present
10:02 AM

Physics
✓ Present
10:48 AM

Chemistry
✓ Present
11:31 AM
```

Students can see their attendance over:

* Today
* This week
* This month
* Semester
* Academic year

---

# 17. Admin Dashboard

The administrator gets the central control center.

The dashboard can contain:

```text
┌─────────────────────────────────────────────┐
│ Kakshyasathi Admin                         │
├─────────────────────────────────────────────┤
│                                             │
│  Students       Teachers       Classes      │
│    842             56             24        │
│                                             │
│  Today's Attendance                         │
│       94.2%                                 │
│                                             │
│  Active Classrooms                          │
│       23 / 24                               │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  Schedule                                    │
│  Substitutes                                 │
│  Attendance                                  │
│  Notices                                     │
│  Teachers                                    │
│  Students                                    │
│  Classes                                     │
│  Smart Boards                                │
│                                             │
└─────────────────────────────────────────────┘
```

---

# 18. Admin Schedule Management

The admin can manage the entire school's timetable from one location.

```text
Class
   │
   ▼
Grade 12-A
   │
   ▼
Monday
   │
   ├── Period 1 → Mathematics → Mr. Sharma
   ├── Period 2 → Physics → Mrs. Thapa
   ├── Period 3 → Chemistry → Mr. Rai
   └── Period 4 → Computer → Mrs. Gurung
```

If something changes, the Smart Board automatically receives the updated schedule.

---

# 19. Smart Board Registration

Each classroom Smart Board should be registered with Kakshyasathi.

For example:

```text
Smart Board ID: SB-12A-01

Assigned Classroom:
Grade 12-A

Status:
● Online

Last active:
10:42 AM
```

The administrator can see whether classroom devices are functioning.

For example:

```text
Classroom       Device Status
──────────────────────────────
12-A            🟢 Online
12-B            🟢 Online
11-A            🟢 Online
11-B            🔴 Offline
10-A            🟢 Online
```

This is useful for maintenance.

---

# 20. Offline Support

A realistic school system should not completely stop if the internet temporarily fails.

The Smart Board can temporarily store attendance events locally.

```text
Student scans
     │
     ▼
Smart Board
     │
     ▼
Internet available?
     │
 ┌───┴────┐
 │        │
YES       NO
 │        │
 ▼        ▼
Server   Local queue
 │        │
 ▼        │
MongoDB  Internet returns
          │
          ▼
       Server
          │
          ▼
       MongoDB
```

This means a temporary network problem doesn't necessarily cause attendance loss.

---

# 21. Complete Attendance Architecture

The complete attendance flow becomes:

```text
                    STUDENT
                       │
                  ID CARD SCAN
                       │
                       ▼
              BARCODE SCANNER
                       │
                       ▼
                SMART BOARD
                       │
                       ▼
              KAKSHYASATHI PWA
                       │
                       ▼
                Identify User
                       │
                       ▼
              Check Current Period
                       │
                       ▼
               Check Classroom
                       │
                       ▼
             Check Class Membership
                       │
                       ▼
               Record Attendance
                       │
                       ▼
                Central Server
                       │
                       ▼
                    MongoDB
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
        Admin Dashboard      Student Portal
```

---

# 22. Complete Teacher Flow

```text
Teacher enters classroom
          │
          ▼
     Scan ID Card
          │
          ▼
    Smart Board reads ID
          │
          ▼
    Identify teacher
          │
          ▼
    Check today's schedule
          │
          ├── Scheduled teacher
          │
          └── Substitute teacher
          │
          ▼
    Record teacher entry
          │
          ▼
    Classroom becomes active
```

When the teacher leaves, another scan can record the exit event.

---

# 23. Complete Notice Flow

```text
                 ADMIN
                   │
                   ▼
             Create Notice
                   │
                   ▼
            Select Audience
                   │
          ┌────────┴─────────┐
          ▼                  ▼
      One Class          All Classes
          │                  │
          └────────┬─────────┘
                   ▼
             Kakshyasathi
                Server
                   │
          ┌────────┴──────────┐
          ▼                   ▼
     Smart Boards        Student Portal
```

---

# 24. Complete System

The final Kakshyasathi ecosystem would look like:

```text
                         KAKSHYASATHI
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
           CENTRAL SYSTEM              CLASSROOM SYSTEM
                 │                           │
        Next.js Full Stack             Android Smart Board
                 │                           │
             MongoDB                  Kakshyasathi PWA
                 │                           │
        ┌────────┼────────┐             Barcode Scanner
        │        │        │                   │
      ADMIN   TEACHER  STUDENT               │
        │        │        │                   │
        │        │        │                   │
        └────────┼────────┼───────────────────┘
                 │
                 ▼
       ┌──────────────────────┐
       │ Attendance            │
       │ Timetable             │
       │ Teacher Presence      │
       │ Substitutes           │
       │ Notices               │
       │ Classroom Display     │
       │ Student Portal        │
       └──────────────────────┘
```

## The core idea for your proposal

I would present the innovation in one sentence:

> **“Kakshyasathi turns every classroom Smart Board into an intelligent classroom hub, using the barcode already present on school ID cards to automate attendance, teacher presence, schedules and announcements through one centralized school management system.”**

And your biggest design advantage is now:

**No ESP. No new ID cards. No fingerprint scanner. No paper attendance. No separate classroom computer.**

The **existing Android Smart Board + directly connected barcode scanner + Kakshyasathi PWA** form the classroom system, while the central Next.js/MongoDB application manages the entire school.
