'use client';

import { Monitor, Plus } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adminNav } from '@/lib/nav';
import { useAdminSmartBoards, useSharedLookup } from '@/hooks/useApi';

export default function AdminSmartBoardsPage() {
  const { data: smartBoards = [] } = useAdminSmartBoards();
  const { data: lookup } = useSharedLookup();
  const getSectionName = lookup?.getSectionName ?? ((id: string) => id);

  return (
    <DashboardLayout items={adminNav} title="Kakshyasathi" subtitle="Admin Portal" pageTitle="Smart Boards" pageDescription="Manage classroom smart board devices" allowedRoles={['ADMIN']}>
      <PageHeader title="Smart Boards" description={`${smartBoards.length} registered devices`} action={<Button><Plus className="mr-2 h-4 w-4" />Register Board</Button>} />
      <div className="grid gap-4 sm:grid-cols-2">
        {smartBoards.map((board) => (
          <Card key={board.id}>
            <CardHeader className="flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><Monitor className="h-5 w-5 text-primary" /></div>
                <div><CardTitle className="text-base">{board.deviceId}</CardTitle><CardDescription>{board.name}</CardDescription></div>
              </div>
              <Badge className={board.status === 'ONLINE' ? 'bg-emerald-500 text-white' : ''} variant={board.status === 'ONLINE' ? 'default' : 'secondary'}>{board.status}</Badge>
            </CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">{getSectionName(board.sectionId)}</p></CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
