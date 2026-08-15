# Kakshyasathi — Overall System Design

> **Kakshyasathi** is a dedicated Smart Classroom Management System for a single school. It combines student attendance, teacher classroom presence, timetables, substitute teachers, classroom Smart Boards, notices, and personal academic information into one centralized platform.
>
> The system uses the **barcode already present on school ID cards**. Students and teachers do not need new cards or biometric devices. Each classroom Smart Board is connected to a barcode reader and acts as the information center for its Section.
>
> Kakshyasathi is designed as a **full-stack Next.js Progressive Web App (PWA)** backed by **MongoDB/Mongoose**, with separate experiences and API boundaries for Admin, Teacher, Student, and Smart Board.

---

# 1. Problem Overview

The existing classroom process has several activities that are handled independently:

- Student attendance is manually recorded.
- There is no simple way to record when a teacher actually enters their classroom.
- Substitute teachers may not be immediately visible to students.
- Timetable changes may occur for specific days or periods.
- Special periods may require different start or end times.
- Notices may need to reach all classes, one class, or several selected classes.
- Students need an easy way to view their attendance and timetable.
- Smart Boards are present in classrooms but can also serve as a source of live classroom information.

Kakshyasathi brings these activities together into one system.

---

# 2. Proposed Solution

The central idea is simple:

> **Turn the classroom Smart Board into a connected classroom information center while using the school's existing ID-card barcode for attendance and teacher identification.**

The system has four main participants:

```text
             ADMIN
               │
               │ manages
               ▼
       KAKSHYASATHI SYSTEM
          │     │     │
          │     │     │
          ▼     ▼     ▼
      STUDENT TEACHER SMART BOARD
                         │
                         ▼
                     CLASSROOM
```

The Admin manages the school's academic structure and daily changes.

Students use their ID cards for daily attendance.

Teachers use their ID cards when entering their assigned classroom.

Smart Boards display the current classroom information.

---

# 3. School Structure

Kakshyasathi is designed specifically for **one school**.

There is no multi-school or multi-tenant architecture.

The academic structure is:

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
 └── Smart Boards
```

A Class can contain multiple Sections.

For example:

```text
Grade 10
├── Section A
├── Section B
└── Section C
```

All classroom-related operations are performed at the **Section level**.

Therefore:

- Students belong to a Section.
- Smart Boards belong to a Section.
- Timetables belong to a Section.
- Attendance belongs to a Section.
- Notices can target Sections.
- Teacher assignments are associated with Sections.

---

# 4. Roles

The system has three human roles and one device role.

```text
Human Roles
│
├── Admin
├── Teacher
└── Student

Device
└── Smart Board
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
- Smart Boards
- Student-section assignments
- Global timetable
- Section timetables
- Teacher assignments
- Substitute teachers
- Period-time overrides
- Attendance records
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
- Personal attendance/presence information

When entering a classroom for a period, the teacher scans their school ID card.

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

Their attendance is recorded through their ID-card barcode.

---

# 8. Smart Board

Every classroom has a Smart Board registered with Kakshyasathi.

Each Smart Board is linked to one Section.

For example:

```text
Smart Board SB-001
        │
        ▼
Grade 10 - Section A
```

The Smart Board therefore automatically knows which classroom it represents.

It displays:

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

---

# 9. Barcode-Based Attendance

The school already provides students and teachers with ID cards containing barcodes.

Kakshyasathi reuses those barcodes.

```text
School ID Card
      │
      ▼
   Barcode
      │
      ▼
Barcode Reader
      │
      ▼
Smart Board
      │
      ▼
Kakshyasathi
```

The barcode value corresponds to the user's school account identifier.

No separate barcode field is required if the system uses the username itself as the barcode value.

---

# 10. Student Attendance Flow

Student attendance is **day-based**, not period-based.

When a student arrives in the morning:

```text
Student arrives
      │
      ▼
Scans ID card
      │
      ▼
System identifies student
      │
      ▼
Checks today's attendance
      │
      ├── Already recorded
      │       ↓
      │   No duplicate
      │
      └── Not recorded
              ↓
        Mark student present
              ↓
        Store attendance time
```

A student therefore receives one attendance record for a school day.

Example:

```text
Student: Sajag
Date: August 15
Status: Present
First Scan: 8:21 AM
```

