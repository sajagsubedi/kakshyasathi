'use client';

import { BookOpen, Plus } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adminNav } from '@/lib/nav';
import { useAdminSubjects } from '@/hooks/useApi';

export default function AdminSubjectsPage() {
  const { data: subjects = [] } = useAdminSubjects();

  return (
    <DashboardLayout items={adminNav} title="Kakshyasathi" subtitle="Admin Portal" pageTitle="Subjects" pageDescription="Manage school subjects" allowedRoles={['ADMIN']}>
      <PageHeader title="Subjects" description={`${subjects.length} subjects`} action={<Button><Plus className="mr-2 h-4 w-4" />Add Subject</Button>} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => (
          <Card key={subject.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10"><BookOpen className="h-4 w-4 text-primary" /></div>
                <div><p className="text-sm font-medium">{subject.name}</p><p className="text-xs text-muted-foreground">{subject.code}</p></div>
              </div>
              <Badge variant="outline">{subject.code}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
