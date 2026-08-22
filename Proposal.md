# Kakshyasathi

### A Proposed Smart Classroom Management System for Our Schools

---

## 1. The Problem

Spend a week inside a typical school and the same friction shows up every single day:

- **Attendance eats class time.** A teacher calling out names or passing a register around costs several minutes every period. Across six periods a day and dozens of sections, that adds up to hundreds of lost teaching hours a month — for a task that should take seconds.
- **Nobody has a reliable, real-time answer to "who is teaching this class right now."** Timetables live on paper or in a spreadsheet nobody actively checks. When a teacher is absent, students are often left waiting until someone notices.
- **Substitutions travel by word of mouth.** They're announced verbally or pinned to a noticeboard, so the classroom rarely has a dependable way of knowing who is walking in next.
- **Teacher presence is undocumented.** Schools have no real record of when a teacher actually entered or left a classroom against what was scheduled — accountability depends entirely on informal reporting.
- **Timetable changes don't reach everyone who needs them.** A shifted lab session, a rescheduled exam, a shortened Friday — these are announced once, somewhere, and forgotten everywhere else.
- **Notices get lost in translation.** A single announcement, read out once or dropped into an overcrowded group chat, is not a reliable channel for something as important as school communication.
- **Any system built on constant connectivity is a system that will fail.** Wi-Fi drops, bandwidth is inconsistent, and schools — especially outside major cities — cannot guarantee a stable connection all day. A digital solution that stops working the moment the internet does isn't a solution at all.
- **Students have no single place to check their own record.** Attendance history, timetable, and notices are scattered across teachers, noticeboards, and report cards.

These aren't hypothetical inefficiencies — they are the daily, compounding cost of running a school on paper, memory, and disconnected group chats.

---

## 2. What We Are Proposing

We propose **Kakshyasathi** — a dedicated Smart Classroom Management System designed specifically for a single school, built to bring student attendance, teacher classroom presence, timetables, substitutions, live classroom displays, and notices under one system.

The proposal rests on two decisions we believe are what make it actually deployable, not just theoretically elegant:

**First — use what the school already has.** Every student and teacher already carries a barcode/QR-coded school ID card. Our design doesn't ask the school to issue new cards, install biometric hardware, or retrain anyone on a new identification method. The existing card becomes the only credential the system needs.

**Second — separate "showing information" from "capturing attendance" into two independent devices.** We propose a **Smart Board** for each classroom that does nothing but display live classroom information, and a separate, purpose-built **Attendance Terminal** that does nothing but capture scans. A single device trying to do both is a single point of failure — if the display glitches or restarts, attendance capture would stop with it. By keeping them independent, a Smart Board issue never interrupts attendance, and a terminal issue never blanks the display.

---

## 3. How the Proposed System Would Solve Each Problem

### Attendance would stop costing class time

We propose placing an Attendance Terminal at each classroom entrance. A student would tap their existing ID card, the terminal's scanner would read it, and the event would be logged in under a second — no register, no calling out names, no lost minutes at the start of every period.

### The system would be designed to never lose attendance data, even when the internet does

This is the requirement we treat as non-negotiable in the design, not an afterthought. Each terminal would carry its own **real-time clock (DS3231)** and a **MicroSD card** for local storage. When the network is available, a scan would go straight to the backend and return a result instantly. When it isn't, the terminal would timestamp the scan using its own clock, write it to local storage, and queue it — the student wouldn't need to wait, and no record would be at risk. The moment connectivity returns, we propose the terminal automatically drain its queue to the backend in the background, with no manual intervention required.

We've also designed around the failure mode that usually breaks offline queues: duplicate submissions on retry. Every event would carry a unique, terminal-scoped sequence ID. If a sync request were sent and its response lost, the terminal would simply resend it — the backend would recognize the ID as already processed and discard the duplicate rather than double-marking attendance.

And by storing **two timestamps** — a `scanned_at` from the terminal's own clock and a `received_at` from whenever the backend actually processes it — the design ensures a student is never marked late just because the network happened to be down at the moment they walked in. The scan time, not the sync time, would be what counts.

### Teacher presence would become a real, timestamped record

The same terminal that scans students would scan teachers. When a teacher enters a classroom and taps their ID, the system would check whether they're already marked present in that room — if not, it logs an ENTER; on a second scan, an EXIT. This would give the school an actual historical record of who was physically in which classroom and for how long, without adding a single new step for the teacher — it's the same tap they would already be making to identify themselves.

### Substitutions would reach the classroom instantly, not by word of mouth

We propose computing an **effective timetable** for each day — the normal weekly schedule with substitutions and one-off changes layered on top of it, rather than overwritten into it. The moment an admin assigns a substitute, the relevant Smart Board would update to show the substitute's name, and the Attendance Terminal would recognize them as the valid teacher for that period the instant they scan in. No corridor walk to check a noticeboard.

### Timetable exceptions would be handled without disturbing the base schedule

