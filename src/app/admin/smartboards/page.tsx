'use client';

import { Monitor, Plus, Wifi, WifiOff, MapPin } from 'lucide-react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { smartBoards, getSectionName } from '@/lib/mock-data';

export default function AdminSmartBoardsPage() {
  return (
    <section

    >
      <PageHeader
        title="Smart Board Devices"
        description={`${smartBoards.length} boards registered`}
        action={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Register Board
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {smartBoards.map((board) => (
          <Card key={board.id} className="overflow-hidden transition-shadow hover:shadow-md">
            <CardHeader className="flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${board.status === 'ONLINE'
                      ? 'bg-emerald-500/10'
                      : 'bg-muted'
                    }`}
                >
                  <Monitor
                    className={`h-5 w-5 ${board.status === 'ONLINE'
                        ? 'text-emerald-600'
                        : 'text-muted-foreground'
                      }`}
                  />
                </div>
                <div>
                  <CardTitle className="text-base">{board.deviceId}</CardTitle>
                  <CardDescription>{board.name}</CardDescription>
                </div>
              </div>
              <Badge
                variant={board.status === 'ONLINE' ? 'default' : 'secondary'}
                className={
                  board.status === 'ONLINE'
                    ? 'bg-emerald-500 text-white hover:bg-emerald-500'
                    : ''
                }
              >
                {board.status === 'ONLINE' ? (
                  <span className="flex items-center gap-1">
                    <Wifi className="h-3 w-3" />
                    Online
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <WifiOff className="h-3 w-3" />
                    Offline
                  </span>
                )}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{getSectionName(board.sectionId)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Last seen: {new Date(board.lastSeenAt).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
