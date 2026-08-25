'use client';

import * as React from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useStudentAttendance, useStudentProfile } from '@/hooks/useApi';

export default function StudentAttendancePage() {
  const { data: attendance = [], isLoading } = useStudentAttendance();
  const { data: profile } = useStudentProfile();
  const [filter, setFilter] = React.useState<'ALL' | 'PRESENT' | 'LATE' | 'ABSENT'>('ALL');
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const today = new Date();

  const formatDateForAPI = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const navigateDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const attendanceForDate = React.useMemo(() => {
    const selectedDateStr = formatDateForAPI(selectedDate);
    return attendance.filter((a) => {
      const recordDate = new Date(a.date).toISOString().split("T")[0];
      return recordDate === selectedDateStr;
    });
  }, [attendance, selectedDate]);

  const present = attendanceForDate.filter((a) => a.status === 'PRESENT').length;
  const late = attendanceForDate.filter((a) => a.status === 'LATE').length;
  const absent = attendanceForDate.filter((a) => a.status === 'ABSENT').length;
  const total = attendanceForDate.length;
  const rate = total ? Math.round(((present + late) / total) * 100) : 0;

  const filteredAttendance = React.useMemo(() => {
    if (filter === 'ALL') return attendanceForDate;
    return attendanceForDate.filter((a) => a.status === filter);
  }, [attendanceForDate, filter]);

  return (
    <section className="space-y-6">
      <PageHeader
        title="My Attendance"
        description={
          profile?.className
            ? `${profile.className} · Section ${profile.sectionName} · Roll #${profile.rollNumber || '—'}`
            : 'Personal attendance records and scan history'
        }
      />

      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateDate(-1)}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateDate(1)}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="h-8"
          >
            Today
          </Button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-background">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{formatDisplayDate(selectedDate)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Attendance Rate"
          value={`${rate}%`}
          icon={ClipboardCheck}
          accent="success"
          trend={`${present + late} of ${total} sessions`}
          trendUp={rate >= 75}
        />
        <StatCard label="Present Days" value={present} icon={CheckCircle2} accent="primary" />
        <StatCard label="Late Days" value={late} icon={Clock} accent="chart-3" />
        <StatCard label="Absent Days" value={absent} icon={XCircle} accent="destructive" />
      </div>

      <Card className="border-border bg-card/60 p-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-medium text-muted-foreground">Semester Attendance Goal (Target: 75%+)</span>
          <span className="font-semibold text-foreground">{rate}%</span>
        </div>
        <Progress value={rate} className="h-2.5" />
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Attendance Log
              </CardTitle>
              <CardDescription>
                {formatDateForAPI(selectedDate) === formatDateForAPI(today) 
                  ? `Showing ${filteredAttendance.length} of ${attendance.length} logged sessions`
                  : `Showing ${filteredAttendance.length} records for ${formatDisplayDate(selectedDate)}`
                }
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-1">
              <Button
                variant={filter === 'ALL' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('ALL')}
                className="text-xs h-8"
              >
                All ({attendanceForDate.length})
              </Button>
              <Button
                variant={filter === 'PRESENT' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('PRESENT')}
                className="text-xs h-8 text-emerald-600 hover:text-emerald-700"
              >
                Present ({present})
              </Button>
              <Button
                variant={filter === 'LATE' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('LATE')}
                className="text-xs h-8 text-amber-600 hover:text-amber-700"
              >
                Late ({late})
              </Button>
              <Button
                variant={filter === 'ABSENT' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('ABSENT')}
                className="text-xs h-8 text-destructive hover:text-destructive"
              >
                Absent ({absent})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="p-8 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 w-full animate-pulse rounded bg-muted/40" />
              ))}
            </div>
          ) : filteredAttendance.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Scanned At (RTC)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="text-sm font-semibold whitespace-nowrap">
                      {new Date(record.date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      {record.status === 'PRESENT' && (
                        <Badge className="bg-emerald-500 text-white font-medium gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Present
                        </Badge>
                      )}
                      {record.status === 'LATE' && (
                        <Badge className="bg-amber-500 text-white font-medium gap-1">
                          <Clock className="h-3 w-3" /> Late
                        </Badge>
                      )}
                      {record.status === 'ABSENT' && (
                        <Badge variant="destructive" className="font-medium gap-1">
                          <XCircle className="h-3 w-3" /> Absent
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {record.periodNumber ? `Period ${record.periodNumber}` : 'General Session'}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                      {record.scannedAt ? new Date(record.scannedAt).toLocaleTimeString() : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ClipboardCheck className="h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm font-medium text-muted-foreground">
                {formatDateForAPI(selectedDate) === formatDateForAPI(today)
                  ? 'No attendance records found for today.'
                  : `No attendance records found for ${formatDisplayDate(selectedDate)}.`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
