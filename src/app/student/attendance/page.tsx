'use client';

import { ClipboardCheck, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { studentNav } from '@/lib/nav';
import { useStudentAttendance, useStudentProfile, useSharedLookup } from '@/hooks/useApi';

export default function StudentAttendancePage() {
  const { data: attendance = [] } = useStudentAttendance();
  const { data: profile } = useStudentProfile();
  const { data: lookup } = useSharedLookup();
  const getSectionName = lookup?.getSectionName ?? ((id: string) => id);

  const present = attendance.filter((a) => a.status === 'PRESENT').length;
  const absent = attendance.filter((a) => a.status === 'ABSENT').length;
  const late = attendance.filter((a) => a.status === 'LATE').length;
  const rate = attendance.length ? Math.round((present / attendance.length) * 100) : 0;

  return (
    <DashboardLayout items={studentNav} title="Kakshyasathi" subtitle="Student Portal" pageTitle="Attendance" pageDescription="Your attendance history" allowedRoles={['STUDENT']}>
      <PageHeader title="My Attendance" description={profile?.sectionId ? getSectionName(profile.sectionId) : 'Your section'} />
      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Rate" value={`${rate}%`} icon={ClipboardCheck} accent="success" />
        <StatCard label="Present" value={present} icon={CheckCircle2} accent="primary" />
        <StatCard label="Absent" value={absent} icon={XCircle} accent="destructive" />
        <StatCard label="Late" value={late} icon={Clock} accent="warning" />
      </div>
      <Progress value={rate} className="mb-6 h-2" />
      <Card>
        <CardHeader><CardTitle className="text-base">Attendance History</CardTitle></CardHeader>
        <Table>
          <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead>Scanned At</TableHead></TableRow></TableHeader>
          <TableBody>
            {attendance.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="text-sm">{record.date}</TableCell>
                <TableCell><Badge variant={record.status === 'ABSENT' ? 'destructive' : 'secondary'}>{record.status}</Badge></TableCell>
                <TableCell className="text-sm text-muted-foreground">{record.scannedAt ? new Date(record.scannedAt).toLocaleTimeString() : '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!attendance.length && <CardContent className="py-8 text-center text-sm text-muted-foreground">No attendance records yet</CardContent>}
      </Card>
    </DashboardLayout>
  );
}
