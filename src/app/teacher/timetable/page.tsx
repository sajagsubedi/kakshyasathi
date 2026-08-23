'use client';

import * as React from 'react';
import { CalendarDays, DoorOpen, GraduationCap, Clock, BookOpen } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTeacherTimetable, dayNames } from '@/hooks/useApi';

export default function TeacherTimetablePage() {
  const { data: timetable = [], isLoading } = useTeacherTimetable();
  const todayDayIdx = new Date().getDay();
  const [selectedDay, setSelectedDay] = React.useState<number | 'all'>(todayDayIdx);

  const filteredEntries = React.useMemo(() => {
    if (selectedDay === 'all') {
      return [...timetable].sort((a, b) => {
        if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
        return a.periodNumber - b.periodNumber;
      });
    }
    return timetable
      .filter((t) => t.dayOfWeek === selectedDay)
      .sort((a, b) => a.periodNumber - b.periodNumber);
  }, [timetable, selectedDay]);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Faculty Timetable"
        description="Weekly teaching schedule across all assigned classes and sections"
      />

      {/* Day Selector Pills */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-card/60 p-1.5">
        <Button
          variant={selectedDay === 'all' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedDay('all')}
          className="text-xs"
        >
          All Days
        </Button>
        {dayNames.map((day, idx) => {
          const isToday = idx === todayDayIdx;
          const isSelected = selectedDay === idx;
          const count = timetable.filter((t) => t.dayOfWeek === idx).length;
          return (
            <Button
              key={day}
              variant={isSelected ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedDay(idx)}
              className="text-xs gap-1.5"
            >
              <span>{day}</span>
              {isToday && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              )}
              {count > 0 && (
                <span className="text-[10px] opacity-70">({count})</span>
              )}
            </Button>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            {selectedDay === 'all' ? 'Combined Teaching Schedule' : `${dayNames[selectedDay]} Classes`}
          </CardTitle>
          <CardDescription>
            {filteredEntries.length} {filteredEntries.length === 1 ? 'period' : 'periods'} scheduled
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="p-8 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 w-full animate-pulse rounded bg-muted/40" />
              ))}
            </div>
          ) : filteredEntries.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  {selectedDay === 'all' && <TableHead className="w-28">Day</TableHead>}
                  <TableHead className="w-24">Period</TableHead>
                  <TableHead className="w-36">Timing</TableHead>
                  <TableHead>Section / Class</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Classroom</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    {selectedDay === 'all' && (
                      <TableCell className="font-semibold text-xs">
                        <Badge variant="outline">{dayNames[entry.dayOfWeek]}</Badge>
                      </TableCell>
                    )}
                    <TableCell className="font-medium whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold">P{entry.periodNumber}</span>
                        {entry.isCustomTiming && (
                          <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                            Custom
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap font-mono">
                      {entry.startTime ? `${entry.startTime} – ${entry.endTime}` : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold text-sm">{entry.sectionName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-semibold">{entry.subjectName}</p>
                        {entry.subjectCode && (
                          <p className="text-xs font-mono text-muted-foreground">{entry.subjectCode}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {entry.roomNumber ? (
                        <span className="flex items-center gap-1.5">
                          <DoorOpen className="h-3.5 w-3.5 text-primary/70" />
                          Room {entry.roomNumber}
                        </span>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarDays className="h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm font-medium text-muted-foreground">
                No classes scheduled for {selectedDay === 'all' ? 'this week' : dayNames[selectedDay]}.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