The system does not create:

```text
Period 1 Attendance
Period 2 Attendance
Period 3 Attendance
```

for the student.

---

# 11. Teacher Classroom Presence

Teacher presence is different from student attendance.

For teachers, the system records classroom activity for the particular period.

```text
Teacher
   │
   ▼
Enters classroom
   │
   ▼
Scans ID card
   │
   ▼
System identifies teacher
   │
   ▼
Identifies Section
   │
   ▼
Identifies current period
   │
   ▼
Records classroom entry
```

The system can therefore determine:

```text
Teacher
+
Date
+
Section
+
Period
+
Entry Time
```

This also allows the school to distinguish regular teachers from substitute teachers.

---

# 12. Global Timetable

The school has a common timetable defining its normal periods.

For example:

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

It does not define which subject or teacher belongs to each Section.

---

# 13. Section Timetable

Each Section has its own timetable.

Example:

```text
Grade 10 - Section A

Sunday
│
├── Period 1 → Mathematics → Teacher A
├── Period 2 → Science → Teacher B
├── Period 3 → English → Teacher C
└── Period 4 → Computer → Teacher D
```

The timetable represents the normal weekly schedule.

---

# 14. Substitute Teacher Flow

If a regular teacher is absent:

```text
Regular Timetable
       │
       ▼
Teacher Absent
       │
       ▼
Admin assigns substitute
       │
       ▼
Effective timetable changes
for that specific day
       │
       ▼
Smart Board displays substitute
```

Example:

```text
Normal:

Period 2
Science
Mr. Sharma


That Day:

Period 2
Science
Ms. Gurung
(Substitute)
```

The regular timetable is not permanently modified.

---

# 15. Special Period Timing

The system supports date-specific timing changes.

For example:

```text
Normal Period 7
3:00 PM – 3:45 PM
```

A practical session may require:

```text
Friday
Period 7
2:45 PM – 4:00 PM
```

The change applies only to:

```text
Specific Date
+
Specific Section
+
Specific Period
```

Other Sections and other dates continue using the normal timetable.

---

# 16. Effective Timetable

The Smart Board does not simply read the normal timetable.

It determines the **effective classroom schedule**.

Conceptually:

```text
Global Period
      +
Section Timetable
      +
Today's Date
      +
Time Override
      +
Substitute Assignment
      ↓
Effective Classroom Schedule
```

This determines:

- Current period
- Current subject
- Effective teacher
- Whether teacher is a substitute
- Actual start time
- Actual end time
- Next period

---

# 17. Smart Board Daily Operation

The Smart Board continuously monitors the current time.

For example:

```text
10:30 AM
    │
    ▼
Determine current period
    │
    ▼
Find Section timetable
    │
    ▼
Check substitution
    │
    ▼
Check time override
    │
    ▼
Display effective classroom information
```

When the period ends, the Smart Board automatically moves to the next period.

---

# 18. Notice System

The Admin can send notices to:

### All Sections

```text
Notice
  ↓
Every Section
  ↓
Every relevant Smart Board
```

### One Section

```text
Notice
  ↓
Section 10-A
  ↓
10-A Smart Board
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
```

The same targeting system is also used to determine which students and teachers can see the notice.

---

# 19. Student Experience

The student's overall experience is:

```text
Receive school credentials
          │
          ▼
       Login
          │
          ▼
     Student Portal
          │
    ┌─────┼─────┐
    ▼     ▼     ▼
Attendance Timetable Notices
```

The student can view their historical attendance throughout the academic year.

---

# 20. Teacher Experience

```text
Receive credentials
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

---

# 21. Admin Experience

```text
                 ADMIN
                   │
          ┌────────┼────────┐
          ▼        ▼        ▼
        Users    Classes  Subjects
                   │
                   ▼
                Sections
                   │
             ┌─────┴─────┐
             ▼           ▼
        Smart Boards  Students
             │
             ▼
          Timetable
             │
      ┌──────┼──────┐
      ▼      ▼      ▼
