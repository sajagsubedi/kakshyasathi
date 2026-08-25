'use client';

import * as React from 'react';
import { CalendarClock, Clock, BookOpen, User, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSmartboardTimetable } from '@/hooks/useApi';
import { DayOfWeek } from '@/types';

const dayOrder = [DayOfWeek.monday, DayOfWeek.tuesday, DayOfWeek.wednesday, DayOfWeek.thursday, DayOfWeek.friday, DayOfWeek.saturday];
const dayNames = {
  [DayOfWeek.monday]: 'Monday',
  [DayOfWeek.tuesday]: 'Tuesday',
  [DayOfWeek.wednesday]: 'Wednesday',
  [DayOfWeek.thursday]: 'Thursday',
  [DayOfWeek.friday]: 'Friday',
  [DayOfWeek.saturday]: 'Saturday',
  [DayOfWeek.sunday]: 'Sunday',
};

export default function SmartBoardTimetablePage() {
  const { data: response } = useSmartboardTimetable();
  const timetable = response?.timetable || [];
  const holidays = response?.holidays || [];
  const weeklyOffDays = response?.weeklyOffDays || [];

  // Group timetable by day of week
  const timetableByDay = React.useMemo(() => {
    const grouped: Record<string, any[]> = {};
    dayOrder.forEach(day => {
      grouped[day] = [];
    });
    
    timetable.forEach((entry: any) => {
      if (grouped[entry.dayOfWeek]) {
        grouped[entry.dayOfWeek].push(entry);
      }
    });

    // Sort each day by period number
    Object.keys(grouped).forEach(day => {
      grouped[day].sort((a, b) => a.periodNumber - b.periodNumber);
    });

    return grouped;
  }, [timetable]);

  // Get max period number for table columns
  const maxPeriod = React.useMemo(() => {
    let max = 0;
    timetable.forEach((entry: any) => {
      if (entry.periodNumber > max) max = entry.periodNumber;
    });
    return max;
  }, [timetable]);

  return (
    <section>
      <PageHeader 
        title="Weekly Timetable" 
        description="Complete timetable for the academic year"
      />
      
      {weeklyOffDays.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              Weekly Off Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {weeklyOffDays.map((day: string) => (
                <Badge key={day} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  {dayNames[day as DayOfWeek] || day}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            Class Timetable
          </CardTitle>
          <CardDescription>
            {timetable.length} periods scheduled across the week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left font-medium text-sm bg-muted/50">Day</th>
                  {Array.from({ length: maxPeriod }, (_, i) => (
                    <th key={i + 1} className="p-3 text-center font-medium text-sm bg-muted/50 min-w-[120px]">
                      Period {i + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dayOrder.map((day) => {
                  const dayEntries = timetableByDay[day] || [];
                  if (weeklyOffDays.includes(day)) {
                    return (
                      <tr key={day} className="border-b bg-amber-50/50">
                        <td className="p-3 font-medium text-sm">
                          {dayNames[day]}
                          <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-700 border-amber-200 text-xs">
                            Off
                          </Badge>
                        </td>
                        {Array.from({ length: maxPeriod }, (_, i) => (
                          <td key={i + 1} className="p-3 text-center text-sm text-muted-foreground">
                            —
                          </td>
                        ))}
                      </tr>
                    );
                  }
                  
                  return (
                    <tr key={day} className="border-b hover:bg-muted/30">
                      <td className="p-3 font-medium text-sm">{dayNames[day]}</td>
                      {Array.from({ length: maxPeriod }, (_, i) => {
                        const entry = dayEntries.find((e: any) => e.periodNumber === i + 1);
                        if (!entry) {
                          return (
                            <td key={i + 1} className="p-3 text-center text-sm text-muted-foreground">
                              —
                            </td>
                          );
                        }
                        
                        return (
                          <td key={i + 1} className="p-3 text-center">
                            <div className="space-y-1">
                              <div className="flex items-center justify-center gap-1 text-sm font-medium">
                                <BookOpen className="h-3 w-3 text-muted-foreground" />
                                {entry.subjectName}
                              </div>
                              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                                <User className="h-3 w-3" />
                                {entry.teacherName}
                              </div>
                              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {entry.startTime} – {entry.endTime}
                              </div>
                              {entry.isCustomTiming && (
                                <Badge variant="outline" className="text-xs mt-1">
                                  Custom
                                </Badge>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {timetable.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No timetable configured</p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
