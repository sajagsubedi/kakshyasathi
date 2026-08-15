'use client';

import Link from 'next/link';
import { ClipboardCheck, CalendarDays, Bell, CheckCircle2, XCircle, ArrowRight, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/shared/StatCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { studentNav } from '@/lib/nav';
import { useStudentProfile, useStudentAttendance, useStudentTimetable, useStudentNotices, useSharedLookup, dayNames } from '@/hooks/useApi';

export default function StudentDashboard() {
  const { data: profile } = useStudentProfile();
  const { data: attendance = [] } = useStudentAttendance();
  const { data: timetable = [] } = useStudentTimetable();
  const { data: notices = [] } = useStudentNotices();
  const { data: lookup } = useSharedLookup();

  const getSubjectName = lookup?.getSubjectName ?? ((id: string) => id);
  const getTeacherName = lookup?.getTeacherName ?? ((id: string) => id);
  const getPeriod = lookup?.getPeriod ?? (() => undefined);

  const presentCount = attendance.filter((a) => a.status === 'PRESENT').length;
  const absentCount = attendance.filter((a) => a.status === 'ABSENT').length;
  const totalDays = attendance.length || 1;
  const attendanceRate = Math.round((presentCount / totalDays) * 100);
  const dayIdx = new Date().getDay();
  const todaySchedule = timetable.filter((t) => t.dayOfWeek === dayIdx);

  return (
    <DashboardLayout items={studentNav} title="Kakshyasathi" subtitle="Student Portal" pageTitle="Dashboard" pageDescription={`Today is ${dayNames[dayIdx]}`} allowedRoles={['STUDENT']}>
      <PageHeader title={`Welcome back, ${profile?.fullName?.split(' ')[0] ?? 'Student'}`} description="Your attendance and schedule at a glance" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Attendance Rate" value={`${attendanceRate}%`} icon={TrendingUp} accent="success" trend={`${presentCount} of ${totalDays} days present`} trendUp />
        <StatCard label="Present Days" value={presentCount} icon={CheckCircle2} accent="primary" />
        <StatCard label="Absent Days" value={absentCount} icon={XCircle} accent="destructive" />
        <StatCard label="Notices" value={notices.length} icon={Bell} accent="warning" />
      </div>
      <div className="mt-4"><Progress value={attendanceRate} className="h-2" /></div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div><CardTitle className="text-base">Today's Schedule</CardTitle><CardDescription>{dayNames[dayIdx]}</CardDescription></div>
            <Link href="/student/timetable" className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm font-medium transition-colors hover:bg-muted">
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {todaySchedule.map((entry) => {
              const period = getPeriod(entry.periodId);
              return (
                <div key={entry.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <div><p className="text-sm font-medium">{getSubjectName(entry.subjectId)}</p><p className="text-xs text-muted-foreground">{getTeacherName(entry.teacherId)}</p></div>
                  <Badge variant="outline">P{period?.periodNumber ?? '?'}</Badge>
                </div>
              );
            })}
            {!todaySchedule.length && <p className="text-sm text-muted-foreground">No classes today</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div><CardTitle className="text-base">Recent Attendance</CardTitle></div>
            <Link href="/student/attendance" className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm font-medium transition-colors hover:bg-muted">
              <ClipboardCheck className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {attendance.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                <span className="text-sm">{a.date}</span>
                <Badge className={a.status === 'PRESENT' ? 'bg-emerald-500 text-white' : a.status === 'LATE' ? 'bg-amber-500 text-white' : ''} variant={a.status === 'ABSENT' ? 'destructive' : 'default'}>{a.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