Substitution Timing Notices
```

---

# 22. Complete School-Day Flow

```text
                 START OF DAY
                       │
                       ▼
              Students arrive
                       │
                       ▼
                Scan ID cards
                       │
                       ▼
              Daily attendance
                       │
                       ▼
                Classes begin
                       │
                       ▼
              Teacher enters
                       │
                       ▼
               Teacher scans
                       │
                       ▼
          Classroom presence recorded
                       │
                       ▼
              Smart Board shows
              current period
                       │
                       ▼
                 Period ends
                       │
                       ▼
               Next period begins
                       │
                       ▼
             Process continues
                       │
                       ▼
                  School ends
```

Notices and timetable changes can be reflected throughout the day.

---

# 23. Technical System Architecture

The user-facing explanation above represents the operational solution.

Technically, Kakshyasathi is structured as a full-stack Next.js application.

```text
                    Kakshyasathi
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
     Web/PWA          Smart Board       API
        │                │                │
        └────────────────┼────────────────┘
                         ▼
                  Business Logic
                         │
                         ▼
                     MongoDB
```

---

# 24. Technology Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- Zustand where client-side state is required

## Backend

- Next.js App Router
- Next.js Route Handlers
- NextAuth/Auth.js
- TypeScript
- Mongoose
- MongoDB

## PWA

- Web App Manifest
- Service Worker
- Installable application
- Offline/static asset caching where appropriate
- Smart Board optimized experience

## Authentication

- Credentials-based authentication
- JWT sessions
- Role-based authorization

---

# 25. Application Structure

The application has separate areas for each role.

```text
src/
│
├── app/
│   │
│   ├── (auth)/
│   │   └── signin/
│   │
│   ├── admin/
│   │
│   ├── teacher/
│   │
│   ├── student/
│   │
│   ├── smartboard/
│   │
│   └── api/
│
├── components/
│
├── models/
│
├── services/
│
├── repositories/
│
├── lib/
│
├── schemas/
│
├── types/
│
├── hooks/
│
├── constants/
│
├── config/
│
└── scripts/
```

---

# 26. Role-Based Pages

```text
app/
│
├── admin/
│   ├── dashboard/
│   ├── users/
│   ├── classes/
│   ├── sections/
│   ├── subjects/
│   ├── smartboards/
│   ├── timetable/
│   ├── substitutions/
│   ├── attendance/
│   └── notices/
│
├── teacher/
│   ├── dashboard/
│   ├── timetable/
│   ├── sections/
│   ├── attendance/
│   ├── presence/
│   └── notices/
│
├── student/
│   ├── dashboard/
│   ├── attendance/
│   ├── timetable/
│   └── notices/
│
└── smartboard/
    ├── dashboard/
    ├── attendance/
    ├── notices/
    └── timetable/
```

---

# 27. Role-Based API Structure

The API follows the same separation.

```text
app/api/
│
├── admin/
│   ├── users/
│   ├── classes/
│   ├── sections/
│   ├── subjects/
│   ├── smartboards/
│   ├── timetable/
│   ├── substitutions/
│   ├── attendance/
│   └── notices/
│
├── teacher/
│   ├── profile/
│   ├── timetable/
│   ├── sections/
│   ├── presence/
│   └── notices/
│
├── student/
│   ├── profile/
│   ├── attendance/
│   ├── timetable/
│   └── notices/
│
└── smartboard/
    ├── auth/
    ├── status/
    ├── classroom/
    ├── scan/
    ├── attendance/
    ├── timetable/
    └── notices/
