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

export const adminNavIcons = [
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
];
