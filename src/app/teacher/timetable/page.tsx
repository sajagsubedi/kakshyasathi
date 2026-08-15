'use client';

import { CalendarDays } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { teacherNav } from '@/lib/nav';
import { useTeacherTimetable, useSharedLookup, dayNames } from '@/hooks/useApi';

export default function TeacherTimetablePage() {
  const { data: timetable = [] } = useTeacherTimetable();
  const { data: lookup } = useSharedLookup();
  const getSectionName = lookup?.getSectionName ?? ((id: string) => id);
  const getSubjectName = lookup?.getSubjectName ?? ((id: string) => id);
  const getPeriod = lookup?.getPeriod ?? (() => undefined);
  const periods = lookup?.periods ?? [];

  return (
    <DashboardLayout items={teacherNav} title="Kakshyasathi" subtitle="Teacher Portal" pageTitle="Timetable" pageDescription="Your weekly teaching schedule" allowedRoles={['TEACHER']}>
      <PageHeader title="My Timetable" description="Weekly schedule across all assigned sections" />
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><CalendarDays className="h-4 w-4" />Weekly Schedule</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {dayNames.map((day, dayIdx) => {
            const dayEntries = timetable.filter((t) => t.dayOfWeek === dayIdx);
            if (!dayEntries.length) return null;
            return (
              <div key={day}>
                <p className="mb-2 text-sm font-semibold">{day}</p>
                <div className="space-y-2">
                  {dayEntries.map((entry) => {
                    const period = getPeriod(entry.periodId);
                    return (
                      <div key={entry.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                        <div>
                          <p className="text-sm font-medium">{getSubjectName(entry.subjectId)}</p>
                          <p className="text-xs text-muted-foreground">{getSectionName(entry.sectionId)}</p>
                        </div>
                        <Badge variant="outline">P{period?.periodNumber ?? '?'} · {period?.startTime}-{period?.endTime}</Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {!timetable.length && <p className="text-sm text-muted-foreground">No timetable entries assigned yet</p>}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
