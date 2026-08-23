"use client";

import * as React from "react";
import { BookOpen, Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
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
import DeleteModal from "@/components/shared/DeleteModal";
import {
  useAdminSubjects,
  type SubjectItem,
} from "@/hooks/admin/useSubjects";

export default function AdminSubjectsPage() {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [searchInput, setSearchInput] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SubjectItem | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [toDelete, setToDelete] = React.useState<SubjectItem | null>(null);
  const [form, setForm] = React.useState({ name: "", code: "" });

  const {
    data,
    isLoading,
    isError,
    error,
    createSubject,
    updateSubject,
    deleteSubject,
  } = useAdminSubjects({ search: search || undefined, page, limit: 12 });

  const subjects = data?.items ?? [];

  const resetForm = () => {
    setForm({ name: "", code: "" });
    setEditing(null);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Subject name is required");
      return;
    }
    if (!form.code.trim()) {
      toast.error("Subject code is required");
      return;
    }

    try {
      if (editing) {
        await updateSubject.mutateAsync({
          id: editing._id,
          payload: { name: form.name.trim(), code: form.code.trim() },
        });
        toast.success("Subject updated successfully");
      } else {
        await createSubject.mutateAsync({
          name: form.name.trim(),
          code: form.code.trim(),
        });
        toast.success("Subject created successfully");
      }
      setDialogOpen(false);
      resetForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save subject");
    }
  };

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteSubject.mutateAsync(toDelete._id);
      toast.success("Subject deleted successfully");
      setDeleteOpen(false);
      setToDelete(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete subject");
    }
  };

  return (
    <section>
      <PageHeader
        title="Subjects"
        description={data ? `${data.total} ${data.total === 1 ? "subject" : "subjects"}` : "Manage school subjects"}
        action={
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Subject
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
            placeholder="Search subjects..."
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setPage(1);
            setSearch(searchInput.trim());
          }}
        >
          Search
        </Button>
      </div>

      {isLoading && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="h-20 animate-pulse bg-muted/40" />
            </Card>
          ))}
        </div>
      )}

      {isError && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Failed to load subjects"}
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && subjects.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="mb-3 h-7 w-7 text-primary" />
            <h3 className="font-semibold">No subjects yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Create subjects before assigning teachers and timetable entries.
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && subjects.length > 0 && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <Card key={subject._id} className="transition-all hover:border-primary/30 hover:shadow-sm">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{subject.name}</p>
                      <p className="text-xs text-muted-foreground">{subject.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline">{subject.code}</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditing(subject);
                        setForm({ name: subject.name, code: subject.code });
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                      onClick={() => {
                        setToDelete(subject);
                        setDeleteOpen(true);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {data && data.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {data.page} of {data.totalPages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Subject" : "Add Subject"}</DialogTitle>
            <DialogDescription>Subjects are used in teacher assignments and section timetables.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject-name">Name</Label>
              <Input id="subject-name" className="mt-1.5" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Mathematics" />
            </div>
            <div>
              <Label htmlFor="subject-code">Code</Label>
              <Input id="subject-code" className="mt-1.5" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. MATH01" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createSubject.isPending || updateSubject.isPending}>
              {editing ? "Update Subject" : "Create Subject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteModal
        isOpen={deleteOpen}
        title="Delete Subject"
        message={toDelete ? `Delete "${toDelete.name}"? This cannot be undone.` : "Delete this subject?"}
        onConfirm={handleConfirmDelete}
        onCancel={() => { setDeleteOpen(false); setToDelete(null); }}
        isDeleting={deleteSubject.isPending}
      />
    </section>
  );
}
