'use client';

import { GraduationCap, Plus } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adminNav } from '@/lib/nav';
import { useAdminSections, useAdminClasses, useAdminLookup } from '@/hooks/useApi';

export default function AdminSectionsPage() {
  const { data: sections = [] } = useAdminSections();
  const { data: classes = [] } = useAdminClasses();
  const { data: lookup } = useAdminLookup();
  const users = lookup?.users ?? [];
  const getSectionName = lookup?.getSectionName ?? ((id: string) => id);

  return (
    <DashboardLayout items={adminNav} title="Kakshyasathi" subtitle="Admin Portal" pageTitle="Sections" pageDescription="Manage classroom sections" allowedRoles={['ADMIN']}>
      <PageHeader title="Sections" description={`${sections.length} sections across all classes`} action={<Button><Plus className="mr-2 h-4 w-4" />Add Section</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => {
          const cls = classes.find((c) => c.id === section.classId);
          const studentCount = users.filter((u) => u.sectionId === section.id && u.role === 'STUDENT').length;
          return (
            <Card key={section.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><GraduationCap className="h-5 w-5 text-primary" /></div>
                    <div><p className="font-semibold">{getSectionName(section.id)}</p><p className="text-xs text-muted-foreground">{cls?.academicYear ?? section.academicYear}</p></div>
                  </div>
                  <Badge variant="secondary">{studentCount} students</Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
