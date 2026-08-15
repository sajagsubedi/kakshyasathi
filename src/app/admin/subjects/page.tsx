'use client';

import * as React from 'react';
import { BookOpen, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { adminNav, adminBottomNav } from '@/lib/nav';
import { useAdminSubjects, useCreateSubject } from '@/hooks/useApi';

export default function AdminSubjectsPage() {
  const { data: subjects = [] } = useAdminSubjects();
  const createSubject = useCreateSubject();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    name: '',
    code: '',
  });

  const handleCreate = async () => {
    if (!form.name.trim()) {
      toast.error('Subject name is required');
      return;
    }
    try {
      await createSubject.mutateAsync(form);
      toast.success('Subject created successfully');
      setDialogOpen(false);
      setForm({ name: '', code: '' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create subject');
    }
  };

  return (
    <DashboardLayout items={adminNav} title="Kakshyasathi" subtitle="Admin Portal" pageTitle="Subjects" pageDescription="Manage school subjects" allowedRoles={['ADMIN']} bottomNavItems={adminBottomNav}>
      <PageHeader title="Subjects" description={`${subjects.length} subjects`} action={<Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />Add Subject</Button>} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => (
          <Card key={subject.id} className="transition-all hover:border-primary/30 hover:shadow-sm">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10"><BookOpen className="h-4 w-4 text-primary" /></div>
                <div><p className="text-sm font-medium">{subject.name}</p><p className="text-xs text-muted-foreground">{subject.code}</p></div>
              </div>
              <Badge variant="outline" className="shrink-0">{subject.code}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Subject</DialogTitle>
            <DialogDescription>Create a new subject in the curriculum.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject-name">Subject Name</Label>
              <Input id="subject-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Mathematics" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="subject-code">Subject Code</Label>
              <Input id="subject-code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. MATH01" className="mt-1.5" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createSubject.isPending}>
              {createSubject.isPending ? 'Creating...' : 'Create Subject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
