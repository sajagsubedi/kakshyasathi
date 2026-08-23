import { LayoutDashboard, ClipboardCheck, CalendarDays, Bell, GraduationCap, Clock, Hop as Home } from "lucide-react";

import { adminNav as _adminNav } from "@/lib/navigation";

export { adminNav } from "@/lib/navigation";

export const adminBottomNav = _adminNav.filter((v) => v.isBottomNav);

export const studentNav = [
  { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { label: "Attendance", href: "/student/attendance", icon: ClipboardCheck },
  { label: "Timetable", href: "/student/timetable", icon: CalendarDays },
  { label: "Notices", href: "/student/notices", icon: Bell },
];

export const studentBottomNav = [
  { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { label: "Attendance", href: "/student/attendance", icon: ClipboardCheck },
  { label: "Timetable", href: "/student/timetable", icon: CalendarDays },
  { label: "Notices", href: "/student/notices", icon: Bell },
];

export const teacherNav = [
  { label: "Dashboard", href: "/teacher/dashboard", icon: LayoutDashboard },
  { label: "Timetable", href: "/teacher/timetable", icon: CalendarDays },
  { label: "Sections", href: "/teacher/sections", icon: GraduationCap },
  { label: "Presence", href: "/teacher/presence", icon: Clock },
  { label: "Notices", href: "/teacher/notices", icon: Bell },
];

export const teacherBottomNav = [
  { label: "Dashboard", href: "/teacher/dashboard", icon: LayoutDashboard },
  { label: "Timetable", href: "/teacher/timetable", icon: CalendarDays },
  { label: "Sections", href: "/teacher/sections", icon: GraduationCap },
  { label: "Notices", href: "/teacher/notices", icon: Bell },
];
