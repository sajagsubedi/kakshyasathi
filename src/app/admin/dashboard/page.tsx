'use client';

import Link from 'next/link';
import {
    Users,
    GraduationCap,
    Building2,
    ClipboardCheck,
    Monitor,
    Bell,
    UserCheck,
    TrendingUp,
    ScanLine,
    ArrowRight,
    Clock,
} from 'lucide-react';

import { StatCard } from '@/components/shared/StatCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    users,
    sections,
    classes,
    studentAttendance,
    notices,
    smartBoards,
    substitutions,
    getSectionName,
    getTeacherName,
    dayNames,
} from '@/lib/mock-data';

export default function AdminDashboard() {
    const students = users.filter((u) => u.role === 'STUDENT');
    const teachers = users.filter((u) => u.role === 'TEACHER');
    const presentToday = studentAttendance.filter((a) => a.status === 'PRESENT').length;
    const absentToday = studentAttendance.filter((a) => a.status === 'ABSENT').length;
    const lateToday = studentAttendance.filter((a) => a.status === 'LATE').length;
    const attendanceRate = Math.round((presentToday / students.length) * 100);
    const activeBoards = smartBoards.filter((b) => b.status === 'ONLINE').length;
    const activeNotices = notices.filter((n) => n.status === 'ACTIVE').length;

    const recentAttendance = studentAttendance
        .filter((a) => a.status === 'PRESENT')
        .sort((a, b) => b.scannedAt.localeCompare(a.scannedAt))
        .slice(0, 5);

    const today = new Date();
    const dayName = dayNames[today.getDay()];

    return (
        <section

        >
            <PageHeader
                title="School Overview"
                description="Real-time snapshot of your school's daily operations"
            />

            {/* STAT CARDS */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard
                    label="Total Students"
                    value={students.length}
                    icon={GraduationCap}
                    accent="primary"
                    trend={`${students.length} enrolled this year`}
                />
                <StatCard
                    label="Total Teachers"
                    value={teachers.length}
                    icon={Users}
                    accent="chart-3"
                    trend={`${teachers.length} active faculty`}
                />
                <StatCard
                    label="Attendance Today"
                    value={`${attendanceRate}%`}
                    icon={ClipboardCheck}
                    accent="success"
                    trend={`${presentToday} present · ${absentToday} absent`}
                    trendUp
                />
                <StatCard
                    label="Active Smart Boards"
                    value={`${activeBoards}/${smartBoards.length}`}
                    icon={Monitor}
                    accent="chart-4"
                    trend={`${activeBoards} online now`}
                />
            </div>

            {/* SECONDARY STATS */}
            <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard
                    label="Classes"
                    value={classes.length}
                    icon={Building2}
                    accent="chart-2"
                />
                <StatCard
                    label="Sections"
                    value={sections.length}
                    icon={GraduationCap}
                    accent="chart-3"
                />
                <StatCard
                    label="Substitutions Today"
                    value={substitutions.length}
                    icon={UserCheck}
                    accent="warning"
                />
                <StatCard
                    label="Active Notices"
                    value={activeNotices}
                    icon={Bell}
                    accent="primary"
                />
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                {/* ATTENDANCE SUMMARY */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base">Today&apos;s Attendance</CardTitle>
                            <CardDescription>Latest student check-ins</CardDescription>
                        </div>
                        <Button>
                            <Link href="/admin/attendance" className='flex items-center justify-center'>
                                View all
                                <ArrowRight className="ml-2 h-3.5 w-3.5" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {/* ATTENDANCE BAR */}
                        <div className="flex h-2.5 overflow-hidden rounded-full">
                            <div
                                className="bg-emerald-500"
                                style={{ width: `${(presentToday / students.length) * 100}%` }}
                            />
                            <div
                                className="bg-amber-500"
                                style={{ width: `${(lateToday / students.length) * 100}%` }}
                            />
                            <div
                                className="bg-destructive"
                                style={{ width: `${(absentToday / students.length) * 100}%` }}
                            />
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                Present ({presentToday})
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-amber-500" />
                                Late ({lateToday})
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-destructive" />
                                Absent ({absentToday})
                            </span>
                        </div>

                        {/* RECENT CHECK-INS */}
                        <div className="space-y-2 pt-2">
                            {recentAttendance.map((record) => {
                                const student = users.find((u) => u.id === record.studentId);
                                if (!student) return null;
                                const time = new Date(record.scannedAt).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true,
                                });
                                return (
                                    <div
                                        key={record.id}
                                        className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2.5"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="bg-primary/10 text-xs text-primary">
                                                    {student.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium">{student.fullName}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {getSectionName(record.sectionId)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                {time}
                                            </span>
                                            <Badge variant="default" className="bg-emerald-500 text-white hover:bg-emerald-500">
                                                Present
                                            </Badge>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* ACTIVE NOTICES */}
                <Card>
                    <CardHeader className="flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base">Active Notices</CardTitle>
                            <CardDescription>Sent to sections</CardDescription>
                        </div>
                        <Button>
                            <Link href="/admin/notices">
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {notices.slice(0, 3).map((notice) => (
                            <div
                                key={notice.id}
                                className="rounded-lg border border-border bg-muted/30 p-3"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm font-medium">{notice.title}</p>
                                    <Badge
                                        variant={notice.priority === 'HIGH' ? 'destructive' : 'secondary'}
                                        className="shrink-0 text-[10px]"
                                    >
                                        {notice.priority}
                                    </Badge>
                                </div>
                                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                    {notice.content}
                                </p>
                                <p className="mt-2 text-[11px] text-muted-foreground">
                                    {notice.targetType === 'ALL'
                                        ? 'All Sections'
                                        : notice.targetSections.map(getSectionName).join(', ')}
                                </p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* SMART BOARDS + SUBSTITUTIONS */}
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader className="flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base">Smart Board Status</CardTitle>
                            <CardDescription>Classroom device connectivity</CardDescription>
                        </div>
                        <Button size="sm" >
                            <Link href="/admin/smartboards" className='flex items-center justify-center'>
                                Manage
                                <ArrowRight className="ml-2 h-3.5 w-3.5" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {smartBoards.map((board) => (
                            <div
                                key={board.id}
                                className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                                        <Monitor className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{board.deviceId}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {getSectionName(board.sectionId)}
                                        </p>
                                    </div>
                                </div>
                                <Badge
                                    variant={board.status === 'ONLINE' ? 'default' : 'secondary'}
                                    className={
                                        board.status === 'ONLINE'
                                            ? 'bg-emerald-500 text-white hover:bg-emerald-500'
                                            : ''
                                    }
                                >
                                    {board.status}
                                </Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base">Today&apos;s Substitutions</CardTitle>
                            <CardDescription>Temporary teacher assignments</CardDescription>
                        </div>
                        <Button>
                            <Link href="/admin/substitutions">
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {substitutions.length > 0 ? (
                            <div className="space-y-2">
                                {substitutions.map((sub) => (
                                    <div
                                        key={sub.id}
                                        className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                                                <UserCheck className="h-4 w-4 text-amber-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {getTeacherName(sub.substituteTeacherId)}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Substituting {getTeacherName(sub.regularTeacherId)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-medium">{getSectionName(sub.sectionId)}</p>
                                            <p className="text-[11px] text-muted-foreground">
                                                Period {sub.periodId.replace('p-', '')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <TrendingUp className="h-8 w-8 text-muted-foreground" />
                                <p className="mt-2 text-sm text-muted-foreground">
                                    No substitutions today
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* QUICK ACTIONS */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    <QuickAction href="/admin/users" icon={Users} label="Add User" />
                    <QuickAction href="/admin/timetable" icon={ScanLine} label="Timetable" />
                    <QuickAction href="/admin/substitutions" icon={UserCheck} label="Substitute" />
                    <QuickAction href="/admin/notices" icon={Bell} label="Send Notice" />
                    <QuickAction href="/admin/smartboards" icon={Monitor} label="Smart Board" />
                    <QuickAction href="/admin/attendance" icon={ClipboardCheck} label="Attendance" />
                </CardContent>
            </Card>
        </section>
    );
}

function QuickAction({
    href,
    icon: Icon,
    label,
}: {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
}) {
    return (
        <Link
            href={href}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-muted/30 p-4 text-center transition-all hover:border-primary/30 hover:bg-accent hover:shadow-sm"
        >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs font-medium">{label}</span>
        </Link>
    );
}