```

This keeps each role's API boundary clear.

---

# 28. Complete Folder Structure

```text
src/
│
├── app/
│   │
│   ├── (auth)/
│   │   └── signin/
│   │       └── page.tsx
│   │
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── classes/
│   │   ├── sections/
│   │   ├── subjects/
│   │   ├── smartboards/
│   │   ├── timetable/
│   │   ├── substitutions/
│   │   ├── attendance/
│   │   └── notices/
│   │
│   ├── teacher/
│   │   ├── dashboard/
│   │   ├── timetable/
│   │   ├── sections/
│   │   ├── presence/
│   │   └── notices/
│   │
│   ├── student/
│   │   ├── dashboard/
│   │   ├── attendance/
│   │   ├── timetable/
│   │   └── notices/
│   │
│   ├── smartboard/
│   │   ├── dashboard/
│   │   └── setup/
│   │
│   ├── api/
│   │   ├── admin/
│   │   ├── teacher/
│   │   ├── student/
│   │   └── smartboard/
│   │
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── admin/
│   ├── teacher/
│   ├── student/
│   ├── smartboard/
│   ├── attendance/
│   ├── timetable/
│   ├── notices/
│   ├── auth/
│   ├── theme/
│   └── ui/
│
├── models/
│   ├── user.model.ts
│   ├── class.model.ts
│   ├── section.model.ts
│   ├── subject.model.ts
│   ├── smartboard.model.ts
│   ├── period.model.ts
│   ├── timetable.model.ts
│   ├── substitution.model.ts
│   ├── periodOverride.model.ts
│   ├── studentAttendance.model.ts
│   ├── teacherPresence.model.ts
│   └── notice.model.ts
│
├── services/
│   ├── auth.service.ts
│   ├── attendance.service.ts
│   ├── timetable.service.ts
│   ├── substitution.service.ts
│   ├── notice.service.ts
│   └── smartboard.service.ts
│
├── repositories/
│   ├── user.repository.ts
│   ├── attendance.repository.ts
│   ├── timetable.repository.ts
│   ├── notice.repository.ts
│   └── smartboard.repository.ts
│
├── schemas/
│   ├── auth/
│   ├── admin/
│   ├── teacher/
│   ├── student/
│   └── smartboard/
│
├── lib/
│   ├── auth.ts
│   ├── connectDB.ts
│   ├── permissions.ts
│   ├── response.ts
│   ├── errors.ts
│   └── utils.ts
│
├── types/
│   ├── auth.d.ts
│   ├── attendance.ts
│   ├── timetable.ts
│   └── smartboard.ts
│
├── hooks/
│
├── constants/
│
├── config/
│
└── scripts/
    └── create-admin.ts
```

---

# 29. Database Design

MongoDB is used as the primary database.

The core relationships are:

```text
User
 │
 ├──────────────┐
 ▼              ▼
Student       Teacher
 │              │
 ▼              ▼
Section       Timetable
 │              │
 ▼              ▼
Smart Board ← Classroom
```

---

# 30. User Model

The User model represents:

- Student
- Teacher
- Admin

Conceptually:

```text
User
├── _id
├── username
├── fullName
├── password
├── profilePicture
├── phone
├── rollNumber
├── classId / sectionId
├── userRole
├── createdAt
└── updatedAt
```

The username is used as the barcode value where the school's ID card barcode represents that identifier.

Roles:

```text
STUDENT
TEACHER
ADMIN
```

---

# 31. Class Model

Represents an academic class.

Example:

```text
Grade 10
Grade 11
Grade 12
```

Conceptually:

```text
Class
├── _id
├── name
├── grade
├── academicYear
└── timestamps
```

A Class can have multiple Sections.

---

# 32. Section Model

A Section belongs to a Class.

Example:

```text
Grade 10
   │
   ├── A
   ├── B
   └── C
```

Conceptually:

```text
Section
├── _id
├── classId
├── name
├── academicYear
└── timestamps
```

Sections are the primary classroom unit of Kakshyasathi.

---

# 33. Subject Model

Subjects are maintained independently.

Example:

```text
Mathematics
Science
English
Computer Science
Physics
```

Conceptually:

```text
Subject
├── _id
├── name
├── code
└── timestamps
```

---

# 34. Smart Board Model

A Smart Board represents a physical classroom device.

```text
SmartBoard
├── _id
├── deviceId
├── name
├── sectionId
├── credentials
├── status
├── lastSeenAt
└── timestamps
```

The important relationship is:

```text
SmartBoard
     │
     ▼
Section
```

---

# 35. Period Model

Represents the school's global period structure.

```text
Period
├── _id
├── periodNumber
├── startTime
├── endTime
└── timestamps
```

Example:

```text
Period 1 → 10:15 – 11:00
Period 2 → 11:00 – 11:45
```

---

# 36. Timetable Model

Represents the normal timetable for a Section.

```text
Timetable
├── _id
├── sectionId
├── dayOfWeek
├── periodId
├── subjectId
├── teacherId
└── timestamps
```

Relationship:

```text
Section
   │
   ▼
Timetable
   ├── Subject
   └── Teacher
