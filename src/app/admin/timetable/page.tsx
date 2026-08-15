'use client';

import * as React from 'react';
import { CalendarDays, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { adminNav, adminBottomNav } from '@/lib/nav';
import { useAdminTimetable, useAdminPeriods, useAdminSections, useSharedLookup, dayNames, useCreateTimetableEntry } from '@/hooks/useApi';

export default function AdminTimetablePage() {
  const { data: sections = [] } = useAdminSections();
  const [selectedSection, setSelectedSection] = React.useState<string | null>('');
  const handleSectionChange = (value: string | null) => {
    setSelectedSection(value ?? '');
  };
  React.useEffect(() => {
    if (sections[0] && !selectedSection) setSelectedSection(sections[0].id);
  }, [sections, selectedSection]);

  const { data: timetable = [] } = useAdminTimetable(selectedSection || undefined);
  const { data: periods = [] } = useAdminPeriods();
  const { data: lookup } = useSharedLookup();
  const users = lookup?.users ?? [];
  const teachers = users.filter((u) => u.role === 'TEACHER');

  const getSubjectName = lookup?.getSubjectName ?? ((id: string) => id);
  const getTeacherName = lookup?.getTeacherName ?? ((id: string) => id);
  const getSectionName = lookup?.getSectionName ?? ((id: string) => id);
  const subjects = lookup?.subjects ?? [];
  const createTimetableEntry = useCreateTimetableEntry();

  const getEntry = (day: number, periodId: string) =>
    timetable.find((t) => t.dayOfWeek === day && t.periodId === periodId);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    dayOfWeek: 0,
    periodId: '',
    subjectId: '',
    teacherId: '',
  });

  const handleCreate = async () => {
    if (!selectedSection) {
      toast.error('Please select a section first');
      return;
    }
    if (!form.periodId || !form.subjectId || !form.teacherId) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      await createTimetableEntry.mutateAsync({
        ...form,
        sectionId: selectedSection,
      });
      toast.success('Timetable entry added successfully');
      setDialogOpen(false);
      setForm({ dayOfWeek: 0, periodId: '', subjectId: '', teacherId: '' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add timetable entry');
    }
  };

  return (
    <DashboardLayout items={adminNav} title="Kakshyasathi" subtitle="Admin Portal" pageTitle="Timetable" pageDescription="Manage section timetables" allowedRoles={['ADMIN']} bottomNavItems={adminBottomNav}>
      <PageHeader title="Section Timetable" description={selectedSection ? getSectionName(selectedSection) : 'Select a section'} action={<Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />Add Entry</Button>} />
      <div className="mb-4">
        <Select value={selectedSection ?? ''} onValueChange={handleSectionChange}>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Timetable Entry</DialogTitle>
            <DialogDescription>Create a new timetable entry for the selected section.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tt-day">Day of Week</Label>
              <Select value={form.dayOfWeek.toString()} onValueChange={(v: string | null) => setForm({ ...form, dayOfWeek: Number(v ?? 0) })}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select day" /></SelectTrigger>
                <SelectContent>
                  {dayNames.map((name, idx) => (
                    <SelectItem key={idx} value={idx.toString()}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tt-period">Period</Label>
              <Select value={form.periodId} onValueChange={(v: string | null) => setForm({ ...form, periodId: v ?? '' })}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select period" /></SelectTrigger>
                <SelectContent>
                  {periods.map((p) => (
                    <SelectItem key={p.id} value={p.id}>P{p.periodNumber} ({p.startTime}-{p.endTime})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tt-subject">Subject</Label>
              <Select value={form.subjectId} onValueChange={(v: string | null) => setForm({ ...form, subjectId: v ?? '' })}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tt-teacher">Teacher</Label>
              <Select value={form.teacherId} onValueChange={(v: string | null) => setForm({ ...form, teacherId: v ?? '' })}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select teacher" /></SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.fullName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createTimetableEntry.isPending}>
              {createTimetableEntry.isPending ? 'Adding...' : 'Add Entry'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
