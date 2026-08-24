"use client";

import * as React from "react";
import { Monitor, Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "react-toastify";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DeleteModal from "@/components/shared/DeleteModal";
import { useAdminSmartBoards, type SmartBoardItem } from "@/hooks/admin/useSmartBoards";
import { useAdminClassrooms } from "@/hooks/admin/useClassrooms";
import { classroomLabel, refId } from "@/lib/adminDisplay";
import { DeviceStatus } from "@/types";

function statusBadge(status: DeviceStatus) {
  if (status === DeviceStatus.online) {
    return <Badge className="bg-emerald-500 text-white">Online</Badge>;
  }
  if (status === DeviceStatus.syncing) {
    return <Badge className="bg-amber-500 text-white">Syncing</Badge>;
  }
  if (status === DeviceStatus.maintenance) {
    return <Badge variant="secondary">Maintenance</Badge>;
  }
  return <Badge variant="outline">Offline</Badge>;
}

export default function AdminSmartBoardsPage() {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [searchInput, setSearchInput] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SmartBoardItem | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [toDelete, setToDelete] = React.useState<SmartBoardItem | null>(null);
  const [form, setForm] = React.useState({
    classroom: "",
    deviceKey: "",
    status: DeviceStatus.offline,
  });

  const {
    data,
    isLoading,
    createSmartBoard,
    updateSmartBoard,
    deleteSmartBoard,
  } = useAdminSmartBoards({ search: search || undefined, page, limit: 12 });
  const { data: classroomsData } = useAdminClassrooms({ limit: 100 });
  const boards = data?.items ?? [];
  const classrooms = classroomsData?.items ?? [];

  const resetForm = () => {
    setForm({ classroom: "", deviceKey: "", status: DeviceStatus.offline });
    setEditing(null);
  };

  const handleSubmit = async () => {
    if (!form.classroom) {
      toast.error("Classroom is required");
      return;
    }
    try {
      if (editing) {
        await updateSmartBoard.mutateAsync({
          id: editing._id,
          payload: {
            classroom: form.classroom,
            status: form.status,
            ...(form.deviceKey.trim() ? { deviceKey: form.deviceKey.trim() } : {}),
          },
        });
        toast.success("Smart board updated");
      } else {
        const created = await createSmartBoard.mutateAsync({
          classroom: form.classroom,
          deviceKey: form.deviceKey.trim() || undefined,
          status: form.status,
        });
        const key =
          created && typeof created === "object" && "deviceKey" in created
            ? String((created as { deviceKey?: string }).deviceKey)
            : "";
        toast.success(key ? `Registered. Device key: ${key}` : "Smart board registered");
      }
      setDialogOpen(false);
      resetForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save smart board");
    }
  };

  return (
    <section>
      <PageHeader
        title="Smart Boards"
        description={data ? `${data.total} registered boards` : "Classroom display devices"}
        action={
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Register Board
          </Button>
        }
      />

      <div className="mb-5 flex gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search device key..." className="pl-9" />
        </div>
        <Button variant="outline" onClick={() => { setPage(1); setSearch(searchInput.trim()); }}>Search</Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading smart boards...</p>
      ) : boards.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No smart boards registered yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {boards.map((board) => (
            <Card key={board._id}>
              <CardHeader className="flex-row items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Monitor className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{classroomLabel(board.classroom)}</CardTitle>
                    <CardDescription className="font-mono text-xs">
                      {board.deviceKey.slice(0, 12)}…
                    </CardDescription>
                  </div>
                </div>
                {statusBadge(board.status)}
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setEditing(board);
                    setForm({
                      classroom: refId(board.classroom),
                      deviceKey: board.deviceKey,
                      status: board.status,
                    });
                    setDialogOpen(true);
                  }}
                >
                  <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                </Button>
                <Button variant="outline" size="sm" className="text-destructive" onClick={() => { setToDelete(board); setDeleteOpen(true); }}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Smart Board" : "Register Smart Board"}</DialogTitle>
            <DialogDescription>One Smart Board per classroom. Leave device key empty to generate one.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Classroom</Label>
              <Select
                value={form.classroom}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    classroom: value ?? "",
                  }))
                }
              >
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue placeholder="Select classroom">
                    {form.classroom
                      ? classroomLabel(
                        classrooms.find((room) => room._id === form.classroom)
                      )
                      : "Select classroom"}
                  </SelectValue>
                </SelectTrigger>

                <SelectContent>
                  {classrooms.map((room) => (
                    <SelectItem key={room._id} value={room._id}>
                      {classroomLabel(room)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Device key</Label>
              <Input className="mt-1.5" value={form.deviceKey} onChange={(e) => setForm({ ...form, deviceKey: e.target.value })} placeholder={editing ? "Existing key" : "Auto-generated if empty"} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: (value as DeviceStatus) ?? DeviceStatus.offline }))}>
                <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.values(DeviceStatus).map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editing ? "Update" : "Register"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteModal
        isOpen={deleteOpen}
        title="Delete Smart Board"
        message="Remove this Smart Board registration?"
        onConfirm={async () => {
          if (!toDelete) return;
          try {
            await deleteSmartBoard.mutateAsync(toDelete._id);
            toast.success("Smart board deleted");
            setDeleteOpen(false);
            setToDelete(null);
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Delete failed");
          }
        }}
        onCancel={() => { setDeleteOpen(false); setToDelete(null); }}
        isDeleting={deleteSmartBoard.isPending}
      />
    </section>
  );
}
