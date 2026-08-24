'use client';

import * as React from 'react';
import Link from 'next/link';
import { ScanLine, Clock, User, BookOpen, UserCheck, Monitor, Wifi, CheckCircle2, Bell, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSmartboardClassroom, useSmartboardNotices, useSmartboardAttendance } from '@/hooks/useApi';

export default function SmartBoardDashboard() {
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const { data: classroom } = useSmartboardClassroom();
  const { data: notices = [] } = useSmartboardNotices();
  const { data: attendance = [] } = useSmartboardAttendance();

  React.useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timeStr = currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
  const dateStr = currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const current = classroom?.currentPeriod;
  const next = classroom?.nextPeriod;
  const summary = classroom?.attendanceSummary;

  return (
    <section>
      <PageHeader title={classroom?.sectionName ?? 'Classroom'} description={dateStr} />
      <div className="mb-6 flex items-center justify-between rounded-2xl border bg-card p-6">
        <div><p className="text-4xl font-bold tabular-nums">{timeStr}</p><p className="text-sm text-muted-foreground">{dateStr}</p></div>
        <Badge className="bg-emerald-500 text-white"><Wifi className="mr-1 h-3 w-3" />ONLINE</Badge>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-primary/20">
          <CardHeader><CardTitle className="text-lg">Current Period</CardTitle><CardDescription>Live classroom information</CardDescription></CardHeader>
          <CardContent>
            {current ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3"><Monitor className="h-5 w-5 text-primary" /><span className="text-2xl font-bold">Period {current.periodNumber}</span></div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoBlock icon={BookOpen} label="Subject" value={current.subjectName} />
                  <InfoBlock icon={User} label="Teacher" value={current.teacherName} badge={current.isSubstitute ? 'Substitute' : undefined} />
                  <InfoBlock icon={Clock} label="Time" value={`${current.startTime} – ${current.endTime}`} />
                  <InfoBlock icon={UserCheck} label="Present" value={summary ? `${summary.present}/${summary.total}` : '—'} />
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No active period right now</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Next Period</CardTitle></CardHeader>
          <CardContent>
            {next ? (
              <div className="space-y-2">
                <p className="font-medium">Period {next.periodNumber}</p>
                <p className="text-sm">{next.subjectName}</p>
                <p className="text-xs text-muted-foreground">{next.teacherName}</p>
                <p className="text-xs">{next.startTime} – {next.endTime}</p>
              </div>
            ) : <p className="text-sm text-muted-foreground">No upcoming period</p>}
          </CardContent>
        </Card>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Attendance Today</CardTitle>
            <Link href="/smartboard/attendance" className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm font-medium transition-colors hover:bg-muted">
              <ScanLine className="mr-2 h-3.5 w-3.5" />Scan
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {attendance.filter((a) => a.status === 'PRESENT').slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                <span>{a.studentId.slice(-6)}</span>
                <Badge className="bg-emerald-500 text-white"><CheckCircle2 className="mr-1 h-3 w-3" />Present</Badge>
              </div>
            ))}
            {!attendance.length && <p className="text-sm text-muted-foreground">No scans yet today</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Notices</CardTitle>
            <Link href="/smartboard/notices" className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm font-medium transition-colors hover:bg-muted">
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {notices.slice(0, 3).map((n) => (
              <div key={n.id} className="rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center gap-2"><Bell className="h-3.5 w-3.5" /><p className="text-sm font-medium">{n.title}</p></div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{n.content}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function InfoBlock({ icon: Icon, label, value, badge }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; badge?: string }) {
  return (
    <div className="rounded-xl border bg-muted/30 p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5" />{label}</div>
      <p className="mt-1 font-semibold">{value}</p>
      {badge && <Badge className="mt-2 bg-amber-500/10 text-amber-600">{badge}</Badge>}
    </div>
  );
}
