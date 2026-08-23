'use client';

import { BookOpen, Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { subjects } from '@/lib/mock-data';

export default function AdminSubjectsPage() {
  return (
    <section

    >
      <PageHeader
        title="All Subjects"
        description={`${subjects.length} subjects available`}
        action={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Subject
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => (
          <Card key={subject.id} className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-base font-bold">{subject.name}</p>
                <p className="text-xs text-muted-foreground">
                  Code: {subject.code}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
