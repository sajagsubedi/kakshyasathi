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
import { adminNav, adminBottomNav } from '@/lib/nav';
import { useAdminDashboard, useAdminLookup } from '@/hooks/useApi';
import type { NavItem } from '@/components/layout/Sidebar';

const allNavItems: NavItem[] = [
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

export default function AdminHomePage() {
  const { data: stats, isLoading: statsLoading } = useAdminDashboard();
  const { data: lookup } = useAdminLookup();
  const users = lookup?.users ?? [];
  const today = new Date();

  const students = users.filter((u) => u.role === 'STUDENT');
  const teachers = users.filter((u) => u.role === 'TEACHER');

  return (
    <DashboardLayout
      items={adminNav}
      title="Kakshyasathi"
      subtitle="Admin Portal"
      pageTitle="Home"
      pageDescription="Navigate all admin sections"
      allowedRoles={['ADMIN']}
      bottomNavItems={adminBottomNav}
    >
      {/* WELCOME HERO CARD */}
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent mb-6">
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
                  {students.length} Students
                </div>
                <div className="rounded-full bg-chart-3/15 px-3 py-1 text-[11px] font-semibold text-chart-3">
                  {teachers.length} Teachers
                </div>
                {stats && (
                  <div className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold text-emerald-600">
                    {stats.attendanceRate}% Attendance
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QUICK STATS */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        {stats && (
          <>
            <div className="rounded-2xl border border-border bg-card p-3">
              <p className="text-[11px] font-medium text-muted-foreground">
                Classes
              </p>
              <p className="mt-1 text-2xl font-bold">{stats.classes}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-3">
              <p className="text-[11px] font-medium text-muted-foreground">
                Sections
              </p>
              <p className="mt-1 text-2xl font-bold">{stats.sections}</p>
            </div>
          </>
        )}
      </div>

      {/* ALL SECTIONS GRID */}
      <h3 className="mb-3 text-sm font-semibold text-foreground">
        All Sections
      </h3>
      <div className="grid grid-cols-2 gap-3 pb-2">
        {allNavItems.map((item) => {
          const Icon = item.icon;
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
    </DashboardLayout>
  );
}
