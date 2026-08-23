'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  timetable,
  sections,
  periods,
  getSectionName,
  getSubjectName,
  getTeacherName,
  dayNames,
} from '@/lib/mock-data';

export default function AdminTimetablePage() {
  const [selectedSection, setSelectedSection] = React.useState(sections[0]?.id ?? '');

  const sectionTimetable = timetable.filter((t) => t.sectionId === selectedSection);

  const getEntry = (day: number, periodId: string) =>
    sectionTimetable.find((t) => t.dayOfWeek === day && t.periodId === periodId);

  return (
    <section

    >
      <PageHeader
        title="Section Timetable"
        description="Weekly schedule for each section"
        action={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Entry
          </Button>
        }
      />

      {/* SECTION SELECTOR */}
      <div className="mb-4">
        <Select value={selectedSection} onValueChange={setSelectedSection}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Select section" />
          </SelectTrigger>
          <SelectContent>
            {sections.map((sec) => (
              <SelectItem key={sec.id} value={sec.id}>
                {getSectionName(sec.id)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* TIMETABLE GRID */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base">
            {getSectionName(selectedSection)}
          </CardTitle>
          <CardDescription>Weekly schedule</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="sticky left-0 z-10 bg-card px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Period
                </th>
                {dayNames.slice(0, 6).map((day) => (
                  <th
                    key={day}
                    className="px-3 py-3 text-center text-xs font-medium text-muted-foreground"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map((period) => (
                <tr key={period.id} className="border-b border-border last:border-0">
                  <td className="sticky left-0 z-10 bg-card px-4 py-3">
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        Period {period.periodNumber}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {period.startTime} – {period.endTime}
                      </p>
                    </div>
                  </td>
                  {dayNames.slice(0, 6).map((_, dayIdx) => {
                    const entry = getEntry(dayIdx, period.id);
                    if (!entry) {
                      return (
                        <td key={dayIdx} className="px-3 py-3">
                          <div className="flex h-full min-h-[60px] items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
                            Free
                          </div>
                        </td>
                      );
                    }
                    return (
                      <td key={dayIdx} className="px-3 py-3">
                        <div className="rounded-lg border border-border bg-accent/50 p-2">
                          <p className="text-xs font-semibold text-accent-foreground">
                            {getSubjectName(entry.subjectId)}
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {getTeacherName(entry.teacherId)}
                          </p>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </section>
  );
}
