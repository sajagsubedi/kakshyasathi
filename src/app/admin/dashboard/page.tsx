'use client';

import Link from 'next/link';
import {
  Users,
  GraduationCap,
  Building2,
  ClipboardCheck,
  Monitor,
  Bell,
  UserCheck,
  TrendingUp,
  ScanLine,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { DeviceStatus, NoticeTargetType } from '@/types';

import { StatCard } from '@/components/shared/StatCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAdminDashboard } from '@/hooks/admin/useDashboard';
import { useAdminAttendance } from '@/hooks/admin/useAttendance';
import { useAdminNotices } from '@/hooks/admin/useNotices';
import { useAdminSmartBoards } from '@/hooks/admin/useSmartBoards';
import { useAdminSubstitutions } from '@/hooks/admin/useSubstitutions';
import { useAdminClasses } from '@/hooks/admin/useClasses';
import { useAdminSections } from '@/hooks/admin/useSections';
import { useAdminAcademicYears } from '@/hooks/admin/useAcademicYears';
import Image from 'next/image';

type AttendanceStudent = {
  _id: string;
  user?: {
    name?: string;
  };
};

type AttendanceSection = {
  _id: string;
  name?: string;
  class?: {
    name?: string;
  };
};

type AttendanceSessionRef = {
  section?: AttendanceSection;
};

type AttendanceRecord = {
  _id: string;
  markedAt?: string;
  status?: string;
  student?: AttendanceStudent;
  attendanceSession?: AttendanceSessionRef;
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function getSectionLabel(section?: AttendanceSection) {
  if (!section) return 'Unknown Section';
  const className = section.class?.name?.trim();
  const sectionName = section.name?.trim();
  if (className && sectionName) return `${className} · ${sectionName}`;
  return className || sectionName || 'Unknown Section';
}

function getTeacherName(
  teacher:
    | string
    | {
      user?: {
        name?: string;
      };
    },
) {
  if (!teacher || typeof teacher === 'string') return 'Unassigned';
  return teacher.user?.name?.trim() || 'Unassigned';
}

function getSubstitutionSectionName(
  section:
    | string
    | {
      name?: string;
      class?: {
        name?: string;
      };
    },
) {
  if (!section || typeof section === 'string') return 'Unknown Section';
  const className = section.class?.name?.trim();
  const sectionName = section.name?.trim();
  if (className && sectionName) return `${className} · ${sectionName}`;
  return className || sectionName || 'Unknown Section';
}

export default function AdminDashboard() {
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  const formattedToday = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const {
    data: dashboard,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
    error: dashboardError,
  } = useAdminDashboard();

  const { data: classesData } = useAdminClasses({ page: 1, limit: 1 });
  const { data: sectionsData } = useAdminSections({ page: 1, limit: 1 });
  const { data: academicYears = [] } = useAdminAcademicYears();

  const { data: attendanceData } = useAdminAttendance({
    date: todayString,
    view: 'students',
    page: 1,
    limit: 5,
  });

  const { data: noticesData } = useAdminNotices({
    page: 1,
    limit: 3,
  });

  const { data: smartBoardsData } = useAdminSmartBoards({
    page: 1,
    limit: 5,
  });

  const { data: substitutionsData } = useAdminSubstitutions({
    date: todayString,
    page: 1,
    limit: 5,
  });

  if (isDashboardLoading || !dashboard) {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        <p className="text-sm text-muted-foreground">Loading dashboard…</p>
      </section>
    );
  }

  if (isDashboardError) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-sm border-destructive/20">
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10">
              <Bell className="h-5 w-5 text-destructive" />
            </div>
            <p className="text-sm font-medium">Failed to load dashboard</p>
            <p className="text-xs text-muted-foreground">
              {dashboardError instanceof Error ? dashboardError.message : 'Something went wrong'}
            </p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  const counts = dashboard.counts;
  const activeAcademicYear = academicYears.find((year) => year.isActive);

  const classesCount = classesData?.total ?? counts.classes;
  const sectionsCount = sectionsData?.total ?? counts.sections;

  const attendanceItems = (attendanceData?.items ?? []) as AttendanceRecord[];
  const presentToday = attendanceItems.filter((record) => record.status === 'present').length;
  const lateToday = attendanceItems.filter((record) => record.status === 'late').length;
  const unmarkedToday = Math.max(counts.attendanceToday - presentToday - lateToday, 0);

  const notices = noticesData?.items ?? dashboard.recentNotices;
  const smartBoards = smartBoardsData?.items ?? [];
  const substitutions = substitutionsData?.items ?? [];

  const activeBoards = dashboard.smartBoardStatus[DeviceStatus.online] ?? 0;
  const activeTerminals = dashboard.terminalStatus[DeviceStatus.online] ?? 0;

  const attendanceProgressTotal = Math.max(counts.students, 1);
  const presentWidth = (presentToday / attendanceProgressTotal) * 100;
  const lateWidth = (lateToday / attendanceProgressTotal) * 100;
  const unmarkedWidth = Math.max(100 - presentWidth - lateWidth, 0);

  return (
    <section className="space-y-6 pb-10">
      {/* ============================================================ */}
      {/* BRANDED HEADER BANNER                                         */}
      {/* ============================================================ */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary via-primary to-primary/80 px-6 py-7 shadow-sm shadow-primary/10 sm:px-8">
        {/* decorative glow */}
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-white/5 blur-3xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {/* logo mark — white background, swap the initials for an <img> if you have a real asset */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-md shadow-black/10 ring-1 ring-black/5">
              <Image
                src="/logo/icon.png"
                alt="Kakshyasathi"
                width={36}
                height={36}
                className="h-full w-full object-contain p-2"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight text-primary-foreground sm:text-2xl">
                  School Overview
                </h1>
              </div>
              <p className="mt-1 text-sm text-primary-foreground/80">
                {activeAcademicYear
                  ? `Active academic year: ${activeAcademicYear.label}`
                  : "Real-time snapshot of your school's daily operations"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm sm:self-auto">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-xs font-medium text-primary-foreground/90">{formattedToday}</span>
          </div>
        </div>
      </div>

      <PageHeader
        title=""
        description=""
      />

      {/* ============================================================ */}
      {/* PRIMARY STATS                                                 */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <StatCard label="Total Students" value={counts.students} icon={GraduationCap} accent="primary" trend={`${counts.students} enrolled`} />
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-75">
          <StatCard label="Total Teachers" value={counts.teachers} icon={Users} accent="chart-3" trend={`${counts.teachers} active faculty`} />
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
          <StatCard label="Attendance Today" value={counts.attendanceToday} icon={ClipboardCheck} accent="success" trend={`${presentToday} present · ${lateToday} late`} trendUp />
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
          <StatCard label="Active Smart Boards" value={`${activeBoards}/${counts.smartBoards}`} icon={Monitor} accent="chart-4" trend={`${activeBoards} online now`} />
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECONDARY STATS                                               */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Classes" value={classesCount} icon={Building2} accent="chart-2" />
        <StatCard label="Sections" value={sectionsCount} icon={GraduationCap} accent="chart-3" />
        <StatCard label="Substitutions Today" value={counts.substitutionsToday} icon={UserCheck} accent="warning" />
        <StatCard label="Published Notices" value={counts.notices} icon={Bell} accent="primary" />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Subjects" value={counts.subjects} icon={ScanLine} accent="chart-2" />
        <StatCard label="Classrooms" value={counts.classrooms} icon={Building2} accent="chart-3" />
        <StatCard label="Attendance Terminals" value={`${activeTerminals}/${counts.terminals}`} icon={ClipboardCheck} accent="warning" />
        <StatCard label="Academic Years" value={academicYears.length} icon={GraduationCap} accent="primary" />
      </div>

      {/* ============================================================ */}
      {/* ATTENDANCE + NOTICES                                          */}
      {/* ============================================================ */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between border-b border-border/60 bg-muted/20">
            <div>
              <CardTitle className="text-base">Today&apos;s Attendance</CardTitle>
              <CardDescription>Latest attendance records</CardDescription>
            </div>
            <Button variant="default" size="sm">
              <Link href="/admin/attendance" className="flex items-center">
                View all<ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            <div>
              <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
                <div className="bg-emerald-500 transition-all duration-700" style={{ width: `${presentWidth}%` }} />
                <div className="bg-amber-500 transition-all duration-700" style={{ width: `${lateWidth}%` }} />
                <div className="bg-destructive/70 transition-all duration-700" style={{ width: `${unmarkedWidth}%` }} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />Present · {presentToday}</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" />Late · {lateToday}</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-destructive/70" />Unmarked · {unmarkedToday}</span>
              </div>
            </div>

            <div className="space-y-2">
              {attendanceItems.map((record) => {
                const studentName = record.student?.user?.name?.trim() || 'Unknown Student';
                const sectionName = getSectionLabel(record.attendanceSession?.section);
                const time = record.markedAt
                  ? new Date(record.markedAt).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })
                  : 'N/A';
                const status = record.status === 'late' ? 'Late' : 'Present';
                const isLate = record.status === 'late';

                return (
                  <div
                    key={record._id}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-card px-3 py-2.5 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 ring-2 ring-background">
                        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                          {getInitials(studentName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-tight">{studentName}</p>
                        <p className="text-xs text-muted-foreground">{sectionName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{time}</span>
                      <Badge
                        variant="default"
                        className={
                          isLate
                            ? 'bg-amber-500 text-white hover:bg-amber-500'
                            : 'bg-emerald-500 text-white hover:bg-emerald-500'
                        }
                      >
                        {status}
                      </Badge>
                    </div>
                  </div>
                );
              })}

              {attendanceItems.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-10 text-center">
                  <ClipboardCheck className="h-6 w-6 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No attendance records for today.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-center justify-between border-b border-border/60 bg-muted/20">
            <div>
              <CardTitle className="text-base">Recent Notices</CardTitle>
              <CardDescription>Latest published updates</CardDescription>
            </div>
            <Button size="sm">
              <Link href="/admin/notices"><ArrowRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 pt-5">
            {notices.slice(0, 3).map((notice) => (
              <div
                key={notice._id}
                className="rounded-xl border border-border/60 bg-card p-3 transition-colors hover:bg-muted/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-tight">{notice.title}</p>
                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                    {notice.targetType === NoticeTargetType.all ? 'All' : 'Sections'}
                  </Badge>
                </div>
                <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{'body' in notice ? notice.body : ''}</p>
                <p className="mt-2 text-[11px] text-muted-foreground/80">
                  {new Date(
                    'publishedAt' in notice && notice.publishedAt
                      ? notice.publishedAt
                      : new Date().toISOString(),
                  ).toLocaleDateString()}
                </p>
              </div>
            ))}

            {notices.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-10 text-center">
                <Bell className="h-6 w-6 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No notices published yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ============================================================ */}
      {/* SMART BOARDS + SUBSTITUTIONS                                  */}
      {/* ============================================================ */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-center justify-between border-b border-border/60 bg-muted/20">
            <div>
              <CardTitle className="text-base">Smart Board Status</CardTitle>
              <CardDescription>Classroom device connectivity</CardDescription>
            </div>
            <Button size="sm">
              <Link href="/admin/smartboards" className="flex items-center">
                Manage<ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 pt-5">
            {smartBoards.map((board) => {
              const isOnline = board.status === DeviceStatus.online;
              return (
                <div
                  key={board._id}
                  className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2.5 transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${isOnline ? 'bg-emerald-500/10' : 'bg-muted'}`}>
                      <Monitor className={`h-4 w-4 ${isOnline ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <p className="font-mono text-sm font-medium">{board.deviceKey.slice(0, 12)}...</p>
                      <p className="text-xs text-muted-foreground">
                        {typeof board.classroom === 'string'
                          ? 'Assigned classroom'
                          : board.classroom.roomNumber}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={isOnline ? 'default' : 'secondary'}
                    className={isOnline ? 'bg-emerald-500 text-white hover:bg-emerald-500' : ''}
                  >
                    {board.status}
                  </Badge>
                </div>
              );
            })}

            {smartBoards.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-10 text-center">
                <Monitor className="h-6 w-6 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No smart boards found.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-center justify-between border-b border-border/60 bg-muted/20">
            <div>
              <CardTitle className="text-base">Today&apos;s Substitutions</CardTitle>
              <CardDescription>Temporary teacher assignments</CardDescription>
            </div>
            <Button size="sm">
              <Link href="/admin/substitutions"><ArrowRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-5">
            {substitutions.length > 0 ? (
              <div className="space-y-2">
                {substitutions.map((sub) => (
                  <div
                    key={sub._id}
                    className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2.5 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">
                        <UserCheck className="h-4 w-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-tight">{getTeacherName(sub.substituteTeacher)}</p>
                        <p className="text-xs text-muted-foreground">Substituting {getTeacherName(sub.originalTeacher)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium">{getSubstitutionSectionName(sub.section)}</p>
                      <p className="text-[11px] text-muted-foreground">Period {sub.periodNumber}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No substitutions today</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ============================================================ */}
      {/* QUICK ACTIONS                                                 */}
      {/* ============================================================ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
          <CardDescription>Jump straight into common tasks</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <QuickAction href="/admin/users" icon={Users} label="Add User" />
          <QuickAction href="/admin/timetable" icon={ScanLine} label="Timetable" />
          <QuickAction href="/admin/substitutions" icon={UserCheck} label="Substitute" />
          <QuickAction href="/admin/notices" icon={Bell} label="Send Notice" />
          <QuickAction href="/admin/smartboards" icon={Monitor} label="Smart Board" />
          <QuickAction href="/admin/attendance" icon={ClipboardCheck} label="Attendance" />
        </CardContent>
      </Card>
    </section >
  );
}

function QuickAction({ href, icon: Icon, label }: { href: string; icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center gap-2 rounded-xl border border-primary/20 bg-primary p-4 text-center text-primary-foreground shadow-sm shadow-primary/20 transition-all hover:border-primary/40 hover:bg-primary/95 hover:shadow-md hover:shadow-primary/30 active:scale-[0.98]"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/15 transition-all group-hover:scale-110 group-hover:bg-primary-foreground/25">
        <Icon className="h-5 w-5 text-primary-foreground" />
      </div>
      <span className="text-xs font-semibold">{label}</span>
    </Link>
  );
}