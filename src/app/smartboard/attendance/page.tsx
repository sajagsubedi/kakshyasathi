'use client';

import * as React from 'react';
import { CheckCircle2, XCircle, Users, Clock, Calendar, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/shared/StatCard';
import { useSmartboardAttendance, useSmartboardClassroom, useSharedLookup } from '@/hooks/useApi';

export default function SmartBoardAttendancePage() {
  const { data: attendance = [] } = useSmartboardAttendance();
  const { data: classroom } = useSmartboardClassroom();
  const { data: lookup } = useSharedLookup();
  const users = lookup?.users ?? [];

  const attendanceStats = React.useMemo(() => {
    const present = attendance.filter((a) => a.status === 'PRESENT').length;
    const absent = attendance.filter((a) => a.status === 'ABSENT').length;
    const late = attendance.filter((a) => a.status === 'LATE').length;
    const total = attendance.length;
    const presentPercentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return { present, absent, late, total, presentPercentage };
  }, [attendance]);

  const summary = classroom?.attendanceSummary;

  return (
    <section>
      <PageHeader 
        title="Attendance Summary" 
        description="Today's attendance overview"
      />
      
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Students"
          value={summary?.total || attendanceStats.total}
          icon={Users}
          accent="primary"
        />
        <StatCard
          label="Present"
          value={summary?.present || attendanceStats.present}
          icon={CheckCircle2}
          accent="success"
        />
        <StatCard
          label="Absent"
          value={attendanceStats.absent}
          icon={XCircle}
          accent="destructive"
        />
        <StatCard
          label="Attendance Rate"
          value={`${attendanceStats.presentPercentage}%`}
          icon={Clock}
          accent="chart-2"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attendance Details</CardTitle>
            <CardDescription>Recent attendance records</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {attendance.length > 0 ? (
              attendance.slice(0, 10).map((record) => {
                const student = users.find((u) => u.id === record.studentId);
                return (
                  <div key={record.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{student?.fullName || record.studentId}</p>
                      {record.scannedAt && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(record.scannedAt).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                    <Badge 
                      className={record.status === 'PRESENT' ? 'bg-emerald-500 text-white' : ''}
                      variant={record.status === 'ABSENT' ? 'destructive' : 'default'}
                    >
                      {record.status === 'PRESENT' ? <CheckCircle2 className="mr-1 h-3 w-3" /> : 
                       record.status === 'ABSENT' ? <XCircle className="mr-1 h-3 w-3" /> :
                       <Clock className="mr-1 h-3 w-3" />}
                      {record.status}
                    </Badge>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No attendance records yet today</p>
                <p className="text-xs text-muted-foreground mt-1">Attendance is recorded via terminal scanning</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Statistics</CardTitle>
            <CardDescription>Attendance breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Present</span>
                <span className="font-medium">{attendanceStats.present} students</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all" 
                  style={{ width: `${attendanceStats.presentPercentage}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Absent</span>
                <span className="font-medium">{attendanceStats.absent} students</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full bg-red-500 transition-all" 
                  style={{ width: `${attendanceStats.total > 0 ? (attendanceStats.absent / attendanceStats.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            {attendanceStats.late > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Late</span>
                  <span className="font-medium">{attendanceStats.late} students</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 transition-all" 
                    style={{ width: `${attendanceStats.total > 0 ? (attendanceStats.late / attendanceStats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
