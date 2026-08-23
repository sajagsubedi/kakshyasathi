'use client';

import * as React from 'react';
import { GraduationCap, Users, CalendarDays, Building2, BookOpen } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTeacherSections } from '@/hooks/useApi';

export default function TeacherSectionsPage() {
  const { data: sections = [], isLoading } = useTeacherSections();

  return (
    <section className="space-y-6">
      <PageHeader
        title="Assigned Sections"
        description="Class sections under your academic supervision and teaching assignments"
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-32 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : sections.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <Card key={section.id} className="transition-all hover:border-primary/40 hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base">
                        {section.className ? `${section.className} - Section ${section.name}` : `Section ${section.name}`}
                      </h3>
                      {section.grade && (
                        <p className="text-xs text-muted-foreground">Grade {section.grade}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary font-medium">
                    <Users className="h-3 w-3" />
                    {section.studentCount ?? 0}
                  </Badge>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2 text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    Academic Year
                  </span>
                  <span className="font-semibold text-foreground">
                    {section.academicYear || 'Current'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="py-12 text-center">
          <GraduationCap className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">No sections assigned to your faculty profile.</p>
          <p className="mt-1 text-xs text-muted-foreground">Contact your school administrator to configure section assignments.</p>
        </Card>
      )}
    </section>
  );
}
