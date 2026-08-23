'use client';

import * as React from 'react';
import { Clock, DoorOpen, CheckCircle2, Calendar, Building2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTeacherPresence } from '@/hooks/useApi';

export default function TeacherPresencePage() {
  const { data: presence = [], isLoading } = useTeacherPresence();

  return (
    <section className="space-y-6">
      <PageHeader
        title="Classroom Presence Logs"
        description="Automated presence verification records captured by classroom attendance terminals"
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Terminal Check-in History
          </CardTitle>
          <CardDescription>
            {presence.length} presence {presence.length === 1 ? 'record' : 'records'} logged
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="p-8 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 w-full animate-pulse rounded bg-muted/40" />
              ))}
            </div>
          ) : presence.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Section / Class</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Classroom</TableHead>
                  <TableHead>Entered At (RTC)</TableHead>
                  <TableHead>Exited At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {presence.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="text-sm font-semibold whitespace-nowrap">
                      {record.date ? new Date(record.date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      }) : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-medium text-xs">
                        {record.sectionName || `Section (${record.sectionId})`}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-xs whitespace-nowrap">
                      P{record.periodNumber}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {record.roomNumber ? (
                        <span className="flex items-center gap-1.5">
                          <DoorOpen className="h-3.5 w-3.5 text-primary/70" />
                          Room {record.roomNumber}
                        </span>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                      {record.enteredAt ? new Date(record.enteredAt).toLocaleTimeString() : '—'}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                      {record.exitedAt ? new Date(record.exitedAt).toLocaleTimeString() : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm font-medium text-muted-foreground">No presence logs recorded yet.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Presence is automatically verified when scanning your teacher card at the classroom attendance terminal.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
