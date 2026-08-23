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
import { useAdminNotices } from '@/hooks/admin/useNotices';
import { useAdminSections } from '@/hooks/admin/useSections';
import { NoticeTargetType } from '@/types';

type NoticeFormState = {
  title: string;
  noticeBody: string;
  targetType: NoticeTargetType;
  targetSection: string;
};

export default function AdminNoticesPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [form, setForm] = React.useState<NoticeFormState>({
    title: '',
    noticeBody: '',
    targetType: NoticeTargetType.all,
    targetSection: '',
  });

  const {
    data: noticesData,
    createNotice,
  } = useAdminNotices({ page: 1, limit: 50 });

  const { data: sectionsData } = useAdminSections({ page: 1, limit: 100 });

  const notices = noticesData?.items ?? [];
  const sections = sectionsData?.items ?? [];

  const getAuthorName = (author: unknown) => {
    if (!author) return 'Admin';
    if (typeof author === 'string') return 'Admin';
    if (typeof author === 'object' && author !== null && 'name' in author) {
      const name = (author as { name?: string }).name;
      return name?.trim() || 'Admin';
    }
    return 'Admin';
  };

  const getTargetText = (notice: (typeof notices)[number]) => {
    if (notice.targetType === NoticeTargetType.all) {
      return 'All Sections';
    }

    if (notice.targetSections.length === 0) {
      return 'Selected Sections';
    }

    return notice.targetSections
      .map((section) => {
        const className = section.class?.name?.trim();
        if (className) return `${className} · ${section.name}`;
        return section.name;
      })
      .join(', ');
  };

  const handleCreate = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!form.noticeBody.trim()) {
      toast.error('Notice body is required');
      return;
    }

    if (form.targetType === NoticeTargetType.sections && !form.targetSection) {
      toast.error('Please select a section');
      return;
    }

    try {
      await createNotice.mutateAsync({
        title: form.title.trim(),
        noticeBody: form.noticeBody.trim(),
        targetType: form.targetType,
        targetSections:
          form.targetType === NoticeTargetType.sections
            ? [form.targetSection]
            : undefined,
      });

      toast.success('Notice created');
      setDialogOpen(false);
      setForm({
        title: '',
        noticeBody: '',
        targetType: NoticeTargetType.all,
        targetSection: '',
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create notice');
    }
  };

  return (
    <section>

      <PageHeader title="Notice Board" description={`${notices.length} notices created`} action={<Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />New Notice</Button>} />
      <div className="grid gap-4">
        {notices.map((notice) => {
          return (
            <Card key={notice._id}>
              <CardHeader className="flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-base">{notice.title}</CardTitle>
                  <CardDescription>{getAuthorName(notice.author)} · {new Date(notice.publishedAt).toLocaleDateString()}</CardDescription>
                </div>
                <div className="flex gap-2"><Badge variant="outline">{notice.targetType === NoticeTargetType.all ? 'All' : 'Sections'}</Badge></div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{notice.body}</p>
                <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                  <Target className="h-3 w-3" />
                  {getTargetText(notice)}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {notices.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No notices created yet.
            </CardContent>
          </Card>
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Notice</DialogTitle><DialogDescription>Send an announcement to sections</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1.5" /></div>
            <div><Label>Content</Label><Textarea value={form.noticeBody} onChange={(e) => setForm({ ...form, noticeBody: e.target.value })} className="mt-1.5" /></div>
            <div>
              <Label>Target</Label>
              <Select value={form.targetType} onValueChange={(v) => setForm({ ...form, targetType: (v === NoticeTargetType.sections ? NoticeTargetType.sections : NoticeTargetType.all), targetSection: '' })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value={NoticeTargetType.all}>All Sections</SelectItem><SelectItem value={NoticeTargetType.sections}>Selected Sections</SelectItem></SelectContent>
              </Select>
            </div>

            {form.targetType === NoticeTargetType.sections && (
              <div>
                <Label>Section</Label>
                <Select value={form.targetSection} onValueChange={(v) => setForm({ ...form, targetSection: v || '' })}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select section" /></SelectTrigger>
                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section._id} value={section._id}>
                        {typeof section.class !== "string" && section.class
                          ? `${section.class.name} · ${section.name}`
                          : `Section ${section.name}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createNotice.isPending}><Send className="mr-2 h-4 w-4" />Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
