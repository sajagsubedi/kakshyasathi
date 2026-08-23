"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
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
  Mail,
} from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatCard } from "@/components/shared/StatCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useAdminUser } from "@/hooks/admin/useUsers";
import { useAdminSections } from "@/hooks/admin/useSections";
import { UserRole, type AttendanceStatus } from "@/types";
import { sectionLabel, refId } from "@/lib/adminDisplay";

const roleBadgeVariant = (role: UserRole) => {
  if (role === UserRole.admin)
    return { variant: "default" as const, className: "" };
  if (role === UserRole.teacher)
    return {
      variant: "secondary" as const,
      className: "bg-chart-3/10 text-chart-3",
    };
  return {
    variant: "secondary" as const,
    className: "bg-emerald-500/10 text-emerald-600",
  };
};

const roleLabel = (role: UserRole) => {
  if (role === UserRole.admin) return "Administrator";
  if (role === UserRole.teacher) return "Teacher";
  if (role === UserRole.student) return "Student";
  return role;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

type AttendanceSummary = {
  total: number;
  present: number;
  absent: number;
  late: number;
  records: Array<{
    _id: string;
    date: string;
    section: unknown;
    status: AttendanceStatus | "absent" | string;
    markedAt?: string;
    scannedAt?: string;
  }>;
};

type PresenceSummary = {
  total: number;
  records: Array<{
    _id: string;
    date: string;
    section: unknown;
    period: unknown;
    enteredAt?: string;
    exitedAt?: string;
  }>;
};

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = params?.id;

  const { data: user, isLoading } = useAdminUser(userId);

  const { data: sectionsData } = useAdminSections({ limit: 100 });
  const sections = sectionsData?.items ?? [];

  const resolveSection = (ref: unknown) => {
    if (!ref || typeof ref === "string") {
      return sections.find((s) => s._id === refId(ref));
    }
    return ref;
  };

  const sectionLabelFor = (ref: unknown) => {
    const resolved = resolveSection(ref);
    return resolved ? sectionLabel(resolved) : "Unknown Section";
  };

  const initials = user ? getInitials(user.name) : "??";
  const badge = user ? roleBadgeVariant(user.role) : null;

  const [attendance] = React.useState<AttendanceSummary | undefined>(undefined);
  const [presence] = React.useState<PresenceSummary | undefined>(undefined);

  return (
    <section>
      <div className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/users")}
          className="gap-1 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Button>
      </div>

      {isLoading || !user ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Loading user details...
          </CardContent>
        </Card>
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
                    <h2 className="text-2xl font-bold tracking-tight">
                      {user.name}
                    </h2>
                    {badge && (
                      <Badge
                        variant={badge.variant}
                        className={badge.className}
                      >
                        {roleLabel(user.role)}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <UserIcon className="h-3.5 w-3.5" />
                      @{user.username}
                    </span>
                    {user.email && (
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        {user.email}
                      </span>
                    )}
                    {user.student?.guardianContact && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" />
                        {user.student.guardianContact}
                      </span>
                    )}
                    {user.student?.rollNumber && (
                      <span className="flex items-center gap-1.5">
                        <GraduationCap className="h-3.5 w-3.5" />
                        Roll No. {user.student.rollNumber}
                      </span>
                    )}
                    {user.student?.section && (
                      <span className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5" />
                        {sectionLabelFor(user.student.section)}
                      </span>
                    )}
                    {user.teacher?.assignedSections &&
                      user.teacher.assignedSections.length > 0 && (
                        <span className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5" />
                          {user.teacher.assignedSections.length} sections
                        </span>
                      )}
                    {user.createdAt && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        Joined{" "}
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {user.student && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {user.student.symbolNumber && (
                        <Badge variant="outline">
                          Symbol: {user.student.symbolNumber}
                        </Badge>
                      )}
                      {user.student.enrollmentYear && (
                        <Badge variant="outline">
                          Enrollment: {user.student.enrollmentYear}
                        </Badge>
                      )}
                    </div>
                  )}
                  {user.teacher &&
                    user.teacher.subjects &&
                    user.teacher.subjects.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {user.teacher.subjects.map((sub, idx) => {
                          const name =
                            typeof sub === "string"
                              ? `Subject ${idx + 1}`
                              : sub.name;
                          return (
                            <Badge
                              key={
                                typeof sub === "string" ? sub : sub._id
                              }
                              variant="secondary"
                              className="bg-chart-3/10 text-chart-3"
                            >
                              {name}
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>

          {user.role === UserRole.student && (
            <>
              <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard
                  label="Total Records"
                  value={attendance?.total ?? 0}
                  icon={ClipboardCheck}
                  accent="primary"
                />
                <StatCard
                  label="Present"
                  value={attendance?.present ?? 0}
                  icon={CheckCircle2}
                  accent="success"
                />
                <StatCard
                  label="Absent"
                  value={attendance?.absent ?? 0}
                  icon={XCircle}
                  accent="destructive"
                />
                <StatCard
                  label="Late"
                  value={attendance?.late ?? 0}
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
                  <CardDescription>
                    Overall academic performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {attendance && attendance.total > 0 ? (
                    <>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            Attendance Rate
                          </span>
                          <span className="font-semibold text-foreground">
                            {Math.round(
                              (attendance.present / attendance.total) * 100
                            )}
                            %
                          </span>
                        </div>
                        <Progress
                          value={
                            (attendance.present / attendance.total) * 100
                          }
                          className="h-2"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-3 pt-2">
                        <div className="rounded-lg bg-emerald-500/10 p-3 text-center">
                          <p className="text-lg font-bold text-emerald-600">
                            {attendance.present}
                          </p>
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            Present
                          </p>
                        </div>
                        <div className="rounded-lg bg-destructive/10 p-3 text-center">
                          <p className="text-lg font-bold text-destructive">
                            {attendance.absent}
                          </p>
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            Absent
                          </p>
                        </div>
                        <div className="rounded-lg bg-amber-500/10 p-3 text-center">
                          <p className="text-lg font-bold text-amber-600">
                            {attendance.late}
                          </p>
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            Late
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No attendance summary available yet.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Recent Attendance History
                  </CardTitle>
                  <CardDescription>
                    {attendance
                      ? `Last ${attendance.records.length} records`
                      : "Attendance records"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {attendance && attendance.records.length > 0 ? (
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
                          {attendance.records.map((record) => (
                            <TableRow key={record._id}>
                              <TableCell className="font-medium">
                                {new Date(record.date).toLocaleDateString(
                                  "en-US",
                                  {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {sectionLabelFor(record.section)}
                              </TableCell>
                              <TableCell>
                                {(record.status === "present" ||
                                  record.status ===
                                    ("present" as AttendanceStatus)) && (
                                  <Badge className="bg-emerald-500 text-white gap-1">
                                    <CheckCircle2 className="h-3 w-3" />{" "}
                                    Present
                                  </Badge>
                                )}
                                {record.status === "absent" && (
                                  <Badge
                                    variant="destructive"
                                    className="gap-1"
                                  >
                                    <XCircle className="h-3 w-3" /> Absent
                                  </Badge>
                                )}
                                {(record.status === "late" ||
                                  record.status ===
                                    ("late" as AttendanceStatus)) && (
                                  <Badge className="bg-amber-500 text-white gap-1">
                                    <Clock className="h-3 w-3" /> Late
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {record.scannedAt || record.markedAt
                                  ? new Date(
                                      record.scannedAt ?? record.markedAt!
                                    ).toLocaleTimeString()
                                  : "—"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <ClipboardCheck className="h-10 w-10 text-muted-foreground/50" />
                      <p className="mt-3 text-sm font-medium text-muted-foreground">
                        No attendance records yet
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {user.role === UserRole.teacher && (
            <>
              <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard
                  label="Total Scans"
                  value={presence?.total ?? 0}
                  icon={ClipboardCheck}
                  accent="primary"
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Recent Classroom Presence
                  </CardTitle>
                  <CardDescription>
                    Teacher check-ins for assigned sections
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {presence && presence.records.length > 0 ? (
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
                          {presence.records.map((record) => (
                            <TableRow key={record._id}>
                              <TableCell className="font-medium">
                                {new Date(record.date).toLocaleDateString(
                                  "en-US",
                                  {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {sectionLabelFor(record.section)}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="secondary"
                                  className="bg-chart-3/10 text-chart-3"
                                >
                                  {typeof record.period === "object" &&
                                  record.period !== null &&
                                  "periodNumber" in record.period
                                    ? `P${record.period.periodNumber}`
                                    : "—"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">
                                {record.enteredAt
                                  ? new Date(
                                      record.enteredAt
                                    ).toLocaleTimeString()
                                  : "—"}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {record.exitedAt
                                  ? new Date(
                                      record.exitedAt
                                    ).toLocaleTimeString()
                                  : "—"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <ClipboardCheck className="h-10 w-10 text-muted-foreground/50" />
                      <p className="mt-3 text-sm font-medium text-muted-foreground">
                        No presence records yet
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {user.role === UserRole.admin && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <UserIcon className="h-12 w-12 text-primary/40" />
                <h3 className="mt-4 text-lg font-semibold">
                  Administrator Account
                </h3>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  This is an administrator account with full access to manage
                  the school system. Admins can manage users, classes,
                  sections, timetable, attendance, notices, and more.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </section>
  );
}
