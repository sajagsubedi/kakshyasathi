'use client';

import Link from 'next/link';
import { CalendarDays, GraduationCap, Bell, Clock, ArrowRight } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useTeacherTimetable, useTeacherSections, useTeacherPresence, useTeacherNotices, useSharedLookup, dayNames } from '@/hooks/useApi';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { data: timetable = [] } = useTeacherTimetable();
  const { data: sections = [] } = useTeacherSections();
  const { data: presence = [] } = useTeacherPresence();
  const { data: notices = [] } = useTeacherNotices();
  const { data: lookup } = useSharedLookup();

  const getSectionName = lookup?.getSectionName ?? ((id: string) => id);
  const getSubjectName = lookup?.getSubjectName ?? ((id: string) => id);
  const dayIdx = new Date().getDay();
  const todaySchedule = timetable.filter((t) => t.dayOfWeek === dayIdx);

  return (
    <section>
      <PageHeader title={`Welcome back, ${user?.fullName?.split(' ')[0] ?? 'Teacher'}`} description="Your schedule and classroom activity" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Sections" value={sections.length} icon={GraduationCap} accent="primary" />
        <StatCard label="Classes Today" value={todaySchedule.length} icon={CalendarDays} accent="chart-3" />
        <StatCard label="Presence Records" value={presence.length} icon={Clock} accent="success" />
        <StatCard label="Notices" value={notices.length} icon={Bell} accent="warning" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div><CardTitle className="text-base">Today&apos;s Schedule</CardTitle><CardDescription>{dayNames[dayIdx]}</CardDescription></div>
            <Link href="/teacher/timetable" className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm font-medium transition-colors hover:bg-muted">
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {todaySchedule.length ? todaySchedule.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                <div><p className="text-sm font-medium">{getSubjectName(entry.subjectId)}</p><p className="text-xs text-muted-foreground">{getSectionName(entry.sectionId)}</p></div>
                <Badge variant="secondary">Period</Badge>
              </div>
            )) : <p className="text-sm text-muted-foreground">No classes scheduled today</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Notices</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {notices.slice(0, 3).map((n) => (
              <div key={n.id} className="rounded-lg border bg-muted/30 p-3">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{n.content}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
