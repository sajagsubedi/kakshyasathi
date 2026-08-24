// navigation.ts

import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  Monitor,
  CalendarDays,
  UserCheck,
  Bell,
  ClipboardCheck,
  Home,
  LucideCalendarDays,
  DoorOpen,
  Clock,
  ScanLine,
} from "lucide-react";

export const adminNav = [
  {
    label: "Home",
    href: "/admin/home",
    isBottomNav: true,
  },
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    isBottomNav: false,
  },
  {
    label: "Users",
    href: "/admin/users",
    isBottomNav: true,
  },
  {
    label: "Academic Years",
    href: "/admin/academic-years",
    isBottomNav: false,
  },
  {
    label: "Classes",
    href: "/admin/classes",
    isBottomNav: false,
  },
  {
    label: "Sections",
    href: "/admin/sections",
    isBottomNav: false,
  },
  {
    label: "Subjects",
    href: "/admin/subjects",
    isBottomNav: false,
  },
  {
    label: "Periods",
    href: "/admin/periods",
    isBottomNav: false,
  },
  {
    label: "Classrooms",
    href: "/admin/classrooms",
    isBottomNav: false,
  },
  {
    label: "Smart Boards",
    href: "/admin/smartboards",
    isBottomNav: false,
  },
  {
    label: "Terminals",
    href: "/admin/terminals",
    isBottomNav: false,
  },
  {
    label: "Timetable",
    href: "/admin/timetable",
    isBottomNav: true,
  },
  {
    label: "Substitutions",
    href: "/admin/substitutions",
    isBottomNav: false,
  },
  {
    label: "Attendance",
    href: "/admin/attendance",
    isBottomNav: true,
  },
  {
    label: "Notices",
    href: "/admin/notices",
    isBottomNav: true,
  },
];

export const studentNav = [
  {
    label: "Dashboard",
    href: "/student/dashboard",
    isBottomNav: true,
  },
  {
    label: "Attendance",
    href: "/student/attendance",
    isBottomNav: true,
  },
  {
    label: "Timetable",
    href: "/student/timetable",
    isBottomNav: true,
  },
  {
    label: "Notices",
    href: "/student/notices",
    isBottomNav: true,
  },
];

export const teacherNav = [
  {
    label: "Dashboard",
    href: "/teacher/dashboard",
    isBottomNav: true,
  },
  {
    label: "Timetable",
    href: "/teacher/timetable",
    isBottomNav: true,
  },
  {
    label: "Sections",
    href: "/teacher/sections",
    isBottomNav: true,
  },
  {
    label: "Presence",
    href: "/teacher/presence",
    isBottomNav: false,
  },
  {
    label: "Notices",
    href: "/teacher/notices",
    isBottomNav: true,
  },
];

export const smartboardNav = [
  {
    label: "Dashboard",
    href: "/smartboard/dashboard",
    isBottomNav: true,
  },
  {
    label: "Timetable",
    href: "/smartboard/timetable",
    isBottomNav: true,
  },
  {
    label: "Attendance",
    href: "/smartboard/attendance",
    isBottomNav: true,
  },
  {
    label: "Notices",
    href: "/smartboard/notices",
    isBottomNav: true,
  },
];

export const navIcons = [
  {
    label: "Home",
    icon: Home,
  },
  {
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Users",
    icon: Users,
  },
  {
    label: "Academic Years",
    icon: LucideCalendarDays,
  },
  {
    label: "Classes",
    icon: Building2,
  },
  {
    label: "Sections",
    icon: GraduationCap,
  },
  {
    label: "Subjects",
    icon: BookOpen,
  },
  {
    label: "Periods",
    icon: Clock,
  },
  {
    label: "Classrooms",
    icon: DoorOpen,
  },
  {
    label: "Smart Boards",
    icon: Monitor,
  },
  {
    label: "Terminals",
    icon: ScanLine,
  },
  {
    label: "Timetable",
    icon: CalendarDays,
  },
  {
    label: "Substitutions",
    icon: UserCheck,
  },
  {
    label: "Attendance",
    icon: ClipboardCheck,
  },
  {
    label: "Notices",
    icon: Bell,
  },
  {
    label: "Presence",
    icon: Clock,
  },
];
