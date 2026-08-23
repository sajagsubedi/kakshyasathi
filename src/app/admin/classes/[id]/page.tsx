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
  DoorOpen,
  Search,
  BookOpen,
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
import { useAdminClassDetail } from '@/hooks/admin/useClasses';

type ClassTab = 'overview' | 'sections' | 'students' | 'attendance' | 'timetable';

const dayNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export default function AdminClassDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const classId = params?.id;
  const [activeTab, setActiveTab] = React.useState<ClassTab>('overview');
  const [studentSearch, setStudentSearch] = React.useState('');
  const [selectedSectionFilter, setSelectedSectionFilter] = React.useState<string>('all');

  const { data, isLoading, isError, error } = useAdminClassDetail(classId);

  const cls = data?.class;
  const sections = data?.sections ?? [];
  const students = data?.students ?? [];
  const attendance = data?.attendance;
  const timetable = data?.timetable ?? [];
  const teacherCount = data?.teacherCount ?? 0;

  const viewUser = (userId?: string) => {
    if (userId) {
      router.push(`/admin/users/${userId}`);
    }
  };

  const viewSection = (secId: string) => {
    router.push(`/admin/sections/${secId}`);
  };

  const filteredStudents = React.useMemo(() => {
    return students.filter((s) => {
      const matchesSection =
        selectedSectionFilter === 'all' || s.sectionId === selectedSectionFilter;
      const query = studentSearch.toLowerCase().trim();
      const matchesSearch =
        !query ||
        s.fullName.toLowerCase().includes(query) ||
        s.username.toLowerCase().includes(query) ||
        s.rollNumber?.toLowerCase().includes(query);
      return matchesSection && matchesSearch;
    });
  }, [students, studentSearch, selectedSectionFilter]);

  const filteredTimetable = React.useMemo(() => {
    if (selectedSectionFilter === 'all') return timetable;
    return timetable.filter((t) => t.sectionId === selectedSectionFilter);
  }, [timetable, selectedSectionFilter]);

  const TABS: { id: ClassTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'sections', label: `Sections (${sections.length})`, icon: Building2 },
    { id: 'students', label: `Students (${students.length})`, icon: Users },
    { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
    { id: 'timetable', label: 'Timetable', icon: CalendarDays },
  ];

  return (
    <section>
      <div className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/admin/classes')}
          className="gap-1 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Classes
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Card className="p-6 animate-pulse bg-muted/40">
            <div className="h-8 w-48 bg-muted rounded mb-2" />
            <div className="h-4 w-72 bg-muted rounded" />
          </Card>
        </div>
      ) : isError || !cls ? (
        <Card className="p-12 text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">Class not found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'The requested class could not be loaded.'}
          </p>
          <Button className="mt-4" onClick={() => router.push('/admin/classes')}>
            Return to Classes
          </Button>
        </Card>
      ) : (
        <>
          {/* Header Card */}
          <Card className="mb-6 overflow-hidden border-border">
            <div className="border-b border-border bg-gradient-to-r from-primary/15 via-primary/10 to-chart-3/10 px-6 py-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 shadow-inner">
                    <GraduationCap className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">{cls.name}</h2>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      {cls.grade && <span className="font-medium">Grade {cls.grade}</span>}
                      <span>Academic Year {cls.academicYear}</span>
                      <Badge variant="secondary" className="gap-1 bg-background/80 font-medium">
                        <Building2 className="h-3 w-3 text-primary" />
                        {sections.length} {sections.length === 1 ? 'Section' : 'Sections'}
                      </Badge>
                      <Badge variant="secondary" className="gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                        <Users className="h-3 w-3" />
                        {students.length} Students
                      </Badge>
                    </div>
                  </div>
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
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard label="Sections" value={sections.length} icon={Building2} accent="primary" />
                <StatCard label="Students" value={students.length} icon={Users} accent="success" />
                <StatCard label="Assigned Teachers" value={teacherCount} icon={GraduationCap} accent="chart-3" />
                <StatCard label="Attendance Rate" value={`${attendance?.overall.rate ?? 0}%`} icon={TrendingUp} accent="chart-4" />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Attendance Snapshot */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <ClipboardCheck className="h-4 w-4 text-primary" />
                      Today&apos;s Attendance
                    </CardTitle>
                    <CardDescription>Live snapshot across all sections in {cls.name}</CardDescription>
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
                          <span className="font-semibold">{attendance?.overall.rate ?? 0}%</span>
                        </div>
                        <Progress value={attendance?.overall.rate ?? 0} className="h-2" />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Sections List Card */}
                <Card>
                  <CardHeader className="flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        Sections in {cls.name}
                      </CardTitle>
                      <CardDescription>{sections.length} sections registered</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('sections')} className="text-xs gap-1">
                      View all <ChevronRight className="h-3 w-3" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {sections.map((section) => (
                      <div
                        key={section.id}
                        onClick={() => viewSection(section.id)}
                        className="group flex cursor-pointer items-center justify-between rounded-xl border border-border bg-muted/30 px-3.5 py-3 transition-all hover:bg-muted/60 hover:border-primary/40"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                            <GraduationCap className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold group-hover:text-primary transition-colors">
                              Section {section.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {section.classroom ? `Room ${section.classroom.roomNumber}` : 'No room assigned'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="gap-1 text-xs">
                            <Users className="h-3 w-3" />
                            {section.studentCount}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    ))}
                    {sections.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        <Building2 className="h-8 w-8 text-muted-foreground/40" />
                        <p className="mt-2 text-xs text-muted-foreground">No sections created yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* 2. SECTIONS TAB */}
          {activeTab === 'sections' && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sections.map((section) => (
                <Card
                  key={section.id}
                  onClick={() => viewSection(section.id)}
                  className="group cursor-pointer transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                          <GraduationCap className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base group-hover:text-primary transition-colors">
                            Section {section.name}
                          </CardTitle>
                          <CardDescription>AY {section.academicYear}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary" className="gap-1">
                        <Users className="h-3 w-3" />
                        {section.studentCount}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0">
                    <div className="flex items-center justify-between rounded-lg bg-muted/40 p-2.5 text-xs">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <DoorOpen className="h-3.5 w-3.5" />
                        Classroom
                      </span>
                      <span className="font-semibold text-foreground">
                        {section.classroom ? `Room ${section.classroom.roomNumber}` : '—'}
                      </span>
                    </div>

                    <Button variant="outline" size="sm" className="w-full mt-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      View Section Details
                      <ChevronRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {sections.length === 0 && (
                <div className="col-span-full py-12 text-center">
                  <Building2 className="mx-auto h-10 w-10 text-muted-foreground/40" />
                  <p className="mt-3 text-sm text-muted-foreground">No sections created for this class yet.</p>
                </div>
              )}
            </div>
          )}

          {/* 3. STUDENTS TAB */}
          {activeTab === 'students' && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-base">All Students in {cls.name}</CardTitle>
                    <CardDescription>{filteredStudents.length} of {students.length} students</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div className="relative w-full sm:w-56">
                      <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search students..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="pl-8 h-9 text-xs"
                      />
                    </div>
                    {sections.length > 1 && (
                      <div className="flex gap-1">
                        <Button
                          variant={selectedSectionFilter === 'all' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedSectionFilter('all')}
                          className="h-9 text-xs"
                        >
                          All Sections
                        </Button>
                        {sections.map((sec) => (
                          <Button
                            key={sec.id}
                            variant={selectedSectionFilter === sec.id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedSectionFilter(sec.id)}
                            className="h-9 text-xs"
                          >
                            Sec {sec.name}
                          </Button>
                        ))}
                      </div>
                    )}
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
                          <TableHead>Section</TableHead>
                          <TableHead className="hidden md:table-cell">Symbol No.</TableHead>
                          <TableHead className="hidden lg:table-cell">Phone</TableHead>
                          <TableHead className="w-10"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map((student) => (
                          <TableRow
                            key={student.studentId || student.id}
                            className="cursor-pointer hover:bg-muted/40 transition-colors"
                            onClick={() => viewUser(student.userId || student.id)}
                          >
                            <TableCell className="font-semibold text-sm">
                              {student.rollNumber || '—'}
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
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">
                                Section {student.sectionName || '—'}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-xs font-mono text-muted-foreground">
                              {student.symbolNumber || '—'}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                              {student.phone || '—'}
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
                    <p className="mt-3 text-sm font-medium text-muted-foreground">No students enrolled yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 4. ATTENDANCE TAB */}
          {activeTab === 'attendance' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Attendance</CardTitle>
                <CardDescription>Latest attendance records across sections in {cls.name}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {attendance && attendance.recent.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Student</TableHead>
                          <TableHead>Section</TableHead>
                          <TableHead>Roll No</TableHead>
                          <TableHead>Status</TableHead>
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
                            <TableCell className="text-sm text-muted-foreground">
                              Section {record.sectionName || '—'}
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

          {/* 5. TIMETABLE TAB */}
          {activeTab === 'timetable' && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-base">Combined Timetable</CardTitle>
                    <CardDescription>All sections weekly schedule for {cls.name}</CardDescription>
                  </div>
                  {sections.length > 1 && (
                    <div className="flex gap-1">
                      <Button
                        variant={selectedSectionFilter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedSectionFilter('all')}
                        className="h-8 text-xs"
                      >
                        All Sections
                      </Button>
                      {sections.map((sec) => (
                        <Button
                          key={sec.id}
                          variant={selectedSectionFilter === sec.id ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedSectionFilter(sec.id)}
                          className="h-8 text-xs"
                        >
                          Sec {sec.name}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                {filteredTimetable.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Period</TableHead>
                        <TableHead>Timing</TableHead>
                        <TableHead>Day</TableHead>
                        <TableHead>Section</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Classroom</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTimetable.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="whitespace-nowrap font-medium">
                            <div className="flex items-center gap-1.5">
                              <span>P{entry.periodNumber}</span>
                              {entry.isCustomTiming && (
                                <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                                  Custom
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {entry.startTime ? `${entry.startTime} – ${entry.endTime}` : '—'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="gap-1 font-normal text-xs">
                              {dayNames[entry.dayOfWeek] ?? `Day ${entry.dayOfWeek + 1}`}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm font-semibold">
                            Section {entry.sectionName || '—'}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-medium">{entry.subjectName}</span>
                            {entry.subjectCode && (
                              <span className="ml-1 font-mono text-xs text-muted-foreground">({entry.subjectCode})</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {entry.teacherName || '—'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {entry.roomNumber ? `Room ${entry.roomNumber}` : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CalendarDays className="h-10 w-10 text-muted-foreground/50" />
                    <p className="mt-3 text-sm font-medium text-muted-foreground">No timetable entries configured</p>
                    <p className="mt-1 text-xs text-muted-foreground">Set up timetable in the Timetable module.</p>
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
