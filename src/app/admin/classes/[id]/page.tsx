'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Users, Building2, ClipboardCheck, CalendarDays, GraduationCap, CircleCheck as CheckCircle2, Circle as XCircle, Clock, TrendingUp, LayoutDashboard, ChevronRight } from 'lucide-react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
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
import { adminNav, adminBottomNav } from '@/lib/nav';
import {
  useAdminClassById,
  useAdminLookup,
  dayNames,
} from '@/hooks/useApi';

type ClassTab = 'overview' | 'students' | 'sections' | 'attendance' | 'timetable';

export default function AdminClassDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const classId = params?.id;
  const [activeTab, setActiveTab] = React.useState<ClassTab>('overview');

  const { data, isLoading } = useAdminClassById(classId);
  const { data: lookup } = useAdminLookup();

  const getSectionName = lookup?.getSectionName ?? ((id: string) => id);
  const getTeacherName = lookup?.getTeacherName ?? ((id: string) => id);
  const getSubjectName = lookup?.getSubjectName ?? ((id: string) => id);

  const cls = data?.class;
  const sections = data?.sections ?? [];
  const students = data?.students ?? [];
  const attendance = data?.attendance;
  const timetable = data?.timetable ?? [];
  const teacherCount = data?.teacherCount ?? 0;

  const viewUser = (userId: string) => {
    router.push(`/admin/users/${userId}`);
  };

  const TABS: { id: ClassTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'sections', label: 'Sections', icon: Building2 },
    { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
    { id: 'timetable', label: 'Timetable', icon: CalendarDays },
  ];

  return (
    <DashboardLayout
      items={adminNav}
      title="Kakshyasathi"
      subtitle="Admin Portal"
      pageTitle="Class Details"
      pageDescription={cls ? `${cls.name} - Academic Year ${cls.academicYear}` : 'Loading class information...'}
      allowedRoles={['ADMIN']}
      bottomNavItems={adminBottomNav}
    >
      <div className="mb-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/admin/classes')} className="gap-1 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Classes
        </Button>
      </div>

      {isLoading || !cls ? (
        <p className="text-sm text-muted-foreground">Loading class details...</p>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">{cls.name}</h2>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      {cls.grade && <span>Grade {cls.grade}</span>}
                      <span>Academic Year {cls.academicYear}</span>
                      <Badge variant="secondary" className="gap-1">
                        <Building2 className="h-3 w-3" />
                        {sections.length} Sections
                      </Badge>
                      <Badge variant="secondary" className="gap-1 bg-emerald-500/10 text-emerald-600">
                        <Users className="h-3 w-3" />
                        {students.length} Students
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="mb-4 flex flex-wrap gap-1 rounded-xl border border-border bg-card/50 p-1">
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

          {activeTab === 'overview' && (
            <>
              <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard label="Sections" value={sections.length} icon={Building2} accent="primary" />
                <StatCard label="Students" value={students.length} icon={Users} accent="success" />
                <StatCard label="Teachers" value={teacherCount} icon={GraduationCap} accent="chart-3" />
                <StatCard label="Attendance Rate" value={`${attendance?.overall.rate ?? 0}%`} icon={TrendingUp} accent="chart-4" />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <ClipboardCheck className="h-4 w-4 text-primary" />
                      Today&apos;s Attendance
                    </CardTitle>
                    <CardDescription>Live snapshot for {cls.name}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-xl bg-emerald-500/10 p-3 text-center">
                        <p className="text-2xl font-bold text-emerald-600">{attendance?.today.present ?? 0}</p>
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Present</p>
                      </div>
                      <div className="rounded-xl bg-destructive/10 p-3 text-center">
                        <p className="text-2xl font-bold text-destructive">{attendance?.today.absent ?? 0}</p>
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Absent</p>
                      </div>
                      <div className="rounded-xl bg-amber-500/10 p-3 text-center">
                        <p className="text-2xl font-bold text-amber-600">{attendance?.today.late ?? 0}</p>
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Late</p>
                      </div>
                    </div>
                    {students.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Overall Attendance</span>
                          <span className="font-semibold">{attendance?.overall.rate ?? 0}%</span>
                        </div>
                        <Progress value={attendance?.overall.rate ?? 0} className="h-2" />
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      Sections
                    </CardTitle>
                    <CardDescription>{sections.length} sections in {cls.name}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {sections.map((section) => (
                      <div
                        key={section.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2.5 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                            <GraduationCap className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">Section {section.name}</p>
                            <p className="text-xs text-muted-foreground">AY {section.academicYear}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="gap-1">
                          <Users className="h-3 w-3" />
                          {section.studentCount}
                        </Badge>
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
            </>
          )}

          {activeTab === 'students' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">All Students</CardTitle>
                <CardDescription>{students.length} students across all sections</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {students.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Username</TableHead>
                          <TableHead className="hidden md:table-cell">Section</TableHead>
                          <TableHead className="hidden lg:table-cell">Roll</TableHead>
                          <TableHead className="hidden lg:table-cell">Phone</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((student) => (
                          <TableRow
                            key={student.id}
                            className="cursor-pointer hover:bg-muted/40"
                            onClick={() => viewUser(student.id)}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-primary/10 text-xs text-primary">
                                    {student.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">{student.fullName}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-mono text-xs text-muted-foreground">{student.username}</span>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {student.sectionId ? getSectionName(student.sectionId) : '—'}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                              {student.rollNumber ?? '—'}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                              {student.phone ?? '—'}
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

          {activeTab === 'sections' && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sections.map((section) => (
                <Card key={section.id} className="transition-all hover:border-primary/30 hover:shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">Section {section.name}</CardTitle>
                        <CardDescription>AY {section.academicYear}</CardDescription>
                      </div>
                      <Badge variant="secondary" className="gap-1">
                        <Users className="h-3 w-3" />
                        {section.studentCount}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Class Teacher</span>
                      <span className="font-medium text-foreground">—</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'attendance' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Attendance</CardTitle>
                <CardDescription>Latest attendance records across sections</CardDescription>
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
                          <TableHead>Status</TableHead>
                          <TableHead>Scanned At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attendance.recent.map((record) => {
                          const student = students.find((s) => s.id === record.studentId);
                          return (
                            <TableRow
                              key={record.id}
                              className={student ? 'cursor-pointer hover:bg-muted/40' : ''}
                              onClick={() => student && viewUser(student.id)}
                            >
                              <TableCell className="font-medium whitespace-nowrap">
                                {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {student ? (
                                    <>
                                      <Avatar className="h-7 w-7">
                                        <AvatarFallback className="text-[10px]">
                                          {student.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-sm">{student.fullName}</span>
                                    </>
                                  ) : (
                                    <span className="text-sm text-muted-foreground">Unknown student</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {getSectionName(record.sectionId)}
                              </TableCell>
                              <TableCell>
                                {record.status === 'present' && (
                                  <Badge className="bg-emerald-500 text-white gap-1">
                                    <CheckCircle2 className="h-3 w-3" /> Present
                                  </Badge>
                                )}
                                {record.status === 'absent' && (
                                  <Badge variant="destructive" className="gap-1">
                                    <XCircle className="h-3 w-3" /> Absent
                                  </Badge>
                                )}
                                {record.status === 'late' && (
                                  <Badge className="bg-amber-500 text-white gap-1">
                                    <Clock className="h-3 w-3" /> Late
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                {record.scannedAt ? new Date(record.scannedAt).toLocaleTimeString() : '—'}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <ClipboardCheck className="h-10 w-10 text-muted-foreground/50" />
                    <p className="mt-3 text-sm font-medium text-muted-foreground">No attendance records yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'timetable' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Combined Timetable</CardTitle>
                <CardDescription>All sections weekly schedule</CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                {timetable.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Period</TableHead>
                        <TableHead>Day</TableHead>
                        <TableHead>Section</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Teacher</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timetable.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="whitespace-nowrap">
                            <div className="font-medium">P{entry.periodNumber}</div>
                            {(entry.startTime || entry.endTime) && (
                              <div className="text-[10px] text-muted-foreground">
                                {entry.startTime} – {entry.endTime}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="gap-1">
                              {dayNames[entry.dayOfWeek] ?? `Day ${entry.dayOfWeek + 1}`}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{getSectionName(entry.sectionId)}</TableCell>
                          <TableCell>
                            <span className="text-sm font-medium">
                              {entry.subjectName || getSubjectName(entry.subjectId)}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {entry.teacherName || getTeacherName(entry.teacherId)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CalendarDays className="h-10 w-10 text-muted-foreground/50" />
                    <p className="mt-3 text-sm font-medium text-muted-foreground">No timetable entries yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">Set up timetable entries in the Timetable module.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
