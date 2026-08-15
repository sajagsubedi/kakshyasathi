'use client';

import { GraduationCap } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { teacherNav } from '@/lib/nav';
import { useTeacherSections, useSharedLookup } from '@/hooks/useApi';

export default function TeacherSectionsPage() {
  const { data: sections = [] } = useTeacherSections();
  const { data: lookup } = useSharedLookup();
  const getSectionName = lookup?.getSectionName ?? ((id: string) => id);
  const users = lookup?.users ?? [];

  return (
    <DashboardLayout items={teacherNav} title="Kakshyasathi" subtitle="Teacher Portal" pageTitle="Sections" pageDescription="Your assigned classroom sections" allowedRoles={['TEACHER']}>
      <PageHeader title="Assigned Sections" description={`${sections.length} sections`} />
      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((section) => {
          const studentCount = users.filter((u) => u.sectionId === section.id && u.role === 'STUDENT').length;
          return (
            <Card key={section.id}>
              <CardContent className="flex items-center justify-between p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><GraduationCap className="h-5 w-5 text-primary" /></div>
                  <div><p className="font-semibold">{getSectionName(section.id)}</p><p className="text-xs text-muted-foreground">{section.academicYear}</p></div>
                </div>
                <Badge variant="secondary">{studentCount} students</Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
