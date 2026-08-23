"use client";

import * as React from "react";
import { DoorOpen, Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { useAdminClassrooms, type ClassroomItem } from "@/hooks/admin/useClassrooms";
import { useAdminSections } from "@/hooks/admin/useSections";
import { refId, sectionLabel } from "@/lib/adminDisplay";

export default function AdminClassroomsPage() {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [searchInput, setSearchInput] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ClassroomItem | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [toDelete, setToDelete] = React.useState<ClassroomItem | null>(null);
  const [form, setForm] = React.useState({ roomNumber: "", section: "" });

  const {
    data,
    isLoading,
    isError,
    error,
    createClassroom,
    updateClassroom,
    deleteClassroom,
  } = useAdminClassrooms({ search: search || undefined, page, limit: 12 });

  const { data: sectionsData } = useAdminSections({ limit: 100 });
  const sections = sectionsData?.items ?? [];
  const classrooms = data?.items ?? [];

  const resetForm = () => {
    setForm({ roomNumber: "", section: "" });
    setEditing(null);
  };

  const handleSubmit = async () => {
    if (!form.roomNumber.trim()) {
      toast.error("Room number is required");
      return;
    }
    if (!form.section) {
      toast.error("Section is required");
      return;
    }
    try {
      if (editing) {
        await updateClassroom.mutateAsync({
          id: editing._id,
          payload: { roomNumber: form.roomNumber.trim(), section: form.section },
        });
        toast.success("Classroom updated successfully");
      } else {
        await createClassroom.mutateAsync({
          roomNumber: form.roomNumber.trim(),
          section: form.section,
        });
        toast.success("Classroom created successfully");
      }
      setDialogOpen(false);
      resetForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save classroom");
    }
  };

  return (
    <section>
      <PageHeader
        title="Classrooms"
        description={data ? `${data.total} physical ${data.total === 1 ? "room" : "rooms"}` : "Manage physical classrooms"}
        action={
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Classroom
          </Button>
        }
      />

      <div className="mb-5 flex gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setPage(1);
                setSearch(searchInput.trim());
              }
            }}
            placeholder="Search room numbers..."
            className="pl-9"
          />
        </div>
        <Button variant="outline" onClick={() => { setPage(1); setSearch(searchInput.trim()); }}>
          Search
        </Button>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}><CardContent className="h-28 animate-pulse bg-muted/40" /></Card>
          ))}
        </div>
      )}

      {isError && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Failed to load classrooms"}
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && classrooms.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <DoorOpen className="mb-3 h-7 w-7 text-primary" />
            <h3 className="font-semibold">No classrooms yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Register physical rooms before attaching Smart Boards and attendance terminals.
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && classrooms.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {classrooms.map((room) => (
              <Card key={room._id} className="transition-all hover:border-primary/30 hover:shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                      <DoorOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Room {room.roomNumber}</CardTitle>
                      <CardDescription>{sectionLabel(room.section)}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setEditing(room);
                      setForm({
                        roomNumber: room.roomNumber,
                        section: refId(room.section),
                      });
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    onClick={() => { setToDelete(room); setDeleteOpen(true); }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          {data && data.totalPages > 1 && (
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="mr-1 h-4 w-4" /> Previous
              </Button>
              <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Classroom" : "Add Classroom"}</DialogTitle>
            <DialogDescription>A classroom is the physical room. Devices and timetable entries attach to it.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="room-number">Room number</Label>
              <Input id="room-number" className="mt-1.5" value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} placeholder="e.g. 204" />
            </div>
            <div>
              <Label>Home section</Label>
              <Select value={form.section} onValueChange={(value) => setForm((prev) => ({ ...prev, section: value ?? "" }))}>
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section._id} value={section._id}>
                      {sectionLabel(section)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createClassroom.isPending || updateClassroom.isPending}>
              {editing ? "Update Classroom" : "Create Classroom"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteModal
        isOpen={deleteOpen}
        title="Delete Classroom"
        message={toDelete ? `Delete room ${toDelete.roomNumber}? Remove devices first if this fails.` : "Delete this classroom?"}
        onConfirm={async () => {
          if (!toDelete) return;
          try {
            await deleteClassroom.mutateAsync(toDelete._id);
            toast.success("Classroom deleted");
            setDeleteOpen(false);
            setToDelete(null);
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to delete classroom");
          }
        }}
        onCancel={() => { setDeleteOpen(false); setToDelete(null); }}
        isDeleting={deleteClassroom.isPending}
      />
    </section>
  );
}
