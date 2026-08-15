'use client';

import { Clock } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { teacherNav } from '@/lib/nav';
import { useTeacherPresence, useSharedLookup } from '@/hooks/useApi';

export default function TeacherPresencePage() {
  const { data: presence = [] } = useTeacherPresence();
  const { data: lookup } = useSharedLookup();
  const getSectionName = lookup?.getSectionName ?? ((id: string) => id);
  const getPeriod = lookup?.getPeriod ?? (() => undefined);

  return (
    <DashboardLayout items={teacherNav} title="Kakshyasathi" subtitle="Teacher Portal" pageTitle="Presence" pageDescription="Your classroom presence history" allowedRoles={['TEACHER']}>
      <PageHeader title="Classroom Presence" description="Period-based entry records" />
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" />Presence History</CardTitle></CardHeader>
        <Table>
          <TableHeader>
            <TableRow><TableHead>Date</TableHead><TableHead>Section</TableHead><TableHead>Period</TableHead><TableHead>Entered At</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {presence.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="text-sm">{record.date}</TableCell>
                <TableCell><Badge variant="secondary">{getSectionName(record.sectionId)}</Badge></TableCell>
                <TableCell>P{getPeriod(record.periodId)?.periodNumber ?? '?'}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(record.enteredAt).toLocaleTimeString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!presence.length && <CardContent className="py-8 text-center text-sm text-muted-foreground">No presence records yet</CardContent>}
      </Card>
    </DashboardLayout>
  );
}
