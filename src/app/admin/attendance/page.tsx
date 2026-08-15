"use client";

import * as React from "react";
import {
  ClipboardCheck,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminNav } from "@/lib/nav";
import {
  useAdminAttendance,
  useAdminSections,
  useSharedLookup,
} from "@/hooks/useApi";

export default function AdminAttendancePage() {
  const [sectionFilter, setSectionFilter] = React.useState<string | null>(
    "ALL",
  );
  const { data: sections = [] } = useAdminSections();
  const { data: attendance = [] } = useAdminAttendance(
    sectionFilter === "ALL" || !sectionFilter ? undefined : sectionFilter,
  );
  const { data: lookup } = useSharedLookup();
  const users = lookup?.users ?? [];
  const getSectionName = lookup?.getSectionName ?? ((id: string) => id);

  const present = attendance.filter((a) => a.status === "PRESENT").length;
  const absent = attendance.filter((a) => a.status === "ABSENT").length;
  const late = attendance.filter((a) => a.status === "LATE").length;

  const statusBadge = (status: string) => {
    if (status === "PRESENT")
      return (
        <Badge className="bg-emerald-500 text-white">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Present
        </Badge>
      );
    if (status === "LATE")
      return (
        <Badge className="bg-amber-500 text-white">
          <Clock className="mr-1 h-3 w-3" />
          Late
        </Badge>
      );
    return (
      <Badge variant="destructive">
        <XCircle className="mr-1 h-3 w-3" />
        Absent
      </Badge>
    );
  };

  return (
    <DashboardLayout
      items={adminNav}
      title="Kakshyasathi"
      subtitle="Admin Portal"
      pageTitle="Attendance"
      pageDescription="View and manage student attendance"
      allowedRoles={["ADMIN"]}
    >
      <PageHeader
        title="Attendance Records"
        description="Daily student attendance across sections"
        action={
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        }
      />
      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Present"
          value={present}
          icon={CheckCircle2}
          accent="success"
        />
        <StatCard
          label="Absent"
          value={absent}
          icon={XCircle}
          accent="destructive"
        />
        <StatCard label="Late" value={late} icon={Clock} accent="warning" />
        <StatCard
          label="Total"
          value={attendance.length}
          icon={ClipboardCheck}
          accent="primary"
        />
      </div>
      <Select
        value={sectionFilter ?? "ALL"}
        onValueChange={(value) => setSectionFilter(value ?? "ALL")}
      >
        <SelectTrigger className="mb-4 w-full sm:w-56">
          <SelectValue placeholder="Filter section" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Sections</SelectItem>
          {sections.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {getSectionName(s.id)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Today&apos;s Records</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Scanned At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendance.map((record) => {
              const student = users.find((u) => u.id === record.studentId);
              return (
                <TableRow key={record.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-xs">
                          {student?.fullName?.slice(0, 2) ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">
                        {student?.fullName ?? record.studentId}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {getSectionName(record.sectionId)}
                  </TableCell>
                  <TableCell>{statusBadge(record.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {record.scannedAt
                      ? new Date(record.scannedAt).toLocaleTimeString()
                      : "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </DashboardLayout>
  );
}
