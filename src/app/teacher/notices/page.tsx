'use client';

import { Bell } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { teacherNav } from '@/lib/nav';
import { useTeacherNotices, useSharedLookup } from '@/hooks/useApi';

export default function TeacherNoticesPage() {
  const { data: notices = [] } = useTeacherNotices();
  const { data: lookup } = useSharedLookup();
  const getSectionName = lookup?.getSectionName ?? ((id: string) => id);

  return (
    <DashboardLayout items={teacherNav} title="Kakshyasathi" subtitle="Teacher Portal" pageTitle="Notices" pageDescription="School announcements" allowedRoles={['TEACHER']}>
      <PageHeader title="Notices" description={`${notices.length} active notices`} />
      <div className="grid gap-4">
        {notices.map((notice) => (
          <Card key={notice.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10"><Bell className="h-4 w-4 text-primary" /></div>
                  <div>
                    <p className="font-medium">{notice.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{notice.content}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {notice.targetType === 'ALL' ? 'All Sections' : notice.targetSections.map(getSectionName).join(', ')}
                    </p>
                  </div>
                </div>
                <Badge variant={notice.priority === 'HIGH' ? 'destructive' : 'secondary'}>{notice.priority}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
        {!notices.length && <p className="text-sm text-muted-foreground">No notices available</p>}
      </div>
    </DashboardLayout>
  );
}
