'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  GraduationCap,
  Phone,
  Calendar,
  User as UserIcon,
  TrendingUp,
  Building2,
} from 'lucide-react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
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
  useAdminUserById,
  useAdminLookup,
  dayNames,
} from '@/hooks/useApi';
import type { UserRole } from '@/types';

const roleBadgeVariant = (role: UserRole) => {
  if (role === 'ADMIN') return { variant: 'default' as const, className: '' };
  if (role === 'TEACHER') return { variant: 'secondary' as const, className: 'bg-chart-3/10 text-chart-3' };
  return { variant: 'secondary' as const, className: 'bg-emerald-500/10 text-emerald-600' };
};

const roleLabel = (role: string) => {
  if (role === 'ADMIN') return 'Administrator';
  if (role === 'TEACHER') return 'Teacher';
  if (role === 'STUDENT') return 'Student';
  return role;
};

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = params?.id;

  const { data, isLoading } = useAdminUserById(userId);
  const { data: lookup } = useAdminLookup();

  const getSectionName = lookup?.getSectionName ?? (() => 'Unknown');

  const user = data?.user;
  const attendance = data?.attendance;
  const presence = data?.presence;

  const initials = user
    ? user.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '??';

  const badge = user ? roleBadgeVariant(user.role) : null;

  return (
    <DashboardLayout
      items={adminNav}
      title="Kakshyasathi"
      subtitle="Admin Portal"
      pageTitle="User Details"
      pageDescription={user ? `${user.fullName} - ${roleLabel(user.role)}` : 'Loading user information...'}
      allowedRoles={['ADMIN']}
      bottomNavItems={adminBottomNav}
    >
      <div className="mb-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/admin/users')} className="gap-1 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Button>
      </div>

      {isLoading || !user ? (
        <p className="text-sm text-muted-foreground">Loading user details...</p>
      ) : (
        <>
          <Card className="mb-6 overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-primary/30 via-primary/20 to-chart-3/20" />
            <CardContent className="-mt-10 px-4 pb-6 sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <Avatar className="h-20 w-20 border-4 border-card shadow-lg">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-lg font-bold text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-bold tracking-tight">{user.fullName}</h2>
                    {badge && (
                      <Badge variant={badge.variant} className={badge.className}>
                        {roleLabel(user.role)}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <UserIcon className="h-3.5 w-3.5" />
                      @{user.username}
                    </span>
                    {user.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" />
                        {user.phone}
                      </span>
                    )}
                    {user.rollNumber && (
                      <span className="flex items-center gap-1.5">
                        <GraduationCap className="h-3.5 w-3.5" />
                        Roll No. {user.rollNumber}
                      </span>
                    )}
                    {user.sectionId && (
                      <span className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5" />
                        {getSectionName(user.sectionId)}
                      </span>
                    )}
                    {user.createdAt && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {user.role === 'STUDENT' && attendance && (
            <>
              <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard
                  label="Total Records"
                  value={attendance.total}
                  icon={ClipboardCheck}
                  accent="primary"
                />
                <StatCard
                  label="Present"
                  value={attendance.present}
                  icon={CheckCircle2}
                  accent="success"
                />
                <StatCard
                  label="Absent"
                  value={attendance.absent}
                  icon={XCircle}
                  accent="destructive"
                />
                <StatCard
                  label="Late"
                  value={attendance.late}
                  icon={Clock}
                  accent="warning"
                />
              </div>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Attendance Overview
                  </CardTitle>
                  <CardDescription>Overall academic performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {attendance.total > 0 && (
                    <>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Attendance Rate</span>
                          <span className="font-semibold text-foreground">
                            {Math.round((attendance.present / attendance.total) * 100)}%
                          </span>
                        </div>
                        <Progress
                          value={(attendance.present / attendance.total) * 100}
                          className="h-2"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-3 pt-2">
                        <div className="rounded-lg bg-emerald-500/10 p-3 text-center">
                          <p className="text-lg font-bold text-emerald-600">{attendance.present}</p>
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Present</p>
                        </div>
                        <div className="rounded-lg bg-destructive/10 p-3 text-center">
                          <p className="text-lg font-bold text-destructive">{attendance.absent}</p>
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Absent</p>
                        </div>
                        <div className="rounded-lg bg-amber-500/10 p-3 text-center">
                          <p className="text-lg font-bold text-amber-600">{attendance.late}</p>
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Late</p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recent Attendance History</CardTitle>
                  <CardDescription>Last {attendance.records.length} records</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {attendance.records.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Section</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Scanned At</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {attendance.records.map((record: any) => (
                            <TableRow key={record.id}>
                              <TableCell className="font-medium">
                                {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {getSectionName(record.sectionId)}
                              </TableCell>
                              <TableCell>
                                {record.status === 'PRESENT' && (
                                  <Badge className="bg-emerald-500 text-white gap-1">
                                    <CheckCircle2 className="h-3 w-3" /> Present
                                  </Badge>
                                )}
                                {record.status === 'ABSENT' && (
                                  <Badge variant="destructive" className="gap-1">
                                    <XCircle className="h-3 w-3" /> Absent
                                  </Badge>
                                )}
                                {record.status === 'LATE' && (
                                  <Badge className="bg-amber-500 text-white gap-1">
                                    <Clock className="h-3 w-3" /> Late
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {record.scannedAt
                                  ? new Date(record.scannedAt).toLocaleTimeString()
                                  : '—'}
                              </TableCell>
                            </TableRow>
                          ))}
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
            </>
          )}

          {user.role === 'TEACHER' && presence && (
            <>
              <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard
                  label="Total Scans"
                  value={presence.total}
                  icon={ClipboardCheck}
                  accent="primary"
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recent Classroom Presence</CardTitle>
                  <CardDescription>Teacher check-ins for assigned sections</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {presence.records.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Section</TableHead>
                            <TableHead>Period</TableHead>
                            <TableHead>Entry Time</TableHead>
                            <TableHead>Exit Time</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {presence.records.map((record: any) => (
                            <TableRow key={record.id}>
                              <TableCell className="font-medium">
                                {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {getSectionName(record.sectionId)}
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="bg-chart-3/10 text-chart-3">
                                  P{dayNames?.[0] ? '' : ''}
                                  {record.periodId?.toString()?.slice(0, 6) ?? '—'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">
                                {record.enteredAt ? new Date(record.enteredAt).toLocaleTimeString() : '—'}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {record.exitedAt ? new Date(record.exitedAt).toLocaleTimeString() : '—'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <ClipboardCheck className="h-10 w-10 text-muted-foreground/50" />
                      <p className="mt-3 text-sm font-medium text-muted-foreground">No presence records yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {(user.role === 'ADMIN') && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <UserIcon className="h-12 w-12 text-primary/40" />
                <h3 className="mt-4 text-lg font-semibold">Administrator Account</h3>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  This is an administrator account with full access to manage the school system.
                  Admins can manage users, classes, sections, timetable, attendance, notices, and more.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
