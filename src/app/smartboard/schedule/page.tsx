'use client';

import * as React from 'react';
import { CalendarClock, BookOpen, User, Clock, AlertCircle, DoorOpen, Wifi, Monitor } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSmartboardSchedule, useSmartboardClassroom } from '@/hooks/useApi';

export default function SmartBoardSchedulePage() {
  const { data: scheduleData } = useSmartboardSchedule();
  const { data: classroom } = useSmartboardClassroom();
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timeStr = currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
  const dateStr = currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (!scheduleData) {
    return (
      <section>
        <PageHeader title="Today's Schedule" description="Loading..." />
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Loading schedule...
          </CardContent>
        </Card>
      </section>
    );
  }

  if (scheduleData.isHoliday) {
    return (
      <section>
        <PageHeader title="Today's Schedule" description="Holiday" />
        <div className="mb-6 flex items-center justify-between rounded-2xl border bg-card p-6">
          <div><p className="text-4xl font-bold tabular-nums">{timeStr}</p><p className="text-sm text-muted-foreground">{dateStr}</p></div>
          <Badge className="bg-emerald-500 text-white"><Wifi className="mr-1 h-3 w-3" />ONLINE</Badge>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="h-5 w-5" />
              Holiday Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{scheduleData.holidayTitle}</p>
            <p className="text-sm text-muted-foreground mt-2">No classes scheduled for today.</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (scheduleData.isWeeklyOff) {
    return (
      <section>
        <PageHeader title="Today's Schedule" description="Weekly Off" />
        <div className="mb-6 flex items-center justify-between rounded-2xl border bg-card p-6">
          <div><p className="text-4xl font-bold tabular-nums">{timeStr}</p><p className="text-sm text-muted-foreground">{dateStr}</p></div>
          <Badge className="bg-emerald-500 text-white"><Wifi className="mr-1 h-3 w-3" />ONLINE</Badge>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="h-5 w-5" />
              Weekly Off Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium capitalize">{scheduleData.weeklyOffDay}</p>
            <p className="text-sm text-muted-foreground mt-2">No classes scheduled for today.</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  const schedule = scheduleData.schedule || [];
  const currentPeriod = classroom?.currentPeriod;
  const nextPeriod = classroom?.nextPeriod;

  const getCurrentStatus = (period: any) => {
    if (!period.startTime || !period.endTime) return 'upcoming';
    
    const now = currentTime;
    const [startHours, startMins] = period.startTime.split(':').map(Number);
    const [endHours, endMins] = period.endTime.split(':').map(Number);
    
    const startTime = new Date(now);
    startTime.setHours(startHours, startMins, 0, 0);
    
    const endTime = new Date(now);
    endTime.setHours(endHours, endMins, 0, 0);
    
    if (now >= startTime && now < endTime) return 'current';
    if (now < startTime) return 'upcoming';
    return 'completed';
  };

  return (
    <section>
      <PageHeader 
        title="Today's Schedule" 
        description={classroom?.sectionName || scheduleData.date ? new Date(scheduleData?.date as string).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}
      />
      
      <div className="mb-6 flex items-center justify-between rounded-2xl border bg-card p-6">
        <div><p className="text-4xl font-bold tabular-nums">{timeStr}</p><p className="text-sm text-muted-foreground">{dateStr}</p></div>
        <Badge className="bg-emerald-500 text-white"><Wifi className="mr-1 h-3 w-3" />ONLINE</Badge>
      </div>

      {/* Current/Next Period Info */}
      {(currentPeriod || nextPeriod) && (
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          {currentPeriod && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-primary" />
                  Current Period
                </CardTitle>
                <CardDescription>Live classroom session</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white font-bold text-lg">
                      P{currentPeriod.periodNumber}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{currentPeriod.subjectName}</p>
                      <p className="text-sm text-muted-foreground">{currentPeriod.teacherName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono">{currentPeriod.startTime} – {currentPeriod.endTime}</span>
                  </div>
                  {currentPeriod.isSubstitute && (
                    <Badge className="bg-amber-500/10 text-amber-600 text-xs">Substitute Teacher</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {nextPeriod && !currentPeriod && (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600" />
                  Next Period
                </CardTitle>
                <CardDescription>Upcoming class</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-700 font-bold text-lg">
                      P{nextPeriod.periodNumber}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{nextPeriod.subjectName}</p>
                      <p className="text-sm text-muted-foreground">{nextPeriod.teacherName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono">{nextPeriod.startTime} – {nextPeriod.endTime}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            Daily Schedule
          </CardTitle>
          <CardDescription>
            {schedule.length} period{schedule.length !== 1 ? 's' : ''} scheduled for today
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {schedule.map((period) => {
            const status = getCurrentStatus(period);
            return (
              <div 
                key={period.id} 
                className={`flex items-center justify-between rounded-xl border p-4 transition-all ${
                  status === 'current' 
                    ? 'border-primary bg-primary/10 shadow-md' 
                    : status === 'completed' 
                    ? 'border-border bg-muted/30 opacity-60' 
                    : 'border-border bg-muted/30 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg font-bold text-lg ${
                    status === 'current' 
                      ? 'bg-primary text-white' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    P{period.periodNumber}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-base">{period.subjectName}</p>
                      {period.subjectCode && (
                        <span className="font-mono text-xs text-muted-foreground">({period.subjectCode})</span>
                      )}
                      {period.isSubstitute && (
                        <Badge className="bg-amber-500/10 text-amber-600 text-xs">Substitute</Badge>
                      )}
                      {period.isCustomTiming && (
                        <Badge variant="outline" className="text-[10px] px-1 py-0 bg-primary/10 text-primary">
                          Lab Timing
                        </Badge>
                      )}
                      {status === 'current' && (
                        <Badge className="bg-emerald-500 text-white text-xs animate-pulse">LIVE</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {period.teacherName}
                      </div>
                      {period.roomNumber && (
                        <div className="flex items-center gap-1">
                          <DoorOpen className="h-3.5 w-3.5" />
                          Room {period.roomNumber}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <Badge 
                    variant={status === 'current' ? 'default' : 'outline'} 
                    className={`whitespace-nowrap font-mono ${
                      status === 'current' ? 'bg-primary' : ''
                    }`}
                  >
                    {period.startTime} – {period.endTime}
                  </Badge>
                </div>
              </div>
            );
          })}
          {!schedule.length && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarClock className="h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm font-medium text-muted-foreground">
                No classes scheduled for today
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
