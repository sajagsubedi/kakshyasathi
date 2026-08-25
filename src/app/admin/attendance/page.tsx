"use client";

import * as React from "react";
import {
  ClipboardCheck,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useAdminAttendance } from "@/hooks/admin/useAttendance";
import { useAdminSections } from "@/hooks/admin/useSections";
import { sectionLabel, refId } from "@/lib/adminDisplay";

type AttendanceRecord = {
  _id: string;
  status?: string;
  markedAt?: string;
  scannedAt?: string;
  student?: {
    user?: {
      name?: string;
      username?: string;
    };
  };
  attendanceSession?: {
    section?:
      | string
      | {
          _id: string;
          name?: string;
          class?: { _id: string; name?: string };
        };
  };
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getSectionLabel(
  record: AttendanceRecord,
  sectionsCache: Array<{ _id: string; name?: string; class?: unknown }>
) {
  const section = record.attendanceSession?.section;
  if (!section) return "Unknown Section";
  if (typeof section === "string") {
    const resolved = sectionsCache.find((s) => s._id === refId(section));
    if (resolved) return sectionLabel(resolved);
    return "Unknown Section";
  }
  return sectionLabel(section);
}

export default function AdminAttendancePage() {
  const [sectionFilter, setSectionFilter] = React.useState("ALL");
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const today = new Date();
  
  const formatDateForAPI = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const navigateDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const { data: sectionsData } = useAdminSections({
    page: 1,
    limit: 100,
  });

  const { data: attendanceData } = useAdminAttendance({
    date: formatDateForAPI(selectedDate),
    section: sectionFilter === "ALL" ? undefined : sectionFilter,
    view: "students",
    page: 1,
    limit: 100,
  });

  const sections = sectionsData?.items ?? [];
  const attendance = (attendanceData?.items ?? []) as AttendanceRecord[];

  const present = attendance.filter((r) => r.status === "present").length;
  const absent = attendance.filter((r) => r.status === "absent").length;
  const late = attendance.filter((r) => r.status === "late").length;

  const statusBadge = (status: string) => {
    if (status === "present")
      return (
        <Badge className="bg-emerald-500 text-white">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Present
        </Badge>
      );
    if (status === "late")
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
    <section>
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
      
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateDate(-1)}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateDate(1)}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="h-8"
          >
            Today
          </Button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-background">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{formatDisplayDate(selectedDate)}</span>
          </div>
        </div>
        
        <Select
          value={sectionFilter}
          onValueChange={(value) => setSectionFilter(value || "ALL")}
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Filter section" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Sections</SelectItem>
            {sections.map((s) => (
              <SelectItem key={s._id} value={s._id}>
                {sectionLabel(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {formatDateForAPI(selectedDate) === formatDateForAPI(today) 
              ? "Today's Records" 
              : `Records for ${formatDisplayDate(selectedDate)}`}
          </CardTitle>
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
              const studentName =
                record.student?.user?.name?.trim() || "Unknown Student";
              return (
                <TableRow key={record._id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-xs bg-muted">
                          {getInitials(studentName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="text-sm font-medium">
                          {studentName}
                        </span>
                        {record.student?.user?.username && (
                          <p className="text-[10px] text-muted-foreground">
                            @{record.student.user.username}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {getSectionLabel(record, sections)}
                  </TableCell>
                  <TableCell>{statusBadge(record.status || "absent")}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {record.markedAt || record.scannedAt
                      ? new Date(
                          record.markedAt ?? record.scannedAt!
                        ).toLocaleTimeString()
                      : "—"}
                  </TableCell>
                </TableRow>
              );
            })}

            {attendance.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  No attendance records found for today.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </section>
  );
}
