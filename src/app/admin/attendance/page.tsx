'use client';

import * as React from 'react';
import {
  Calendar,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';

import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  studentAttendance,
  users,
  sections,
  getSectionName,
} from '@/lib/mock-data';

export default function AdminAttendancePage() {
  const [sectionFilter, setSectionFilter] = React.useState('ALL');

  const filtered =
    sectionFilter === 'ALL'
      ? studentAttendance
      : studentAttendance.filter((a) => a.sectionId === sectionFilter);

  const present = filtered.filter((a) => a.status === 'PRESENT').length;
  const absent = filtered.filter((a) => a.status === 'ABSENT').length;
  const late = filtered.filter((a) => a.status === 'LATE').length;

  const statusBadge = (status: string) => {
    if (status === 'PRESENT')
      return (
        <Badge className="bg-emerald-500 text-white hover:bg-emerald-500">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Present
        </Badge>
      );
    if (status === 'ABSENT')
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-3 w-3" />
          Absent
        </Badge>
      );
    return (
      <Badge className="bg-amber-500 text-white hover:bg-amber-500">
        <Clock className="mr-1 h-3 w-3" />
        Late
      </Badge>
    );
  };

  return (
    <section
    >
      <PageHeader
        title="Attendance Records"
        description="Daily attendance for all sections"
        action={
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        }
      />

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Present"
          value={present}
          icon={CheckCircle2}
          accent="success"
        />
        <StatCard
          label="Late"
          value={late}
          icon={Clock}
          accent="warning"
        />
        <StatCard
          label="Absent"
          value={absent}
          icon={XCircle}
          accent="destructive"
        />
      </div>

      {/* FILTER */}
      <div className="mt-4 flex items-center gap-3">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">August 15, 2026</span>
        <div className="ml-auto">
          <Select value={sectionFilter} onValueChange={setSectionFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Sections</SelectItem>
              {sections.map((sec) => (
                <SelectItem key={sec.id} value={sec.id}>
                  {getSectionName(sec.id)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* TABLE */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Student Attendance</CardTitle>
          <CardDescription>{filtered.length} records for today</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Roll No.</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Scan Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((record) => {
                const student = users.find((u) => u.id === record.studentId);
                if (!student) return null;
                return (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-xs text-primary">
                            {student.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{student.fullName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {student.rollNumber}
                    </TableCell>
                    <TableCell className="text-sm">{getSectionName(record.sectionId)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {record.scannedAt
                        ? new Date(record.scannedAt).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })
                        : '—'}
                    </TableCell>
                    <TableCell>{statusBadge(record.status)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