```

---

# 37. Substitution Model

Stores temporary teacher substitutions.

```text
Substitution
├── _id
├── sectionId
├── date
├── periodId
├── regularTeacherId
├── substituteTeacherId
└── timestamps
```

This does not modify the permanent timetable.

---

# 38. Period Override Model

Stores date-specific timing changes.

```text
PeriodOverride
├── _id
├── sectionId
├── date
├── periodId
├── startTime
├── endTime
└── timestamps
```

This allows special periods without modifying the global timetable.

---

# 39. Student Attendance Model

Attendance is daily.

```text
StudentAttendance
├── _id
├── studentId
├── sectionId
├── date
├── status
├── scannedAt
└── timestamps
```

A unique constraint should prevent duplicate daily attendance.

Conceptually:

```text
studentId + date
```

should identify one daily attendance record.

---

# 40. Teacher Presence Model

Teacher classroom presence is period-based.

```text
TeacherPresence
├── _id
├── teacherId
├── sectionId
├── date
├── periodId
├── enteredAt
├── exitedAt
└── timestamps
```

This is separate from student attendance.

---

# 41. Notice Model

```text
Notice
├── _id
├── title
├── content
├── createdBy
├── targetType
├── targetSections
├── priority
├── expiresAt
├── status
└── timestamps
```

Targeting supports:

```text
ALL
SELECTED_SECTIONS
```

A selected target can contain one or many Sections.

---

# 42. Database Relationship Overview

```text
                    User
                 /   |   \
                /    |    \
           Student Teacher Admin
              │       │
              │       │
              ▼       ▼
           Section  Timetable
              │       │
              │       ├── Subject
              │       └── Teacher
              │
       ┌──────┼──────────────┐
       ▼      ▼              ▼
 Attendance Smart Board    Notices
              │
              ▼
           Section
```

---

# 43. Authentication

Human authentication uses credentials provided by the school.

```text
Username
+
Password
      │
      ▼
Authentication
      │
      ▼
User Identity
      │
      ▼
Role
      │
      ▼
Authorized Portal
```

Possible destinations:

```text
ADMIN    → /admin
TEACHER  → /teacher
STUDENT  → /student
```

Smart Boards use separate device authentication.

---

# 44. Authorization

Authentication answers:

> Who is this user?

Authorization answers:

> What is this user allowed to do?

Examples:

```text
ADMIN
✓ Manage users
✓ Manage timetable
✓ Manage sections
✓ Manage notices
✓ Manage Smart Boards

TEACHER
✓ View timetable
✓ View assigned sections
✓ Record classroom presence

STUDENT
✓ View attendance
✓ View timetable
✓ View notices

SMART BOARD
✓ View classroom information
✓ Submit barcode scans
✓ Receive targeted notices
```

---

# 45. API Architecture

The API is separated by role.

```text
/api/admin/...
/api/teacher/...
/api/student/...
/api/smartboard/...
```

This keeps role-specific operations clearly separated.

Example:

```text
/api/admin/users
/api/admin/timetable
/api/admin/notices

/api/teacher/timetable
/api/teacher/presence

/api/student/attendance
/api/student/timetable

/api/smartboard/scan
/api/smartboard/classroom
/api/smartboard/notices
```

Shared business logic should remain in services rather than duplicating logic inside route handlers.

---

# 46. Application Layer Architecture

The backend follows a separation of responsibilities:

```text
Route Handler
     │
     ▼
Validation
     │
     ▼
Authorization
     │
     ▼
Service
     │
     ▼
Repository
     │
     ▼
Mongoose Model
     │
     ▼
MongoDB
```

This keeps API routes small and makes the business logic reusable.

---

# 47. Smart Board Data Flow

```text
Smart Board
     │
     ├── Request classroom information
     │
     └── Send barcode scan
             │
             ▼
        Smart Board API
             │
             ▼
       Authenticate Device
             │
             ▼
       Identify Section
             │
             ▼
       Process Request
             │
             ▼
           MongoDB
```

---

# 48. Smart Board Classroom Information Flow

```text
Current Time
     │
     ▼
Current Period
     │
     ▼
Section Timetable
     │
     ├── Subject
     └── Regular Teacher
              │
              ▼
      Check Substitution
              │
              ▼
      Check Time Override
              │
              ▼
      Effective Schedule
              │
              ▼
        Smart Board
