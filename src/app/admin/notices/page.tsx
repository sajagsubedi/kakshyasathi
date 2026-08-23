'use client';

import * as React from 'react';
import { Bell, Plus, Send, Target } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { notices, users, getSectionName } from '@/lib/mock-data';

export default function AdminNoticesPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const priorityBadge = (priority: string) => {
    if (priority === 'HIGH')
      return <Badge variant="destructive">High</Badge>;
    if (priority === 'MEDIUM')
      return (
        <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/10">
          Medium
        </Badge>
      );
    return <Badge variant="secondary">Low</Badge>;
  };

  return (
    <section

    >
      <PageHeader
        title="Notice Board"
        description={`${notices.length} notices created`}
        action={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Notice
          </Button>
        }
      />

      <div className="space-y-4">
        {notices.map((notice) => {
          const author = users.find((u) => u.id === notice.createdBy);
          return (
            <Card key={notice.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold">{notice.title}</h3>
                      {priorityBadge(notice.priority)}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {notice.content}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Target className="h-3.5 w-3.5" />
                        {notice.targetType === 'ALL'
                          ? 'All Sections'
                          : notice.targetSections.map(getSectionName).join(', ')}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Bell className="h-3.5 w-3.5" />
                        {new Date(notice.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-xs text-primary">
                        {author?.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {author?.fullName}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* CREATE NOTICE DIALOG */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Notice</DialogTitle>
            <DialogDescription>
              Send an announcement to selected sections or the entire school.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="noticeTitle">Title</Label>
              <Input id="noticeTitle" placeholder="Notice title" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="noticeContent">Content</Label>
              <Textarea
                id="noticeContent"
                placeholder="Write your notice here..."
                className="mt-1.5"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Target</Label>
                <Select defaultValue="ALL">
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Sections</SelectItem>
                    <SelectItem value="SELECTED">Selected Sections</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select defaultValue="MEDIUM">
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setDialogOpen(false)}>
              <Send className="mr-2 h-4 w-4" />
              Send Notice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
