'use client';

import * as React from 'react';
import { GraduationCap, Plus, Users, CalendarDays, Building2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminNav, adminBottomNav } from '@/lib/nav';
import { useAdminSections, useAdminClasses, useAdminLookup, useCreateSection } from '@/hooks/useApi';

export default function AdminSectionsPage() {
  const { data: sections = [] } = useAdminSections();
  const { data: classes = [] } = useAdminClasses();
  const { data: lookup } = useAdminLookup();
  const users = lookup?.users ?? [];
  const getSectionName = lookup?.getSectionName ?? ((id: string) => {
    const sec = sections.find((s) => s.id === id);
    if (!sec) return 'Unknown';
    const cls = classes.find((c) => c.id === sec.classId);
    return cls ? `${cls.name} - Section ${sec.name}` : `Section ${sec.name}`;
  });
  const createSection = useCreateSection();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    name: '',
    classId: '',
    academicYear: new Date().getFullYear().toString(),
  });

  const handleCreate = async () => {
    if (!form.name.trim()) {
      toast.error('Section name is required');
      return;
    }
    if (!form.classId) {
      toast.error('Please select a class');
      return;
    }
    try {
      await createSection.mutateAsync(form);
      toast.success('Section created successfully');
      setDialogOpen(false);
      setForm({ name: '', classId: '', academicYear: new Date().getFullYear().toString() });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create section');
    }
  };

  return (
    <DashboardLayout items={adminNav} title="Kakshyasathi" subtitle="Admin Portal" pageTitle="Sections" pageDescription="Manage classroom sections" allowedRoles={['ADMIN']} bottomNavItems={adminBottomNav}>
      <PageHeader title="Sections" description={`${sections.length} sections across all classes`} action={<Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />Add Section</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => {
          const cls = classes.find((c) => c.id === section.classId);
          const studentCount = users.filter((u) => u.sectionId === section.id && u.role === 'STUDENT').length;
          const teacherCount = users.filter((u) => u.sectionId === section.id && u.role === 'TEACHER').length;
          return (
            <Card key={section.id} className="group transition-all hover:border-primary/30 hover:shadow-md overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-primary/15 via-primary/10 to-chart-3/10 px-5 py-4 border-b border-border">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/20 backdrop-blur-sm">
                        <GraduationCap className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold tracking-tight">Section {section.name}</p>
                        {cls && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <Building2 className="h-3 w-3" />
                            {cls.name}
                            {cls.grade ? ` · Grade ${cls.grade}` : ''}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className="gap-1 shrink-0 bg-primary/10 text-primary border-primary/20">
                      <Users className="h-3 w-3" />
                      {studentCount}
                    </Badge>
                  </div>
                </div>
                <div className="px-5 py-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted/30 p-2.5">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                      <CalendarDays className="h-3 w-3" />
                      Academic Year
                    </div>
                    <p className="mt-0.5 text-sm font-semibold text-foreground">{section.academicYear}</p>
                  </div>
                  <div className="rounded-lg bg-muted/30 p-2.5">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                      <Users className="h-3 w-3" />
                      Class Teacher
                    </div>
                    <p className="mt-0.5 text-sm font-semibold text-foreground">
                      {teacherCount > 0 ? `${teacherCount} assigned` : '—'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Section</DialogTitle>
            <DialogDescription>Create a new section under an existing class.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="section-name">Section Name</Label>
              <Input id="section-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. A, B, C" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="section-class">Class</Label>
              <Select value={form.classId} onValueChange={(v: string | null) => setForm({ ...form, classId: v ?? '' })}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="section-year">Academic Year</Label>
              <Input id="section-year" value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} className="mt-1.5" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createSection.isPending}>
              {createSection.isPending ? 'Creating...' : 'Create Section'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