Practical sessions, exam-day shifts, shortened periods — we propose a **date-specific override layer** that applies a change to one section, one period, one date only, while the regular weekly timetable underneath stays untouched. A one-off Friday change wouldn't require re-entering an entire week's schedule.

### The Smart Board would finally show the classroom what's actually happening

By keeping the Smart Board free of any scanning hardware, its only responsibility would be staying connected to the backend and reflecting the classroom's live state — current period, subject, teacher or substitute, start/end time, next period, live attendance count, and notices — updating the moment new information exists, instead of displaying a static printed timetable.

### Notices would reach exactly the people they're meant for

We propose building targeting directly into the notice system, so an admin could send an announcement to the whole school, a single section, or a specific set of sections — landing automatically on the right Smart Boards and the right students' portals, with no manual re-forwarding through a group chat.

### Students and teachers would each get one place to check everything

The proposal includes a portal for students (attendance history, timetable, notices) and a separate portal for teachers (schedule, assigned sections, substitute duties, and their own classroom-presence history) — replacing "ask around" with "check the app."

### The admin would be able to see the health of the whole system at a glance

Because every terminal would report its own connectivity state, we propose a live device-status view for the admin — online, offline, syncing, or under maintenance — so a malfunctioning terminal gets flagged and fixed instead of silently failing for days.

---

## 4. How We Propose Structuring the School Inside the System

We propose modeling the school the way it's actually organized on the ground:

```
School
 ├── Classes → Sections (the group of students)
 ├── Subjects
 ├── Teachers
 ├── Students
 ├── Classrooms
 │     ├── Smart Boards
 │     └── Attendance Terminals
 └── Timetables
```

A **Section** would represent a group of students; a **Classroom** would represent the physical room. Critically, we propose binding each terminal and Smart Board to the *classroom*, not to a fixed section — because in practice, the same room hosts different sections at different periods across the day. The backend would resolve "who is in this room right now" from the effective timetable at the exact moment of a scan, so the hardware would never need reconfiguring when a room's occupant changes.

---

## 5. Roles the System Would Support

**Admin** — would manage the full school configuration: academic year, users, classes, sections, subjects, classrooms, devices, the global and section timetables, substitutions, time overrides, notices, and device health. Accounts would be created and issued by the school; students and teachers would never self-register.

**Teacher** — would log in to see their timetable, assigned sections, substitute duties, notices, and their own classroom-presence history. Attendance capture would be a byproduct of the same ID-card tap already used to identify themselves — nothing new to learn.

**Student** — would log in to see attendance, attendance history, timetable, and notices. No manual check-in — the ID card scan would handle it.

**Smart Board** — a proposed display-only device bound to a classroom, showing the live, backend-computed state of that room.

**Attendance Terminal** — a proposed scan-only device bound to a classroom, capturing every student and teacher tap and getting it to the backend, whether online or offline.

---

## 6. The Hardware We Propose for the Attendance Terminal

We propose building each terminal around:

- **ESP32** — the controller running the device
- **GM66 1D/2D scanner** — reads both barcodes and QR codes off the ID cards the school already issues
- **DS3231 RTC** — keeps accurate time locally, independent of the network, so offline scans stay correctly timestamped
- **MicroSD card** — the offline queue that would prevent any scan from being lost
- **Buzzer + status LEDs** — instant audio/visual confirmation for whoever is scanning, whether the terminal is online or queuing offline

Every component in this list was chosen specifically because it would keep working without a network connection — the one requirement we are not willing to compromise on in this proposal.

---

## 7. How a Scan Would Flow Through the Proposed System

**When the terminal is online:**
Card is scanned → scanner decodes it → the terminal builds an event → sent to the backend → the backend identifies the person, the terminal, the classroom, and the current session → an attendance record is created → the terminal receives an immediate result (green LED, success beep).

**When the terminal is offline:**
Card is scanned → decoded → timestamped locally via the RTC → written to the MicroSD card and marked pending → the same instant audio/visual confirmation is given, without the person needing to know the network was down.

**When the connection returns:**
The terminal would read its pending events off local storage → send them to the backend in sequence → the backend would validate and acknowledge each one using its unique sequence ID → synced events would be cleared locally. No manual sync, no lost records, no duplicates.

---

## 8. Why This Approach

Most digital attendance proposals fail in real schools for one of two reasons: they demand new hardware the school can't afford to issue (biometric devices, new ID cards), or they assume constant connectivity the school can't guarantee. Kakshyasathi is designed to avoid both failure modes from the ground up — it works with the ID cards already in every student's pocket, and it's built to keep functioning through the network drops that are a daily reality, not an edge case, for most schools.

The separation between the Smart Board and the Attendance Terminal is also, we believe, what makes this maintainable long-term: a school can replace or repair one device without ever touching the other, and a fault in one never cascades into the other's function.

---


## Core Principle Behind the Proposal

> **The Smart Board would show the classroom what's happening. The Attendance Terminal would capture what actually happened. Both would belong to the same physical classroom, both would report independently to the backend, and the backend would remain the single source of truth for the whole school — timetable, attendance, presence, substitutions, and notices alike.**