```

---

# 49. Barcode Scan Processing

When a barcode is scanned:

```text
Barcode
   │
   ▼
Smart Board
   │
   ▼
Smart Board Scan API
   │
   ▼
Find User
   │
   ▼
Identify Role
   │
   ├── Student
   │      ↓
   │  Daily Attendance
   │
   └── Teacher
          ↓
     Classroom Presence
```

The system validates that the scan is appropriate for the current context.

---

# 50. Student Scan Rules

For a student scan:

1. Identify the student.
2. Determine today's date.
3. Determine the student's current Section.
4. Check whether today's attendance already exists.
5. If not, create the daily attendance record.
6. If it already exists, do not create another record.

---

# 51. Teacher Scan Rules

For a teacher scan:

1. Identify the teacher.
2. Identify the Smart Board's Section.
3. Determine the current period.
4. Determine the effective teacher for that period.
5. Check for a substitution.
6. Record classroom presence.
7. Prevent unintended duplicate entries.

---

# 52. Timetable Resolution

The system determines the effective timetable using:
 n
Date
+
Current Time
+
Section
+
Global Period
+
Regular Timetable
+
Substitution
+
Period Override
```

The result is:

```text
Current Period
Current Subject
Current Teacher
Current Start Time
Current End Time
Next Period
```

---

# 53. Attendance Integrity

Attendance is an important school record, so duplicate and unauthorized changes should be prevented.

Important protections include:

- Unique daily student attendance
- Role-based access
- Server-side validation
- Device authentication
- Timestamp recording
- Immutable or controlled attendance history
- Audit logging for administrative changes

The client should never be trusted to determine whether attendance is valid.

---

# 54. Security

The system should protect:

- Student information
- Teacher information
- Attendance
- Timetable
- Notices
- Smart Board credentials

Security principles include:

- Password hashing
- Secure sessions
- Server-side authorization
- Input validation
- Rate limiting where appropriate
- Secure Smart Board authentication
- Protected API routes
- No sensitive credentials in client-side code
- Environment variables for secrets

---

# 55. PWA Architecture

Kakshyasathi is designed as a Progressive Web App.

The same application can therefore serve:

```text
Desktop
   │
Mobile
   │
Tablet
   │
Android Smart Board
```

The Smart Board receives a specialized classroom experience while students, teachers, and administrators use their respective application areas.

---

# 56. PWA Installation

The application provides installable PWA metadata including:

- Application name
- Application icon
- Theme color
- Background color
- Display mode
- Start URL
- Appropriate Android icons

The Smart Board can run Kakshyasathi as an installed application rather than as an ordinary browser tab.

---

# 57. Offline Considerations

The system should prioritize reliable operation in classrooms.

Static application resources can be cached.

However, attendance and other important records should not be considered successfully stored until the server confirms them.

For critical operations:

```text
Scan
 ↓
Send to Server
 ↓
Server confirms
 ↓
Display success
```

If connectivity fails, the system should clearly indicate the issue rather than falsely claiming that attendance was recorded.

---

# 58. Error Handling

The application should distinguish between:

```text
Invalid barcode
Unknown user
Unauthorized device
Duplicate attendance
Wrong classroom
No active period
Network failure
Server failure
Invalid timetable
```

For example:

```text
Unknown ID
    ↓
"Student/teacher not found"
```

rather than silently failing.

---

# 59. Database Indexing

Important indexes include:

### User

```text
username
userRole
```

### Section

```text
classId
```

### Smart Board

```text
deviceId
sectionId
```

### Timetable

```text
sectionId
dayOfWeek
periodId
```

### Student Attendance

```text
studentId + date
sectionId + date
```

### Teacher Presence

```text
teacherId + date + sectionId + periodId
```

### Substitution

```text
sectionId + date + periodId
```

### Period Override

```text
sectionId + date + periodId
```

These indexes improve lookup performance and help enforce uniqueness where required.

---

# 60. Application Lifecycle

The complete lifecycle of the system is:

