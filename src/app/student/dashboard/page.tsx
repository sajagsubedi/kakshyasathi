'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ClipboardCheck,
  Bell,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  Clock,
  GraduationCap,
  CalendarDays,
  DoorOpen,
  UserCheck,
  CalendarClock,
} from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  useStudentDashboard,
  dayNames,
} from '@/hooks/useApi';

export default function StudentDashboard() {
  const { data, isLoading } = useStudentDashboard();

  const profile = data?.profile;
  const attendance = data?.attendance ?? [];
  const todaySchedule = data?.todaySchedule ?? [];
  const notices = data?.notices ?? [];

  const presentCount = attendance.filter((a) => a.status === 'PRESENT').length;
  const lateCount = attendance.filter((a) => a.status === 'LATE').length;
  const absentCount = attendance.filter((a) => a.status === 'ABSENT').length;
  const totalRecords = attendance.length || 1;
  const attendanceRate = Math.round(((presentCount + lateCount) / totalRecords) * 100);
  const dayIdx = new Date().getDay();

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {profile?.fullName?.split(' ')[0] ?? 'Student'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {profile?.className ? `${profile.className} · Section ${profile.sectionName}` : 'Your attendance and schedule at a glance'}
            {profile?.rollNumber ? ` · Roll #${profile.rollNumber}` : ''}
          </p>
        </div>
        {profile?.academicYear && (
          <Badge variant="secondary" className="w-fit">
            Academic Year {profile.academicYear}
          </Badge>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-28 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Attendance Rate"
            value={`${attendanceRate}%`}
            icon={TrendingUp}
            accent="success"
            trend={`${presentCount + lateCount} of ${attendance.length} sessions`}
            trendUp
          />
          <StatCard label="Present Days" value={presentCount} icon={CheckCircle2} accent="primary" />
          <StatCard label="Late Days" value={lateCount} icon={Clock} accent="chart-3" />
          <StatCard label="Absent Days" value={absentCount} icon={XCircle} accent="destructive" />
        </div>
      )}

      {/* Attendance Progress Indicator */}
      <Card className="border-border bg-card/60 p-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-medium text-muted-foreground">Overall Attendance Health</span>
          <span className="font-semibold text-foreground">{attendanceRate}%</span>
        </div>
        <Progress value={attendanceRate} className="h-2.5" />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Live Schedule */}
        <Card className="flex flex-col">
          <CardHeader className="flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                Today&apos;s Schedule
              </CardTitle>
              <CardDescription>{dayNames[dayIdx]}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Link
                href="/student/schedule"
                className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-2 py-1 text-xs font-medium transition-colors hover:bg-muted"
              >
                <CalendarClock className="mr-1 h-3 w-3" />
                View Schedule
              </Link>
              <Link
                href="/student/timetable"
                className="inline-flex items-center justify-center rounded-lg border border-border bg-background p-2 text-xs font-medium transition-colors hover:bg-muted"
              >
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="flex-1 space-y-2.5">
            {todaySchedule.length > 0 ? (
              todaySchedule.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3 transition-colors hover:bg-muted/60"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                      P{entry.periodNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold">{entry.subjectName ?? 'Subject'}</p>
                        {entry.subjectCode && (
                          <span className="font-mono text-xs text-muted-foreground">({entry.subjectCode})</span>
                        )}
                        {entry.isCustomTiming && (
                          <Badge variant="outline" className="text-[10px] px-1 py-0 bg-primary/10 text-primary">
                            Lab Timing
                          </Badge>
                        )}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                        <span>{entry.teacherName ?? 'Unassigned'}</span>
                        {entry.roomNumber && (
                          <span className="flex items-center gap-1">
                            <DoorOpen className="h-3 w-3" /> Room {entry.roomNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {entry.startTime ? (
                      <Badge variant="secondary" className="text-xs font-mono">
                        {entry.startTime} – {entry.endTime}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">Period {entry.periodNumber}</Badge>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <CalendarDays className="h-8 w-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">No classes scheduled for today.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Attendance Scans */}
        <Card className="flex flex-col">
          <CardHeader className="flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-primary" />
                Recent Attendance
              </CardTitle>
              <CardDescription>Terminal barcode / QR scan logs</CardDescription>
            </div>
            <Link
              href="/student/attendance"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-background p-2 text-xs font-medium transition-colors hover:bg-muted"
            >
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent className="flex-1 space-y-2.5">
            {attendance.slice(0, 5).map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3 transition-colors hover:bg-muted/60"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{a.date}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.scannedAt ? `Scanned at ${new Date(a.scannedAt).toLocaleTimeString()}` : 'Recorded'}
                      {a.periodNumber ? ` · Period ${a.periodNumber}` : ''}
                    </p>
                  </div>
                </div>
                <div>
                  {a.status === 'PRESENT' && (
                    <Badge className="bg-emerald-500 text-white font-medium">Present</Badge>
                  )}
                  {a.status === 'LATE' && (
                    <Badge className="bg-amber-500 text-white font-medium">Late</Badge>
                  )}
                  {a.status === 'ABSENT' && (
                    <Badge variant="destructive" className="font-medium">Absent</Badge>
                  )}
                </div>
              </div>
            ))}
            {attendance.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <ClipboardCheck className="h-8 w-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">No attendance records logged yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notices Snippet */}
      {notices.length > 0 && (
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                Recent Announcements
              </CardTitle>
              <CardDescription>Important school and section updates</CardDescription>
            </div>
            <Link
              href="/student/notices"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {notices.slice(0, 2).map((notice) => (
              <div key={notice.id} className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm">{notice.title}</p>
                  <Badge variant={notice.priority === 'HIGH' ? 'destructive' : 'secondary'} className="text-[10px]">
                    {notice.priority}
                  </Badge>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{notice.content}</p>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {new Date(notice.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </section>
  );
}
