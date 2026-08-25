"use client";

import * as React from "react";
import { Calendar, Plus, Pencil, Trash2, Check, X } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DeleteModal from "@/components/shared/DeleteModal";
import { useAdminTeacherLeaves, type TeacherLeaveItem } from "@/hooks/admin/useTeacherLeaves";
import { useAdminTeachers } from "@/hooks/admin/useTeachers";

export default function AdminTeacherLeavesPage() {
  const { data: teachersData } = useAdminTeachers();
  const teachers = teachersData?.items || [];
  const [teacherFilter, setTeacherFilter] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState<string>("");

  const {
    data: leaves = [],
    isLoading,
    createTeacherLeave,
    updateTeacherLeave,
    deleteTeacherLeave,
    reviewTeacherLeave,
  } = useAdminTeacherLeaves(
    teacherFilter || statusFilter
      ? {
          teacher: teacherFilter || undefined,
          status: statusFilter as "pending" | "approved" | "rejected" || undefined,
        }
      : undefined,
  );

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<TeacherLeaveItem | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [toDelete, setToDelete] = React.useState<TeacherLeaveItem | null>(null);
  const [form, setForm] = React.useState({
    teacher: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });

  const resetForm = () => {
    setForm({ teacher: "", fromDate: "", toDate: "", reason: "" });
    setEditing(null);
  };

  const handleSubmit = async () => {
    if (!form.teacher) {
      toast.error("Teacher is required");
      return;
    }
    if (!form.fromDate) {
      toast.error("From date is required");
      return;
    }
    if (!form.toDate) {
      toast.error("To date is required");
      return;
    }
    if (!form.reason) {
      toast.error("Reason is required");
      return;
    }

    try {
      if (editing) {
        await updateTeacherLeave.mutateAsync({
          id: editing._id,
          payload: {
            fromDate: form.fromDate,
            toDate: form.toDate,
            reason: form.reason,
          },
        });
        toast.success("Teacher leave updated successfully");
      } else {
        await createTeacherLeave.mutateAsync({
          teacher: form.teacher,
          fromDate: form.fromDate,
          toDate: form.toDate,
          reason: form.reason,
        });
        toast.success("Teacher leave created successfully");
      }
      setDialogOpen(false);
      resetForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save teacher leave");
    }
  };

  const handleReview = async (id: string, status: "approved" | "rejected") => {
    try {
      await reviewTeacherLeave.mutateAsync({ id, status });
      toast.success(`Teacher leave ${status} successfully`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to review teacher leave");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "approved":
        return <Badge variant="default" className="bg-green-500">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find((t) => t._id === teacherId);
    return teacher?.user?.name || "Unknown Teacher";
  };

  const sortedLeaves = React.useMemo(
    () => [...leaves].sort((a, b) => new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime()),
    [leaves],
  );

  return (
    <section>
      <PageHeader
        title="Teacher Leaves"
        description="Manage teacher leave requests and approvals"
        action={
          <Button
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Leave Request
          </Button>
        }
      />

      <div className="mb-4 flex gap-4">
        <Select
          value={teacherFilter || null}
          onValueChange={(v) => setTeacherFilter(v ?? "")}
        >
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Filter by teacher" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Teachers</SelectItem>
            {teachers.map((t) => (
              <SelectItem key={t._id} value={t._id}>
                {t.user?.name || "Unknown"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter || null}
          onValueChange={(v) => setStatusFilter(v ?? "")}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="h-32 animate-pulse bg-muted/40" />
            </Card>
          ))}
        </div>
      ) : sortedLeaves.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="mb-3 h-7 w-7 text-primary" />
            <h3 className="font-semibold">No leave requests found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {teacherFilter || statusFilter
                ? "Try adjusting your filters or add a new leave request."
                : "Add leave requests to manage teacher absences."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sortedLeaves.map((leave) => (
            <Card
              key={leave._id}
              className="transition-all hover:border-primary/30 hover:shadow-sm"
            >
              <CardContent className="flex flex-col p-4">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        {typeof leave.teacher === "object" && leave.teacher.user
                          ? leave.teacher.user.name
                          : getTeacherName(leave.teacher as string)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(leave.fromDate).toLocaleDateString()} –{" "}
                        {new Date(leave.toDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(leave.status)}
                </div>

                <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                  {leave.reason}
                </p>

                {leave.reviewedBy && (
                  <p className="mb-3 text-xs text-muted-foreground">
                    Reviewed by:{" "}
                    {typeof leave.reviewedBy === "object"
                      ? leave.reviewedBy.name
                      : "Admin"}
                  </p>
                )}

                <div className="mt-auto flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {leave.status === "pending" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleReview(leave._id, "approved")}
                          disabled={reviewTeacherLeave.isPending}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleReview(leave._id, "rejected")}
                          disabled={reviewTeacherLeave.isPending}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditing(leave);
                        setForm({
                          teacher: typeof leave.teacher === "object" ? leave.teacher._id : leave.teacher,
                          fromDate: leave.fromDate.split("T")[0],
                          toDate: leave.toDate.split("T")[0],
                          reason: leave.reason,
                        });
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
                        setToDelete(leave);
                        setDeleteOpen(true);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Leave Request" : "Add Leave Request"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Update the leave request details."
                : "Submit a new leave request for a teacher."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="leave-teacher">Teacher</Label>
              <Select
                value={form.teacher || undefined}
                onValueChange={(v) => setForm({ ...form, teacher: v || "" })}
                disabled={!!editing}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t._id} value={t._id}>
                      {t.user?.name || "Unknown"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="leave-from">From Date</Label>
                <Input
                  id="leave-from"
                  type="date"
                  value={form.fromDate}
                  onChange={(e) =>
                    setForm({ ...form, fromDate: e.target.value })
                  }
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="leave-to">To Date</Label>
                <Input
                  id="leave-to"
                  type="date"
                  value={form.toDate}
                  onChange={(e) =>
                    setForm({ ...form, toDate: e.target.value })
                  }
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="leave-reason">Reason</Label>
              <Input
                id="leave-reason"
                value={form.reason}
                onChange={(e) =>
                  setForm({ ...form, reason: e.target.value })
                }
                placeholder="e.g. Medical leave"
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createTeacherLeave.isPending || updateTeacherLeave.isPending}
            >
              {editing ? "Update Leave" : "Create Leave"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteModal
        isOpen={deleteOpen}
        title="Delete Leave Request"
        message={
          toDelete
            ? `Delete this leave request? This cannot be undone.`
            : "Delete this leave request?"
        }
        onConfirm={async () => {
          if (!toDelete) return;
          try {
            await deleteTeacherLeave.mutateAsync(toDelete._id);
            toast.success("Leave request deleted successfully");
            setDeleteOpen(false);
            setToDelete(null);
          } catch (err) {
            toast.error(
              err instanceof Error ? err.message : "Failed to delete leave request",
            );
          }
        }}
        onCancel={() => {
          setDeleteOpen(false);
          setToDelete(null);
        }}
        isDeleting={deleteTeacherLeave.isPending}
      />
    </section>
  );
}