```text
                    SCHOOL SETUP
                         │
                         ▼
                  Academic Year
                         │
                         ▼
                     Classes
                         │
                         ▼
                    Sections
                         │
                         ▼
              Students + Teachers
                         │
                         ▼
                     Subjects
                         │
                         ▼
                   Smart Boards
                         │
                         ▼
                    Timetable
                         │
                         ▼
                   SCHOOL DAY
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
       Student         Teacher       Smart Board
       Scans           Scans          Displays
          │              │              │
          ▼              ▼              ▼
      Attendance      Presence       Classroom
                                      Information
                         │
                         ▼
                    ADMIN UPDATES
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
         Substitutes  Overrides   Notices
              │          │          │
              └──────────┼──────────┘
                         ▼
                   Updated Classroom
                         │
                         ▼
                    School Ends
```

---

# 61. Example End-to-End Scenario

Consider:

```text
Grade 10
Section A
Smart Board: SB-001
```

The regular timetable says:

```text
Period 2
Science
Mr. Sharma
10:15 – 11:00
```

On Monday, students arrive and scan their ID cards.

Their daily attendance is recorded.

At 10:15, the Smart Board displays:

```text
Period 2
Science
Mr. Sharma
10:15 – 11:00
```

Mr. Sharma enters and scans his ID card.

His classroom presence is recorded.

Suppose Mr. Sharma is absent on Tuesday.

The Admin assigns Ms. Gurung as substitute.

On Tuesday, the Smart Board automatically displays:

```text
Period 2
Science
Ms. Gurung
Substitute
```

Suppose the Admin also changes the period timing because of a practical:

```text
10:00 – 11:15
```

The Smart Board uses that timing for that specific Section and date.

The Admin then sends a notice to:

```text
Grade 10-A
Grade 10-B
Grade 9-A
```

Only those Sections receive the notice.

This demonstrates how the different parts of Kakshyasathi work together.

---

# 62. Key Design Principles

Kakshyasathi follows several important principles.

### Simple for Users

Students and teachers should only need to scan their existing ID cards.

### Centralized Management

The Admin manages school configuration from one place.

### Section-Centric Classroom Management

The Section is the core classroom unit.

### Temporary Changes

Substitutions and special timings do not unnecessarily modify the permanent timetable.

### Daily Student Attendance

Students receive one attendance record per day.

### Period-Based Teacher Presence

Teacher classroom presence is associated with individual periods.

### Device-Aware Classrooms

Each Smart Board is permanently associated with a Section.

### Targeted Communication

Notices can reach all Sections, one Section, or multiple selected Sections.

### Role Separation

Each user sees and controls only what their role permits.

### School-Owned Accounts

Accounts are created and managed by the school.

---

# 63. Final System Architecture

```text
                         KAKSHYASATHI
                              │
              ┌───────────────┼────────────────┐
              │               │                │
              ▼               ▼                ▼
           ADMIN           TEACHER          STUDENT
              │               │                │
              └───────────────┼────────────────┘
                              │
                         Next.js PWA
                              │
              ┌───────────────┼────────────────┐
              │               │                │
              ▼               ▼                ▼
         Admin API        Teacher API      Student API
                              │
                              │
                        Smart Board API
                              │
                              ▼
                    Smart Board Devices
                              │
                              ▼
                       Barcode Reader
                              │
                              ▼
                         School ID Card
                              │
                              ▼
                           Services
                              │
                              ▼
                         Repositories
                              │
                              ▼
                       Mongoose Models
                              │
                              ▼
                           MongoDB
```

---

# 64. Overall Concept

Kakshyasathi can ultimately be summarized as:

```text
                 ONE SCHOOL
                     │
                     ▼
             ONE CENTRAL SYSTEM
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
     PEOPLE       CLASSROOMS    ACADEMICS
        │            │            │
        ▼            ▼            ▼
 Students       Smart Boards   Timetable
 Teachers       Barcode        Subjects
 Admin          Attendance     Substitutions
                Notices        Time Changes
```

The goal is not simply to digitize attendance.

The goal of **Kakshyasathi** is to make the classroom itself connected to the school's information system:

> **The student scans in, the teacher scans in, the Smart Board knows the classroom, the timetable knows what should be happening, the Admin can make changes centrally, and everyone receives the information relevant to them.**

This creates a single, connected workflow for **attendance, classroom presence, timetable management, substitutions, notices, and classroom information** while keeping the system practical for the school's existing Android Smart Boards and ID cards.
