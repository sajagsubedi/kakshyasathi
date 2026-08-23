'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Users,
  Building2,
  ClipboardCheck,
  CalendarDays,
  GraduationCap,
  CircleCheck as CheckCircle2,
  Circle as XCircle,
  Clock,
  TrendingUp,
  LayoutDashboard,
  ChevronRight,
  Tv,
  Cpu,
  DoorOpen,
  Search,
  BookOpen,
  Phone,
  Radio,
  Sparkles,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatCard } from '@/components/shared/StatCard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useAdminSectionDetail } from '@/hooks/admin/useSections';
import { DeviceStatus } from '@/types';

type SectionTab = 'overview' | 'students' | 'timetable' | 'attendance' | 'teachers';

const dayNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export default function AdminSectionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const sectionId = params?.id;
  const [activeTab, setActiveTab] = React.useState<SectionTab>('overview');
  const [studentSearch, setStudentSearch] = React.useState('');
  const [selectedDay, setSelectedDay] = React.useState<string>('all');

  const { data, isLoading, isError, error } = useAdminSectionDetail(sectionId);

  const section = data?.section;
  const classroom = data?.classroom;
  const smartBoard = data?.smartBoard;
  const terminal = data?.terminal;
  const students = data?.students ?? [];
  const teachers = data?.teachers ?? [];
  const timetable = data?.timetable ?? [];
  const todaySchedule = data?.todaySchedule ?? [];
  const attendance = data?.attendance;

  const viewUser = (userId?: string) => {
    if (userId) {
      router.push(`/admin/users/${userId}`);
    }
  };

  const filteredStudents = React.useMemo(() => {
    if (!studentSearch.trim()) return students;
    const query = studentSearch.toLowerCase().trim();
    return students.filter(
      (s) =>
        s.fullName.toLowerCase().includes(query) ||
        s.username.toLowerCase().includes(query) ||
        s.rollNumber?.toLowerCase().includes(query) ||
        s.symbolNumber?.toLowerCase().includes(query),
    );
  }, [students, studentSearch]);

  const filteredTimetable = React.useMemo(() => {
    if (selectedDay === 'all') return timetable;
    return timetable.filter((t) => t.dayOfWeek === selectedDay);
  }, [timetable, selectedDay]);

  const TABS: { id: SectionTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'students', label: `Students (${students.length})`, icon: Users },
    { id: 'timetable', label: 'Timetable', icon: CalendarDays },
    { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
    { id: 'teachers', label: `Teachers (${teachers.length})`, icon: GraduationCap },
  ];

  const getDeviceStatusBadge = (status?: DeviceStatus) => {
    if (!status) return null;
    switch (status) {
      case DeviceStatus.online:
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Online
          </Badge>
        );
      case DeviceStatus.syncing:
        return (
          <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 gap-1 font-medium">
            <Radio className="h-3 w-3 animate-spin" />
            Syncing
          </Badge>
        );
      case DeviceStatus.maintenance:
        return (
          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1 font-medium">
            <Clock className="h-3 w-3" />
            Maintenance
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-muted text-muted-foreground gap-1 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
            Offline
          </Badge>
        );
    }
  };

  return (
    <section>
      <div className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/admin/sections')}
          className="gap-1 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sections
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Card className="p-6 animate-pulse bg-muted/40">
            <div className="h-8 w-48 bg-muted rounded mb-2" />
            <div className="h-4 w-72 bg-muted rounded" />
          </Card>
        </div>
      ) : isError || !section ? (
        <Card className="p-12 text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">Section not found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'The requested section could not be loaded.'}
          </p>
          <Button className="mt-4" onClick={() => router.push('/admin/sections')}>
            Return to Sections
          </Button>
        </Card>
      ) : (
        <>
          {/* Section Header Card */}
          <Card className="mb-6 overflow-hidden border-border">
            <div className="border-b border-border bg-gradient-to-r from-primary/15 via-primary/10 to-chart-3/10 px-6 py-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 shadow-inner">
                    <GraduationCap className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-bold tracking-tight">Section {section.name}</h2>
                      <Badge variant="outline" className="bg-background/80 font-semibold">
                        AY {section.class.academicYear}
                      </Badge>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                      <button
                        type="button"
                        onClick={() => router.push(`/admin/classes/${section.class._id}`)}
                        className="flex items-center gap-1 font-medium text-foreground hover:underline"
                      >
                        <Building2 className="h-3.5 w-3.5 text-primary" />
                        {section.class.name}
                        {section.class.grade && <span>· Grade {section.class.grade}</span>}
                      </button>

                      {classroom ? (
                        <span className="flex items-center gap-1">
                          <DoorOpen className="h-3.5 w-3.5 text-primary" />
                          Room {classroom.roomNumber}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs">
                          <DoorOpen className="h-3.5 w-3.5" />
                          No Room Assigned
                        </span>
                      )}

                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {students.length} Students
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                  {smartBoard && (
                    <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card/60 px-3 py-1.5 text-xs">
                      <Tv className="h-3.5 w-3.5 text-primary" />
                      <span className="font-medium">Smart Board:</span>
                      {getDeviceStatusBadge(smartBoard.status)}
                    </div>
                  )}
                  {terminal && (
                    <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card/60 px-3 py-1.5 text-xs">
                      <Cpu className="h-3.5 w-3.5 text-chart-3" />
                      <span className="font-medium">{terminal.terminalCode}:</span>
                      {getDeviceStatusBadge(terminal.status)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Tab Navigation */}
          <div className="mb-6 flex flex-wrap gap-1 rounded-xl border border-border bg-card/50 p-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <Button
                  key={tab.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                  className={
                    isActive
                      ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }
                >
                  <Icon className="mr-1.5 h-3.5 w-3.5" />
                  {tab.label}
                </Button>
              );
            })}
          </div>

          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard
                  label="Enrolled Students"
                  value={students.length}
                  icon={Users}
                  accent="primary"
                />
                <StatCard
                  label="Attendance Rate"
                  value={`${attendance?.overall.rate ?? 0}%`}
                  icon={TrendingUp}
                  accent="success"
                />
                <StatCard
                  label="Assigned Classroom"
                  value={classroom ? `Room ${classroom.roomNumber}` : 'None'}
                  icon={DoorOpen}
                  accent="chart-3"
                />
                <StatCard
                  label="Assigned Teachers"
                  value={teachers.length}
                  icon={GraduationCap}
                  accent="chart-4"
                />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Classroom & Hardware Architecture Card (README §8, §9, §31, §38) */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <DoorOpen className="h-4 w-4 text-primary" />
                      Classroom & Connected Devices
                    </CardTitle>
                    <CardDescription>
                      Physical hardware deployed in {classroom ? `Room ${classroom.roomNumber}` : 'this section'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Smart Board Display Sub-Card */}
                    <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Tv className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">Smart Board (Display System)</p>
                            <p className="text-xs text-muted-foreground">
                              {smartBoard ? `Key: ${smartBoard.deviceKey}` : 'No Smart Board registered'}
                            </p>
                          </div>
                        </div>
                        {smartBoard ? (
                          getDeviceStatusBadge(smartBoard.status)
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">Unlinked</Badge>
                        )}
                      </div>
                      {smartBoard && smartBoard.lastSeenAt && (
                        <p className="text-[11px] text-muted-foreground">
                          Last active: {new Date(smartBoard.lastSeenAt).toLocaleString()}
                        </p>
                      )}
                    </div>

                    {/* Attendance Terminal Sub-Card */}
                    <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-3/10 text-chart-3">
                            <Cpu className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">
                              Attendance Terminal {terminal ? `(${terminal.terminalCode})` : ''}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {terminal ? `ESP32 + GM66 Scanner (Key: ${terminal.deviceKey})` : 'No Terminal installed'}
                            </p>
                          </div>
                        </div>
                        {terminal ? (
                          getDeviceStatusBadge(terminal.status)
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">Unlinked</Badge>
                        )}
                      </div>
                      {terminal && (
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                          <span>Synced Sequence: #{terminal.lastSyncedSequence}</span>
                          {terminal.lastSeenAt && (
                            <span>Last sync: {new Date(terminal.lastSeenAt).toLocaleTimeString()}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Today's Attendance Snapshot */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <ClipboardCheck className="h-4 w-4 text-primary" />
                      Today&apos;s Attendance
                    </CardTitle>
                    <CardDescription>Live attendance captured via Attendance Terminal</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-xl bg-emerald-500/10 p-3 text-center">
                        <p className="text-2xl font-bold text-emerald-600">{attendance?.today.present ?? 0}</p>
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">Present</p>
                      </div>
                      <div className="rounded-xl bg-destructive/10 p-3 text-center">
                        <p className="text-2xl font-bold text-destructive">{attendance?.today.absent ?? 0}</p>
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">Absent</p>
                      </div>
                      <div className="rounded-xl bg-amber-500/10 p-3 text-center">
                        <p className="text-2xl font-bold text-amber-600">{attendance?.today.late ?? 0}</p>
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">Late</p>
                      </div>
                    </div>

                    {students.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Overall Attendance Rate</span>
                          <span className="font-semibold text-foreground">{attendance?.overall.rate ?? 0}%</span>
                        </div>
                        <Progress value={attendance?.overall.rate ?? 0} className="h-2" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Today's Live Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    Today&apos;s Schedule
                  </CardTitle>
                  <CardDescription>
                    Effective schedule with global fallback, lab timing overrides, and substitutions
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {todaySchedule.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Period</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Effective Teacher</TableHead>
                            <TableHead>Classroom</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {todaySchedule.map((entry) => (
                            <TableRow key={entry.id}>
                              <TableCell className="font-medium whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <Badge variant="secondary">P{entry.periodNumber}</Badge>
                                  {entry.isCustomTiming && (
                                    <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20 gap-0.5">
                                      <Sparkles className="h-2.5 w-2.5" /> Lab
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                {entry.startTime ? `${entry.startTime} – ${entry.endTime}` : '—'}
                              </TableCell>
                              <TableCell className="font-medium text-sm">
                                {entry.subjectName}
                                {entry.subjectCode && (
                                  <span className="ml-1.5 text-xs text-muted-foreground">({entry.subjectCode})</span>
                                )}
                              </TableCell>
                              <TableCell className="text-sm">
                                {entry.substituteTeacherName ? (
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-medium text-amber-600 dark:text-amber-400">
                                      {entry.substituteTeacherName}
                                    </span>
                                    <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-600">
                                      Sub
                                    </Badge>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">{entry.teacherName}</span>
                                )}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                {entry.roomNumber ? `Room ${entry.roomNumber}` : '—'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <CalendarDays className="h-8 w-8 text-muted-foreground/40" />
                      <p className="mt-2 text-sm text-muted-foreground">No periods scheduled for today</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* 2. STUDENTS TAB */}
          {activeTab === 'students' && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-base">Enrolled Students</CardTitle>
                    <CardDescription>
                      {filteredStudents.length} of {students.length} students enrolled in Section {section.name}
                    </CardDescription>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search students..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="pl-8 h-9 text-xs"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {filteredStudents.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">Roll</TableHead>
                          <TableHead>Student</TableHead>
                          <TableHead>Username</TableHead>
                          <TableHead className="hidden md:table-cell">Symbol No.</TableHead>
                          <TableHead className="hidden lg:table-cell">Contact / Guardian</TableHead>
                          <TableHead className="hidden lg:table-cell">Year</TableHead>
                          <TableHead className="w-10"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map((student) => (
                          <TableRow
                            key={student._id}
                            className="cursor-pointer hover:bg-muted/40 transition-colors"
                            onClick={() => viewUser(student.userId)}
                          >
                            <TableCell className="font-semibold text-sm">
                              {student.rollNumber ?? '—'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                                    {student.fullName
                                      .split(' ')
                                      .map((n) => n[0])
                                      .slice(0, 2)
                                      .join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">{student.fullName}</p>
                                  {student.gender && (
                                    <p className="text-[11px] text-muted-foreground capitalize">{student.gender}</p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-mono text-xs text-muted-foreground">@{student.username}</span>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-xs font-mono text-muted-foreground">
                              {student.symbolNumber ?? '—'}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                              {student.guardianContact || student.phone ? (
                                <div className="flex items-center gap-1 text-xs">
                                  <Phone className="h-3 w-3 text-muted-foreground" />
                                  <span>{student.guardianContact || student.phone}</span>
                                </div>
                              ) : (
                                '—'
                              )}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                              {student.enrollmentYear ?? '—'}
                            </TableCell>
                            <TableCell>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Users className="h-10 w-10 text-muted-foreground/50" />
                    <p className="mt-3 text-sm font-medium text-muted-foreground">
                      {studentSearch ? 'No matching students found' : 'No students enrolled in this section yet'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 3. TIMETABLE TAB */}
          {activeTab === 'timetable' && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-base">Section Timetable</CardTitle>
                    <CardDescription>
                      Weekly schedule with global timings and practical/lab timing overrides
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Button
                      variant={selectedDay === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedDay('all')}
                      className="h-8 text-xs"
                    >
                      All Days
                    </Button>
                    {dayNames.map((day) => (
                      <Button
                        key={day}
                        variant={selectedDay === day.toLowerCase() ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedDay(day.toLowerCase())}
                        className="h-8 text-xs capitalize"
                      >
                        {day.slice(0, 3)}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {filteredTimetable.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Day</TableHead>
                          <TableHead>Period</TableHead>
                          <TableHead>Timing</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Teacher</TableHead>
                          <TableHead>Classroom</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTimetable.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell className="font-semibold text-xs capitalize">
                              <Badge variant="secondary">{entry.dayOfWeek}</Badge>
                            </TableCell>
                            <TableCell className="font-medium whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span>P{entry.periodNumber}</span>
                                {entry.isCustomTiming && (
                                  <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                                    Custom Timing
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                              {entry.startTime ? `${entry.startTime} – ${entry.endTime}` : '—'}
                            </TableCell>
                            <TableCell>
                              <span className="text-sm font-medium">{entry.subjectName}</span>
                              {entry.subjectCode && (
                                <span className="ml-1.5 font-mono text-xs text-muted-foreground">({entry.subjectCode})</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {entry.teacherName}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                              {entry.roomNumber ? `Room ${entry.roomNumber}` : '—'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CalendarDays className="h-10 w-10 text-muted-foreground/50" />
                    <p className="mt-3 text-sm font-medium text-muted-foreground">No timetable entries found</p>
                    <p className="mt-1 text-xs text-muted-foreground">Configure timetable in the Timetable section.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 4. ATTENDANCE TAB */}
          {activeTab === 'attendance' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Attendance Records</CardTitle>
                <CardDescription>
                  Real-time optical scans captured via the Attendance Terminal in this section
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {attendance && attendance.recent.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Student</TableHead>
                          <TableHead>Roll No</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Period</TableHead>
                          <TableHead>Scanned At (RTC)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attendance.recent.map((record) => (
                          <TableRow
                            key={record.id}
                            className={record.userId ? 'cursor-pointer hover:bg-muted/40 transition-colors' : ''}
                            onClick={() => viewUser(record.userId)}
                          >
                            <TableCell className="font-medium whitespace-nowrap">
                              {new Date(record.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-7 w-7">
                                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                    {record.studentName
                                      .split(' ')
                                      .map((n) => n[0])
                                      .slice(0, 2)
                                      .join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">{record.studentName}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {record.rollNumber || '—'}
                            </TableCell>
                            <TableCell>
                              {record.status === 'present' && (
                                <Badge className="bg-emerald-500 text-white gap-1 font-medium">
                                  <CheckCircle2 className="h-3 w-3" /> Present
                                </Badge>
                              )}
                              {record.status === 'absent' && (
                                <Badge variant="destructive" className="gap-1 font-medium">
                                  <XCircle className="h-3 w-3" /> Absent
                                </Badge>
                              )}
                              {record.status === 'late' && (
                                <Badge className="bg-amber-500 text-white gap-1 font-medium">
                                  <Clock className="h-3 w-3" /> Late
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {record.periodNumber ? `Period ${record.periodNumber}` : '—'}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                              {record.scannedAt ? new Date(record.scannedAt).toLocaleTimeString() : '—'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <ClipboardCheck className="h-10 w-10 text-muted-foreground/50" />
                    <p className="mt-3 text-sm font-medium text-muted-foreground">No attendance records logged yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 5. TEACHERS TAB */}
          {activeTab === 'teachers' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Assigned Teachers</CardTitle>
                <CardDescription>Faculty assigned to conduct classes for Section {section.name}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {teachers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Teacher</TableHead>
                          <TableHead>Username</TableHead>
                          <TableHead>Subjects Taught</TableHead>
                          <TableHead className="w-10"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teachers.map((teacher) => (
                          <TableRow
                            key={teacher._id}
                            className="cursor-pointer hover:bg-muted/40 transition-colors"
                            onClick={() => viewUser(teacher.userId)}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-chart-3/15 text-chart-3 text-xs font-semibold">
                                    {teacher.fullName
                                      .split(' ')
                                      .map((n) => n[0])
                                      .slice(0, 2)
                                      .join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">{teacher.fullName}</p>
                                  {teacher.email && (
                                    <p className="text-[11px] text-muted-foreground">{teacher.email}</p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              @{teacher.username}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1.5">
                                {teacher.subjects.map((sub) => (
                                  <Badge
                                    key={sub._id}
                                    variant="secondary"
                                    className="bg-primary/10 text-primary border-primary/20 text-xs font-normal"
                                  >
                                    <BookOpen className="mr-1 h-3 w-3" />
                                    {sub.name}
                                  </Badge>
                                ))}
                                {teacher.subjects.length === 0 && (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <GraduationCap className="h-10 w-10 text-muted-foreground/50" />
                    <p className="mt-3 text-sm font-medium text-muted-foreground">No teachers assigned to this section yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </section>
  );
}
