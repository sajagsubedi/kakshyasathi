'use client';

import * as React from 'react';
import { Monitor, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminNav, adminBottomNav } from '@/lib/nav';
import { useAdminSmartBoards, useSharedLookup, useAdminSections, useCreateSmartBoard } from '@/hooks/useApi';

export default function AdminSmartBoardsPage() {
  const { data: smartBoards = [] } = useAdminSmartBoards();
  const { data: lookup } = useSharedLookup();
  const { data: sections = [] } = useAdminSections();
  const getSectionName = lookup?.getSectionName ?? ((id: string) => id);
  const createSmartBoard = useCreateSmartBoard();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    deviceId: '',
    name: '',
    sectionId: '',
  });

  const handleCreate = async () => {
    if (!form.deviceId.trim()) {
      toast.error('Device ID is required');
      return;
    }
    try {
      await createSmartBoard.mutateAsync(form);
      toast.success('Smart Board registered successfully');
      setDialogOpen(false);
      setForm({ deviceId: '', name: '', sectionId: '' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to register smart board');
    }
  };

  return (
    <DashboardLayout items={adminNav} title="Kakshyasathi" subtitle="Admin Portal" pageTitle="Smart Boards" pageDescription="Manage classroom smart board devices" allowedRoles={['ADMIN']} bottomNavItems={adminBottomNav}>
      <PageHeader title="Smart Boards" description={`${smartBoards.length} registered devices`} action={<Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />Register Board</Button>} />
      <div className="grid gap-4 sm:grid-cols-2">
        {smartBoards.map((board) => (
          <Card key={board.id} className="transition-all hover:border-primary/30 hover:shadow-sm">
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register Smart Board</DialogTitle>
            <DialogDescription>Register a new classroom smart board device.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sb-device">Device ID</Label>
              <Input id="sb-device" value={form.deviceId} onChange={(e) => setForm({ ...form, deviceId: e.target.value })} placeholder="e.g. SB-001" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="sb-name">Display Name</Label>
              <Input id="sb-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Room 101 Board" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="sb-section">Assigned Section</Label>
              <Select value={form.sectionId} onValueChange={(v: string | null) => setForm({ ...form, sectionId: v ?? '' })}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select section" /></SelectTrigger>
                <SelectContent>
                  {sections.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{getSectionName(s.id)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createSmartBoard.isPending}>
              {createSmartBoard.isPending ? 'Registering...' : 'Register Board'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
