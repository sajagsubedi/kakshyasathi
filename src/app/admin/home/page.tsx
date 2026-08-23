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
} from 'lucide-react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';

import { useAdminDashboard } from '@/hooks/admin/useDashboard';
import { useAdminClasses } from '@/hooks/admin/useClasses';
import { useAdminSections } from '@/hooks/admin/useSections';
import { useAdminAcademicYears } from '@/hooks/admin/useAcademicYears';
import type { NavItem } from '@/components/layout/Sidebar';

const allNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Academic Years', href: '/admin/academic-years', icon: CalendarDays },
  { label: 'Classes', href: '/admin/classes', icon: Building2 },
  { label: 'Sections', href: '/admin/sections', icon: GraduationCap },
  { label: 'Subjects', href: '/admin/subjects', icon: BookOpen },
  { label: 'Classrooms', href: '/admin/classrooms', icon: Building2 },
  { label: 'Smart Boards', href: '/admin/smartboards', icon: Monitor },
  { label: 'Terminals', href: '/admin/terminals', icon: ClipboardCheck },
  { label: 'Timetable', href: '/admin/timetable', icon: CalendarDays },
  { label: 'Substitutions', href: '/admin/substitutions', icon: UserCheck },
  { label: 'Attendance', href: '/admin/attendance', icon: ClipboardCheck },
  { label: 'Notices', href: '/admin/notices', icon: Bell },
];

export default function AdminHomePage() {
  const { data: dashboard } = useAdminDashboard();
  const { data: classesData } = useAdminClasses({ page: 1, limit: 1 });
  const { data: sectionsData } = useAdminSections({ page: 1, limit: 1 });
  const { data: academicYears = [] } = useAdminAcademicYears();

  const today = new Date();

  const studentsCount = dashboard?.counts.students ?? 0;
  const teachersCount = dashboard?.counts.teachers ?? 0;
  const activeAcademicYear = academicYears.find((year) => year.isActive);

  const classesCount = classesData?.total ?? dashboard?.counts.classes ?? 0;
  const sectionsCount = sectionsData?.total ?? dashboard?.counts.sections ?? 0;
  const attendanceToday = dashboard?.counts.attendanceToday ?? 0;

  return (
    <section
    >
      {/* WELCOME HERO CARD */}
      <Card className="mb-6 overflow-hidden border-primary/20 bg-linear-to-br from-primary/10 via-primary/5 to-transparent">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary p-2 shadow-md shadow-primary/30">
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
                Welcome back 👋
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
                  <div className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold text-emerald-600">
                    {activeAcademicYear.label} Active
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QUICK STATS */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-card p-3">
          <p className="text-[11px] font-medium text-muted-foreground">
            Classes
          </p>
          <p className="mt-1 text-2xl font-bold">{classesCount}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-3">
          <p className="text-[11px] font-medium text-muted-foreground">
            Sections
          </p>
          <p className="mt-1 text-2xl font-bold">{sectionsCount}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-3">
          <p className="text-[11px] font-medium text-muted-foreground">
            Academic Years
          </p>
          <p className="mt-1 text-2xl font-bold">{academicYears.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-3">
          <p className="text-[11px] font-medium text-muted-foreground">
            Attendance Today
          </p>
          <p className="mt-1 text-2xl font-bold">{attendanceToday}</p>
        </div>
      </div>

      {/* ALL SECTIONS GRID */}
      <h3 className="mb-3 text-sm font-semibold text-foreground">
        All Sections
      </h3>
      <div className="grid grid-cols-2 gap-3 pb-2">
        {allNavItems.map((item) => {
          const Icon = item.icon ?? LayoutDashboard;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md active:scale-[0.98]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-all group-hover:bg-primary/20">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
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
    </section>
  );
}
