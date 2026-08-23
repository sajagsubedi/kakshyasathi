'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  GraduationCap,
  Bell,
  Clock,
  ArrowRight,
  DoorOpen,
  Users,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import {
  useTeacherDashboard,
  dayNames,
} from '@/hooks/useApi';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useTeacherDashboard();

  const sections = data?.sections ?? [];
  const todaySchedule = data?.todaySchedule ?? [];
  const presence = data?.presence ?? [];
  const notices = data?.notices ?? [];
  const dayIdx = new Date().getDay();

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] ?? 'Teacher'}
          </h1>
          <p className="text-sm text-muted-foreground">
            Faculty Portal · Schedule, classroom presence, and assigned sections
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary font-medium">
            <CalendarDays className="h-3.5 w-3.5" />
            {dayNames[dayIdx]}
          </Badge>
        </div>
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
            label="Assigned Sections"
            value={sections.length}
            icon={GraduationCap}
            accent="primary"
          />
          <StatCard
            label="Classes Today"
            value={todaySchedule.length}
            icon={CalendarDays}
            accent="chart-3"
          />
          <StatCard
            label="Presence Scans"
            value={presence.length}
            icon={Clock}
            accent="success"
          />
          <StatCard
            label="Notices"
            value={notices.length}
            icon={Bell}
            accent="warning"
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Live Schedule */}
        <Card className="flex flex-col">
          <CardHeader className="flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                Today&apos;s Classes
              </CardTitle>
              <CardDescription>{dayNames[dayIdx]} schedule</CardDescription>
            </div>
            <Link
              href="/teacher/timetable"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-background p-2 text-xs font-medium transition-colors hover:bg-muted"
            >
              <ArrowRight className="h-4 w-4" />
            </Link>
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
                        <p className="text-sm font-semibold">{entry.subjectName}</p>
                        {entry.subjectCode && (
                          <span className="font-mono text-xs text-muted-foreground">({entry.subjectCode})</span>
                        )}
                        {entry.isCustomTiming && (
                          <Badge variant="outline" className="text-[10px] px-1 py-0 bg-primary/10 text-primary">
                            Lab
                          </Badge>
                        )}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                        <span className="font-medium">{entry.sectionName}</span>
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

        {/* Presence Activity */}
        <Card className="flex flex-col">
          <CardHeader className="flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Classroom Presence Log
              </CardTitle>
              <CardDescription>Automated terminal scans upon room entry</CardDescription>
            </div>
            <Link
              href="/teacher/presence"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-background p-2 text-xs font-medium transition-colors hover:bg-muted"
            >
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent className="flex-1 space-y-2.5">
            {presence.slice(0, 5).map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3 transition-colors hover:bg-muted/60"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{p.sectionName || `Period ${p.periodNumber}`}</p>
                      {p.roomNumber && (
                        <Badge variant="outline" className="text-[10px]">
                          Room {p.roomNumber}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Entered at {new Date(p.enteredAt).toLocaleTimeString()}
                      {p.exitedAt ? ` · Exited at ${new Date(p.exitedAt).toLocaleTimeString()}` : ''}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  P{p.periodNumber}
                </Badge>
              </div>
            ))}
            {presence.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Clock className="h-8 w-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">No classroom presence logged yet today.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Assigned Sections Grid */}
      {sections.length > 0 && (
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                Assigned Sections
              </CardTitle>
              <CardDescription>{sections.length} classes under your instruction</CardDescription>
            </div>
            <Link
              href="/teacher/sections"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sections.slice(0, 3).map((sec) => (
              <div key={sec.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3.5">
                <div>
                  <p className="font-semibold text-sm">
                    {sec.className ? `${sec.className} - Section ${sec.name}` : `Section ${sec.name}`}
                  </p>
                  <p className="text-xs text-muted-foreground">AY {sec.academicYear || '—'}</p>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <Users className="h-3 w-3" />
                  {sec.studentCount ?? 0}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </section>
  );
}
