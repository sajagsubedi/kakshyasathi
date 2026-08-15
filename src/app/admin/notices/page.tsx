'use client';

import * as React from 'react';
import { Bell, Plus, Send, Target } from 'lucide-react';
import { toast } from 'react-toastify';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminNav } from '@/lib/nav';
import { useAdminNotices, useSharedLookup, useCreateNotice } from '@/hooks/useApi';

type NoticeFormState = {
  title: string;
  content: string;
  targetType: 'ALL' | 'SELECTED_SECTIONS';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
};

export default function AdminNoticesPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [form, setForm] = React.useState<NoticeFormState>({ title: '', content: '', targetType: 'ALL', priority: 'MEDIUM' });
  const { data: notices = [] } = useAdminNotices();
  const { data: lookup } = useSharedLookup();
  const createNotice = useCreateNotice();
  const getSectionName = lookup?.getSectionName ?? ((id: string) => id);
  const users = lookup?.users ?? [];

  const priorityBadge = (priority: string) => {
    if (priority === 'HIGH') return <Badge variant="destructive">High</Badge>;
    if (priority === 'MEDIUM') return <Badge className="bg-amber-500/10 text-amber-600">Medium</Badge>;
    return <Badge variant="secondary">Low</Badge>;
  };

  const handleCreate = async () => {
    try {
      await createNotice.mutateAsync(form);
      toast.success('Notice created');
      setDialogOpen(false);
      setForm({ title: '', content: '', targetType: 'ALL', priority: 'MEDIUM' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create notice');
    }
  };

  return (
    <DashboardLayout items={adminNav} title="Kakshyasathi" subtitle="Admin Portal" pageTitle="Notices" pageDescription="Send and manage school announcements" allowedRoles={['ADMIN']}>
      <PageHeader title="Notice Board" description={`${notices.length} notices created`} action={<Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />New Notice</Button>} />
      <div className="grid gap-4">
        {notices.map((notice) => {
          const author = users.find((u) => u.id === notice.createdBy);
          return (
            <Card key={notice.id}>
              <CardHeader className="flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-base">{notice.title}</CardTitle>
                  <CardDescription>{author?.fullName ?? 'Admin'} · {new Date(notice.createdAt).toLocaleDateString()}</CardDescription>
                </div>
                <div className="flex gap-2">{priorityBadge(notice.priority)}<Badge variant="outline">{notice.status}</Badge></div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{notice.content}</p>
                <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                  <Target className="h-3 w-3" />
                  {notice.targetType === 'ALL' ? 'All Sections' : notice.targetSections.map(getSectionName).join(', ')}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Notice</DialogTitle><DialogDescription>Send an announcement to sections</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1.5" /></div>
            <div><Label>Content</Label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="mt-1.5" /></div>
            <div>
              <Label>Target</Label>
              <Select value={form.targetType} onValueChange={(v) => setForm({ ...form, targetType: (v === 'SELECTED_SECTIONS' ? 'SELECTED_SECTIONS' : 'ALL') })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="ALL">All Sections</SelectItem><SelectItem value="SELECTED_SECTIONS">Selected Sections</SelectItem></SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: (v === 'HIGH' ? 'HIGH' : v === 'LOW' ? 'LOW' : 'MEDIUM') })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="LOW">Low</SelectItem><SelectItem value="MEDIUM">Medium</SelectItem><SelectItem value="HIGH">High</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createNotice.isPending}><Send className="mr-2 h-4 w-4" />Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
