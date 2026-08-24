'use client';

import { CalendarClock } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { smartBoardNav } from '@/lib/nav';
import { useSmartboardTimetable } from '@/hooks/useApi';

export default function SmartBoardTimetablePage() {
  const { data: periods = [] } = useSmartboardTimetable();

  return (
    <section>
      <PageHeader title="Effective Timetable" description="Today's schedule with substitutions and time overrides" />
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><CalendarClock className="h-4 w-4" />All Periods</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {periods.map((period) => (
            <div key={period.periodId} className="flex items-center justify-between rounded-lg border px-4 py-3">
              <div>
                <p className="font-medium">Period {period.periodNumber} · {period.subjectName}</p>
                <p className="text-sm text-muted-foreground">{period.teacherName}{period.isSubstitute ? ' (Substitute)' : ''}</p>
              </div>
              <div className="text-right">
                <Badge variant="outline">{period.startTime} – {period.endTime}</Badge>
                {period.isSubstitute && <Badge className="ml-2 bg-amber-500/10 text-amber-600">Sub</Badge>}
              </div>
            </div>
          ))}
          {!periods.length && <p className="text-sm text-muted-foreground">No timetable configured</p>}
        </CardContent>
      </Card>
    </section>
  );
}
