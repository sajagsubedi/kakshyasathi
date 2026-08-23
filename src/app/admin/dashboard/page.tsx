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

      <p className="text-sm text-muted-foreground">Loading dashboard...</p>

    );
  }

  if (isDashboardError) {
    return (
      <section
       
      >
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-sm font-medium">Failed to load dashboard</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {dashboardError instanceof Error ? dashboardError.message : 'Something went wrong'}
            </p>
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
    <section
    >
      <PageHeader
        title="School Overview"
        description={
          activeAcademicYear
            ? `Active academic year: ${activeAcademicYear.label}`
            : 'Real-time snapshot of your school\'s daily operations'
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Students" value={counts.students} icon={GraduationCap} accent="primary" trend={`${counts.students} enrolled`} />
        <StatCard label="Total Teachers" value={counts.teachers} icon={Users} accent="chart-3" trend={`${counts.teachers} active faculty`} />
        <StatCard label="Attendance Today" value={counts.attendanceToday} icon={ClipboardCheck} accent="success" trend={`${presentToday} present · ${lateToday} late`} trendUp />
        <StatCard label="Active Smart Boards" value={`${activeBoards}/${counts.smartBoards}`} icon={Monitor} accent="chart-4" trend={`${activeBoards} online now`} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Classes" value={classesCount} icon={Building2} accent="chart-2" />
        <StatCard label="Sections" value={sectionsCount} icon={GraduationCap} accent="chart-3" />
        <StatCard label="Substitutions Today" value={counts.substitutionsToday} icon={UserCheck} accent="warning" />
        <StatCard label="Published Notices" value={counts.notices} icon={Bell} accent="primary" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Subjects" value={counts.subjects} icon={ScanLine} accent="chart-2" />
        <StatCard label="Classrooms" value={counts.classrooms} icon={Building2} accent="chart-3" />
        <StatCard label="Attendance Terminals" value={`${activeTerminals}/${counts.terminals}`} icon={ClipboardCheck} accent="warning" />
        <StatCard label="Academic Years" value={academicYears.length} icon={GraduationCap} accent="primary" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Today&apos;s Attendance</CardTitle>
              <CardDescription>Latest attendance records</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Link href="/admin/attendance">View all<ArrowRight className="ml-2 h-3.5 w-3.5" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex h-2.5 overflow-hidden rounded-full">
              <div className="bg-emerald-500" style={{ width: `${presentWidth}%` }} />
              <div className="bg-amber-500" style={{ width: `${lateWidth}%` }} />
              <div className="bg-destructive" style={{ width: `${unmarkedWidth}%` }} />
            </div>
            <div className="space-y-2 pt-2">
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
                  <div key={record._id} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-xs text-primary">
                          {getInitials(studentName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{studentName}</p>
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
                <p className="rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground">
                  No attendance records for today.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Notices</CardTitle>
              <CardDescription>Latest published updates</CardDescription>
            </div>
            <Button variant="outline" size="sm"><Link href="/admin/notices"><ArrowRight className="h-3.5 w-3.5" /></Link></Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {notices.slice(0, 3).map((notice) => (
              <div key={notice._id} className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{notice.title}</p>
                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                    {notice.targetType === NoticeTargetType.all ? 'All' : 'Sections'}
                  </Badge>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{'body' in notice ? notice.body : ''}</p>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {new Date(
                    'publishedAt' in notice && notice.publishedAt
                      ? notice.publishedAt
                      : new Date().toISOString(),
                  ).toLocaleDateString()}
                </p>
              </div>
            ))}

            {notices.length === 0 && (
              <p className="rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground">
                No notices published yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Smart Board Status</CardTitle>
              <CardDescription>Classroom device connectivity</CardDescription>
            </div>
            <Button variant="outline" size="sm"><Link href="/admin/smartboards">Manage<ArrowRight className="ml-2 h-3.5 w-3.5" /></Link></Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {smartBoards.map((board) => (
              <div key={board._id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted"><Monitor className="h-4 w-4 text-muted-foreground" /></div>
                  <div>
                    <p className="text-sm font-medium">{board.deviceKey.slice(0, 12)}...</p>
                    <p className="text-xs text-muted-foreground">
                      {typeof board.classroom === 'string'
                        ? 'Assigned classroom'
                        : board.classroom.roomNumber}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={board.status === DeviceStatus.online ? 'default' : 'secondary'}
                  className={
                    board.status === DeviceStatus.online
                      ? 'bg-emerald-500 text-white hover:bg-emerald-500'
                      : ''
                  }
                >
                  {board.status}
                </Badge>
              </div>
            ))}

            {smartBoards.length === 0 && (
              <p className="rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground">
                No smart boards found.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Today&apos;s Substitutions</CardTitle>
              <CardDescription>Temporary teacher assignments</CardDescription>
            </div>
            <Button variant="outline" size="sm"><Link href="/admin/substitutions"><ArrowRight className="h-3.5 w-3.5" /></Link></Button>
          </CardHeader>
          <CardContent>
            {substitutions.length > 0 ? (
              <div className="space-y-2">
                {substitutions.map((sub) => (
                  <div key={sub._id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10"><UserCheck className="h-4 w-4 text-amber-600" /></div>
                      <div>
                        <p className="text-sm font-medium">{getTeacherName(sub.substituteTeacher)}</p>
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
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No substitutions today</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <QuickAction href="/admin/users" icon={Users} label="Add User" />
          <QuickAction href="/admin/timetable" icon={ScanLine} label="Timetable" />
          <QuickAction href="/admin/substitutions" icon={UserCheck} label="Substitute" />
          <QuickAction href="/admin/notices" icon={Bell} label="Send Notice" />
          <QuickAction href="/admin/smartboards" icon={Monitor} label="Smart Board" />
          <QuickAction href="/admin/attendance" icon={ClipboardCheck} label="Attendance" />
        </CardContent>
      </Card>
    </section>
  );
}

function QuickAction({ href, icon: Icon, label }: { href: string; icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center gap-2 rounded-xl border border-primary/20 bg-primary p-4 text-center text-primary-foreground shadow-sm shadow-primary/20 transition-all hover:border-primary/40 hover:bg-primary/95 hover:shadow-md hover:shadow-primary/30 active:scale-[0.98]"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/15 transition-all group-hover:bg-primary-foreground/25">
        <Icon className="h-5 w-5 text-primary-foreground" />
      </div>
      <span className="text-xs font-semibold">{label}</span>
    </Link>
  );
}
