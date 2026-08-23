'use client';

import { GraduationCap, Plus, Users } from 'lucide-react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { sections, classes, users, getSectionName } from '@/lib/mock-data';

export default function AdminSectionsPage() {
  return (
    <section
    >
      <PageHeader
        title="All Sections"
        description={`${sections.length} sections across ${classes.length} classes`}
        action={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Section
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => {
          const cls = classes.find((c) => c.id === section.classId);
          const studentCount = users.filter(
            (u) => u.role === 'STUDENT' && u.sectionId === section.id
          ).length;

          return (
            <Card key={section.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-chart-3/10">
                      <GraduationCap className="h-5 w-5 text-chart-3" />
                    </div>
                    <div>
                      <p className="text-base font-bold">{getSectionName(section.id)}</p>
                      <p className="text-xs text-muted-foreground">
                        {cls?.academicYear}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {studentCount} students
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
