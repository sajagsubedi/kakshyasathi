'use client';

import * as React from 'react';
import { UserCheck, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useAdminSubstitutions } from '@/hooks/admin/useSubstitutions';
import { useAdminSections } from '@/hooks/admin/useSections';
import { useAdminPeriods } from '@/hooks/admin/usePeriods';
import { useAdminTeachers } from '@/hooks/admin/useTeachers';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function getTeacherName(
  teacher: string | { user?: { name?: string } },
) {
  if (!teacher || typeof teacher === 'string') return 'Unknown Teacher';
  return teacher.user?.name?.trim() || 'Unknown Teacher';
}

function getSectionName(
  section: string | { name?: string; class?: { name?: string } },
) {
  if (!section || typeof section === 'string') return 'Unknown Section';
  const className = section.class?.name?.trim();
  const sectionName = section.name?.trim();
  if (className && sectionName) return `${className} · ${sectionName}`;
  return className || sectionName || 'Unknown Section';
}

export default function AdminSubstitutionsPage() {
  const today = new Date().toISOString().split('T')[0];
  const {
    data: substitutionsData,
    createSubstitution,
  } = useAdminSubstitutions({ date: today, page: 1, limit: 100 });

  const { data: sectionsData } = useAdminSections({ page: 1, limit: 100 });
  const { data: periods = [] } = useAdminPeriods();
  const { data: teachersData } = useAdminTeachers(100);

  const substitutions = substitutionsData?.items ?? [];
  const sections = sectionsData?.items ?? [];
  const teachers = teachersData?.items ?? [];

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    section: '',
    date: today,
    periodNumber: '',
    originalTeacher: '',
    substituteTeacher: '',
  });

  const handleCreate = async () => {
    if (!form.section || !form.periodNumber || !form.originalTeacher || !form.substituteTeacher) {
      toast.error('Please fill in all required fields');
      return;
    }

    const parsedPeriodNumber = Number(form.periodNumber);
    if (Number.isNaN(parsedPeriodNumber) || parsedPeriodNumber < 1) {
      toast.error('Please select a valid period');
      return;
    }

    try {
      await createSubstitution.mutateAsync({
        section: form.section,
        date: form.date,
        periodNumber: parsedPeriodNumber,
        originalTeacher: form.originalTeacher,
        substituteTeacher: form.substituteTeacher,
      });

      toast.success('Substitution created successfully');
      setDialogOpen(false);
      setForm({
        section: '',
        date: today,
        periodNumber: '',
        originalTeacher: '',
        substituteTeacher: '',
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create substitution');
    }
  };

  return (
    <section>
      <PageHeader title="Substitutions" description={`${substitutions.length} substitutions today`} action={<Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />Add Substitution</Button>} />
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Substitute</TableHead>
              <TableHead>Regular Teacher</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {substitutions.map((sub) => (
              <TableRow key={sub._id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7"><AvatarFallback className="text-xs">{getInitials(getTeacherName(sub.substituteTeacher))}</AvatarFallback></Avatar>
                    <span className="text-sm">{getTeacherName(sub.substituteTeacher)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{getTeacherName(sub.originalTeacher)}</TableCell>
                <TableCell><Badge variant="secondary">{getSectionName(sub.section)}</Badge></TableCell>
                <TableCell>P{sub.periodNumber}</TableCell>
                <TableCell className="text-sm">{new Date(sub.date).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {substitutions.length === 0 && <CardContent className="py-8 text-center text-sm text-muted-foreground">No substitutions for today</CardContent>}
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Substitution</DialogTitle>
            <DialogDescription>Assign a substitute teacher for a specific period.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[65vh] overflow-y-auto">
            <div>
              <Label htmlFor="sub-date">Date</Label>
              <Input id="sub-date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="sub-section">Section</Label>
              <Select value={form.section} onValueChange={(v) => setForm({ ...form, section: v || '' })}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select section" /></SelectTrigger>
                <SelectContent>
                  {sections.map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      {typeof s.class !== "string" && s.class
                        ? `${s.class.name} · ${s.name}`
                        : `Section ${s.name}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sub-period">Period</Label>
              <Select value={form.periodNumber} onValueChange={(v) => setForm({ ...form, periodNumber: v || '' })}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select period" /></SelectTrigger>
                <SelectContent>
                  {periods.map((p) => (
                    <SelectItem key={p._id} value={String(p.periodNumber)}>P{p.periodNumber} ({p.startTime}-{p.endTime})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sub-regular">Regular Teacher</Label>
              <Select value={form.originalTeacher} onValueChange={(v) => setForm({ ...form, originalTeacher: v || '' })}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select regular teacher" /></SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t._id} value={t._id}>{t.user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sub-substitute">Substitute Teacher</Label>
              <Select value={form.substituteTeacher} onValueChange={(v) => setForm({ ...form, substituteTeacher: v || '' })}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select substitute teacher" /></SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t._id} value={t._id}>{t.user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createSubstitution.isPending}>
              {createSubstitution.isPending ? 'Creating...' : 'Create Substitution'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>);
}
