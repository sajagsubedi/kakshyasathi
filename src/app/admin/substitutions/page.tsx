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
import { adminNav, adminBottomNav } from '@/lib/nav';
import { useAdminSubstitutions, useSharedLookup, useCreateSubstitution, useAdminSections, useAdminPeriods } from '@/hooks/useApi';

export default function AdminSubstitutionsPage() {
  const today = new Date().toISOString().split('T')[0];
  const { data: substitutions = [] } = useAdminSubstitutions(today);
  const { data: lookup } = useSharedLookup();
  const { data: sections = [] } = useAdminSections();
  const { data: periods = [] } = useAdminPeriods();
  const getSectionName = lookup?.getSectionName ?? ((id: string) => id);
  const getTeacherName = lookup?.getTeacherName ?? ((id: string) => id);
  const getPeriod = lookup?.getPeriod ?? (() => undefined);
  const users = lookup?.users ?? [];
  const teachers = users.filter((u) => u.role === 'TEACHER');
  const createSubstitution = useCreateSubstitution();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    sectionId: '',
    date: today,
    periodId: '',
    regularTeacherId: '',
    substituteTeacherId: '',
  });

  const handleCreate = async () => {
    if (!form.sectionId || !form.periodId || !form.regularTeacherId || !form.substituteTeacherId) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      await createSubstitution.mutateAsync(form);
      toast.success('Substitution created successfully');
      setDialogOpen(false);
      setForm({
        sectionId: '',
        date: today,
        periodId: '',
        regularTeacherId: '',
        substituteTeacherId: '',
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create substitution');
    }
  };

  return (
    <DashboardLayout items={adminNav} title="Kakshyasathi" subtitle="Admin Portal" pageTitle="Substitutions" pageDescription="Manage substitute teacher assignments" allowedRoles={['ADMIN']} bottomNavItems={adminBottomNav}>
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
              <TableRow key={sub.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7"><AvatarFallback className="text-xs">{getTeacherName(sub.substituteTeacherId).slice(0, 2)}</AvatarFallback></Avatar>
                    <span className="text-sm">{getTeacherName(sub.substituteTeacherId)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{getTeacherName(sub.regularTeacherId)}</TableCell>
                <TableCell><Badge variant="secondary">{getSectionName(sub.sectionId)}</Badge></TableCell>
                <TableCell>P{getPeriod(sub.periodId)?.periodNumber ?? '?'}</TableCell>
                <TableCell className="text-sm">{sub.date}</TableCell>
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
              <Select value={form.sectionId} onValueChange={(v: string | null) => setForm({ ...form, sectionId: v ?? '' })}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select section" /></SelectTrigger>
                <SelectContent>
                  {sections.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{getSectionName(s.id)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sub-period">Period</Label>
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
              <Label htmlFor="sub-regular">Regular Teacher</Label>
              <Select value={form.regularTeacherId} onValueChange={(v: string | null) => setForm({ ...form, regularTeacherId: v ?? '' })}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select regular teacher" /></SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.fullName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sub-substitute">Substitute Teacher</Label>
              <Select value={form.substituteTeacherId} onValueChange={(v: string | null) => setForm({ ...form, substituteTeacherId: v ?? '' })}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select substitute teacher" /></SelectTrigger>
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
            <Button onClick={handleCreate} disabled={createSubstitution.isPending}>
              {createSubstitution.isPending ? 'Creating...' : 'Create Substitution'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
