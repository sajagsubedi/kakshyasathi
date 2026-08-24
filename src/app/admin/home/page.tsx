'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  Monitor,
  CalendarDays,
  UserCheck,
  ClipboardCheck,
  Bell,
  ChevronRight,
  School,
  Radio,
  MessageSquareText,
} from 'lucide-react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';

import { useAdminDashboard } from '@/hooks/admin/useDashboard';
import { useAdminClasses } from '@/hooks/admin/useClasses';
import { useAdminSections } from '@/hooks/admin/useSections';
import { useAdminAcademicYears } from '@/hooks/admin/useAcademicYears';
import type { NavItem } from '@/components/layout/Sidebar';

type SectionGroup = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: 'primary' | 'chart-3' | 'warning' | 'chart-4';
  items: NavItem[];
};

const sectionGroups: SectionGroup[] = [
  {
    label: 'People & Academics',
    icon: GraduationCap,
    accent: 'primary',
    items: [
      { label: 'Users', href: '/admin/users', icon: Users },
      { label: 'Academic Years', href: '/admin/academic-years', icon: CalendarDays },
      { label: 'Classes', href: '/admin/classes', icon: Building2 },
      { label: 'Sections', href: '/admin/sections', icon: GraduationCap },
      { label: 'Subjects', href: '/admin/subjects', icon: BookOpen },
      { label: 'Classrooms', href: '/admin/classrooms', icon: Building2 },
    ],
  },
  {
    label: 'Devices & Scheduling',
    icon: Radio,
    accent: 'chart-3',
    items: [
      { label: 'Smart Boards', href: '/admin/smartboards', icon: Monitor },
      { label: 'Terminals', href: '/admin/terminals', icon: ClipboardCheck },
      { label: 'Timetable', href: '/admin/timetable', icon: CalendarDays },
      { label: 'Substitutions', href: '/admin/substitutions', icon: UserCheck },
    ],
  },
  {
    label: 'Attendance & Notices',
    icon: MessageSquareText,
    accent: 'warning',
    items: [
      { label: 'Attendance', href: '/admin/attendance', icon: ClipboardCheck },
      { label: 'Notices', href: '/admin/notices', icon: Bell },
    ],
  },
];

const accentClasses: Record<SectionGroup['accent'], { icon: string; iconBg: string; iconBgHover: string; dot: string; text: string }> = {
  primary: {
    icon: 'text-primary',
    iconBg: 'bg-primary/10',
    iconBgHover: 'group-hover:bg-primary/20',
    dot: 'bg-primary',
    text: 'text-primary',
  },
  'chart-3': {
    icon: 'text-chart-3',
    iconBg: 'bg-chart-3/10',
    iconBgHover: 'group-hover:bg-chart-3/20',
    dot: 'bg-chart-3',
    text: 'text-chart-3',
  },
  warning: {
    icon: 'text-amber-600',
    iconBg: 'bg-amber-500/10',
    iconBgHover: 'group-hover:bg-amber-500/20',
    dot: 'bg-amber-500',
    text: 'text-amber-600',
  },
  'chart-4': {
    icon: 'text-chart-4',
    iconBg: 'bg-chart-4/10',
    iconBgHover: 'group-hover:bg-chart-4/20',
    dot: 'bg-chart-4',
    text: 'text-chart-4',
  },
};

function getGreeting(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function AdminHomePage() {
  const { data: dashboard } = useAdminDashboard();
  const { data: classesData } = useAdminClasses({ page: 1, limit: 1 });
  const { data: sectionsData } = useAdminSections({ page: 1, limit: 1 });
  const { data: academicYears = [] } = useAdminAcademicYears();

  const today = new Date();
  const greeting = getGreeting(today.getHours());

  const studentsCount = dashboard?.counts.students ?? 0;
  const teachersCount = dashboard?.counts.teachers ?? 0;
  const activeAcademicYear = academicYears.find((year) => year.isActive);

  const classesCount = classesData?.total ?? dashboard?.counts.classes ?? 0;
  const sectionsCount = sectionsData?.total ?? dashboard?.counts.sections ?? 0;
  const attendanceToday = dashboard?.counts.attendanceToday ?? 0;

  const quickStats = [
    { label: 'Classes', value: classesCount, icon: Building2, accent: 'primary' as const },
    { label: 'Sections', value: sectionsCount, icon: GraduationCap, accent: 'chart-3' as const },
    { label: 'Academic Years', value: academicYears.length, icon: CalendarDays, accent: 'warning' as const },
    { label: 'Attendance Today', value: attendanceToday, icon: ClipboardCheck, accent: 'chart-4' as const },
  ];

  return (
    <section className="pb-8">
      {/* ============================================================ */}
      {/* WELCOME HERO CARD                                             */}
      {/* ============================================================ */}
      <Card className="relative mb-6 overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <div className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <CardContent className="relative p-5">
          <div className="flex items-start gap-4">
            {/* logo mark — white background */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white p-2 shadow-md shadow-primary/20 ring-1 ring-black/5">
              <Image
                src="/logo/icon.png"
                alt="Kakshyasathi"
                width={36}
                height={36}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold tracking-tight">
                {greeting} 👋
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {today.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <div className="rounded-full bg-primary/15 px-3 py-1 text-[11px] font-semibold text-primary">
                  {studentsCount} Students
                </div>
                <div className="rounded-full bg-chart-3/15 px-3 py-1 text-[11px] font-semibold text-chart-3">
                  {teachersCount} Teachers
                </div>
                {activeAcademicYear && (
                  <div className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {activeAcademicYear.label} Active
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ============================================================ */}
      {/* QUICK STATS                                                   */}
      {/* ============================================================ */}
      <div className="mb-7 grid grid-cols-2 gap-3">
        {quickStats.map((stat) => {
          const colors = accentClasses[stat.accent];
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-border bg-card p-3.5 transition-shadow hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium text-muted-foreground">{stat.label}</p>
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${colors.iconBg}`}>
                  <Icon className={`h-3.5 w-3.5 ${colors.icon}`} />
                </div>
              </div>
              <p className="mt-1.5 text-2xl font-bold tracking-tight">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* GROUPED SECTIONS                                              */}
      {/* ============================================================ */}
      <Link
        href="/admin/dashboard"
        className="mb-7 flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3.5 transition-all hover:border-primary/40 hover:shadow-sm active:scale-[0.98]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <LayoutDashboard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">Full Dashboard</p>
            <p className="text-[11px] text-muted-foreground">Detailed overview & analytics</p>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </Link>

      {sectionGroups.map((group, groupIndex) => {
        const colors = accentClasses[group.accent];
        const GroupIcon = group.icon;
        return (
          <div key={group.label} className={groupIndex > 0 ? 'mt-7' : ''}>
            <div className="mb-3 flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
              <h3 className="text-sm font-semibold text-foreground">{group.label}</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {group.items.map((item) => {
                const Icon = item.icon ?? School;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md active:scale-[0.98]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colors.iconBg} transition-all ${colors.iconBgHover}`}>
                        <Icon className={`h-5 w-5 ${colors.icon}`} />
                      </div>
                      <ChevronRight className={`h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:${colors.text}`} />
                    </div>
                    <div className="mt-3">
                      <p className="text-sm font-semibold text-foreground">
                        {item.label}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Tap to open
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </section>
  );
}