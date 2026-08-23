'use client';

import { Building2, Plus, GraduationCap } from 'lucide-react';

import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { classes, sections, users } from '@/lib/mock-data';

export default function AdminClassesPage() {
  return (
    <section>
      <PageHeader
        title="Academic Classes"
        description={`${classes.length} classes for academic year 2025-2026`}
        action={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Class
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((cls) => {
          const classSections = sections.filter((s) => s.classId === cls.id);
          const studentCount = users.filter(
            (u) => u.role === 'STUDENT' && u.classId === cls.id
          ).length;

          return (
            <Card key={cls.id} className="overflow-hidden transition-shadow hover:shadow-md">
              <CardHeader className="flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{cls.name}</CardTitle>
                    <CardDescription>Academic Year {cls.academicYear}</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary">{classSections.length} sections</Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                {classSections.map((sec) => (
                  <div
                    key={sec.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Section {sec.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {users.filter((u) => u.sectionId === sec.id).length} students
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                  <span>Total Students</span>
                  <span className="font-medium text-foreground">{studentCount}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
