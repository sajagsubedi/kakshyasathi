'use client';

import * as React from 'react';
import { Bell, Calendar, Search } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useTeacherNotices, useSharedLookup } from '@/hooks/useApi';

export default function TeacherNoticesPage() {
  const { data: notices = [], isLoading } = useTeacherNotices();
  const { data: lookup } = useSharedLookup();
  const getSectionName = lookup?.getSectionName ?? ((id: string) => id);
  const [search, setSearch] = React.useState('');

  const filteredNotices = React.useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return notices;
    return notices.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q),
    );
  }, [notices, search]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Announcements & Notices"
          description={`${notices.length} active announcements`}
        />
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search notices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-28 animate-pulse bg-muted/40" />
          ))
        ) : filteredNotices.length > 0 ? (
          filteredNotices.map((notice) => (
            <Card key={notice.id} className="transition-all hover:border-primary/30">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">{notice.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {notice.content}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(notice.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span>·</span>
                        <span>
                          Target: {notice.targetType === 'ALL' || !notice.targetSections?.length
                            ? 'All School'
                            : notice.targetSections.map(getSectionName).join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={notice.priority === 'HIGH' ? 'destructive' : 'secondary'}
                    className="text-xs shrink-0"
                  >
                    {notice.priority}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="py-12 text-center">
            <Bell className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              {search ? 'No notices matched your search query.' : 'No notices published yet.'}
            </p>
          </Card>
        )}
      </div>
    </section>
  );
}
