import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  Monitor,
  CalendarDays,
  UserCheck,
  ClipboardList,
  Bell,
  Clock,
  CalendarClock,
  ScanLine,
  ClipboardCheck,
} from 'lucide-react';
import type { NavItem } from '@/components/layout/Sidebar';

export const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Classes', href: '/admin/classes', icon: Building2 },
  { label: 'Sections', href: '/admin/sections', icon: GraduationCap },
  { label: 'Subjects', href: '/admin/subjects', icon: BookOpen },
  { label: 'Smart Boards', href: '/admin/smartboards', icon: Monitor },
  { label: 'Timetable', href: '/admin/timetable', icon: CalendarDays },
  { label: 'Substitutions', href: '/admin/substitutions', icon: UserCheck },
  { label: 'Attendance', href: '/admin/attendance', icon: ClipboardCheck },
  { label: 'Notices', href: '/admin/notices', icon: Bell },
];

export const teacherNav: NavItem[] = [
  { label: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
  { label: 'Timetable', href: '/teacher/timetable', icon: CalendarDays },
  { label: 'Sections', href: '/teacher/sections', icon: GraduationCap },
  { label: 'Presence', href: '/teacher/presence', icon: Clock },
  { label: 'Notices', href: '/teacher/notices', icon: Bell },
];

export const studentNav: NavItem[] = [
  { label: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
  { label: 'Attendance', href: '/student/attendance', icon: ClipboardCheck },
  { label: 'Timetable', href: '/student/timetable', icon: CalendarDays },
  { label: 'Notices', href: '/student/notices', icon: Bell },
];

export const smartBoardNav: NavItem[] = [
  { label: 'Dashboard', href: '/smartboard/dashboard', icon: LayoutDashboard },
  { label: 'Attendance', href: '/smartboard/attendance', icon: ScanLine },
  { label: 'Timetable', href: '/smartboard/timetable', icon: CalendarClock },
  { label: 'Notices', href: '/smartboard/notices', icon: Bell },
];
