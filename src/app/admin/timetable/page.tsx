'use client';

import * as React from 'react';
import { CalendarDays, Plus } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminNav } from '@/lib/nav';
import { useAdminTimetable, useAdminPeriods, useAdminSections, useSharedLookup, dayNames } from '@/hooks/useApi';

export default function AdminTimetablePage() {
  const { data: sections = [] } = useAdminSections();
  const [selectedSection, setSelectedSection] = React.useState<string | null>('');
  React.useEffect(() => {
    if (sections[0] && !selectedSection) setSelectedSection(sections[0].id);
  }, [sections, selectedSection]);

  const { data: timetable = [] } = useAdminTimetable(selectedSection || undefined);
  const { data: periods = [] } = useAdminPeriods();
  const { data: lookup } = useSharedLookup();

  const getSubjectName = lookup?.getSubjectName ?? ((id: string) => id);
  const getTeacherName = lookup?.getTeacherName ?? ((id: string) => id);
  const getSectionName = lookup?.getSectionName ?? ((id: string) => id);

  const getEntry = (day: number, periodId: string) =>
    timetable.find((t) => t.dayOfWeek === day && t.periodId === periodId);

  return (
    <DashboardLayout items={adminNav} title="Kakshyasathi" subtitle="Admin Portal" pageTitle="Timetable" pageDescription="Manage section timetables" allowedRoles={['ADMIN']}>
      <PageHeader title="Section Timetable" description={selectedSection ? getSectionName(selectedSection) : 'Select a section'} action={<Button><Plus className="mr-2 h-4 w-4" />Add Entry</Button>} />
      <div className="mb-4">
        <Select value={selectedSection ?? ''} onValueChange={(value) => setSelectedSection(value ?? '')}>
          <SelectTrigger className="w-full sm:w-64"><SelectValue placeholder="Select section" /></SelectTrigger>
          <SelectContent>
            {sections.map((s) => (<SelectItem key={s.id} value={s.id}>{getSectionName(s.id)}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Weekly Schedule</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left">Period</th>
                {dayNames.map((d) => (<th key={d} className="p-2 text-left">{d}</th>))}
              </tr>
            </thead>
            <tbody>
              {periods.map((period) => (
                <tr key={period.id} className="border-b">
                  <td className="p-2 font-medium">P{period.periodNumber}<br /><span className="text-xs text-muted-foreground">{period.startTime}-{period.endTime}</span></td>
                  {dayNames.map((_, day) => {
                    const entry = getEntry(day, period.id);
                    return (
                      <td key={day} className="p-2">
                        {entry ? (
                          <div className="rounded-lg border bg-muted/30 p-2">
                            <p className="text-xs font-medium">{getSubjectName(entry.subjectId)}</p>
                            <p className="text-[11px] text-muted-foreground">{getTeacherName(entry.teacherId)}</p>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">Free</Badge>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
