"use client";

import * as React from "react";
import { Calendar, Plus, Pencil, Trash2 } from "lucide-react";
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
import { useAdminHolidays, type HolidayItem } from "@/hooks/admin/useHolidays";
import { useAdminAcademicYears } from "@/hooks/admin/useAcademicYears";

export default function AdminHolidaysPage() {
  const { data: academicYears = [] } = useAdminAcademicYears();
  const activeYear = academicYears.find((y) => y.isActive);
  const [academicYearFilter, setAcademicYearFilter] = React.useState<string>("");

  React.useEffect(() => {
    if (activeYear && !academicYearFilter) {
      setAcademicYearFilter(activeYear._id);
    }
  }, [activeYear, academicYearFilter]);

  const {
    data: holidays = [],
    isLoading,
    createHoliday,
    updateHoliday,
    deleteHoliday,
  } = useAdminHolidays(academicYearFilter || undefined);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<HolidayItem | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [toDelete, setToDelete] = React.useState<HolidayItem | null>(null);
  const [form, setForm] = React.useState({
    date: "",
    title: "",
    type: "holiday" as "holiday" | "workingDay",
  });

  const resetForm = () => {
    setForm({ date: "", title: "", type: "holiday" });
    setEditing(null);
  };

  const handleSubmit = async () => {
    if (!form.date) {
      toast.error("Date is required");
      return;
    }
    if (!form.title) {
      toast.error("Title is required");
      return;
    }
    if (!academicYearFilter) {
      toast.error("Select an academic year first");
      return;
    }

    try {
      if (editing) {
        await updateHoliday.mutateAsync({
          id: editing._id,
          payload: {
            date: form.date,
            title: form.title,
            type: form.type,
          },
        });
        toast.success("Holiday updated successfully");
      } else {
        await createHoliday.mutateAsync({
          academicYear: academicYearFilter,
          date: form.date,
          title: form.title,
          type: form.type,
        });
        toast.success("Holiday created successfully");
      }
      setDialogOpen(false);
      resetForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save holiday");
    }
  };

  const sortedHolidays = React.useMemo(
    () => [...holidays].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [holidays],
  );

  return (
    <section>
      <PageHeader
        title="Holidays"
        description="Manage holidays and working days for the academic year"
        action={
          <Button
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}
            disabled={!academicYearFilter}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Holiday
          </Button>
        }
      />

      <div className="mb-4">
        <Select
          value={academicYearFilter || undefined}
          onValueChange={(value) => {
            setAcademicYearFilter(value as string);
          }}
        >
          <SelectTrigger className="w-full sm:w-80">
            {academicYearFilter ? (
              <span>
                {academicYears.find(
                  (year) => String(year._id) === String(academicYearFilter)
                )?.label ?? "Select academic year"}
                {academicYears.find(
                  (year) => String(year._id) === String(academicYearFilter)
                )?.isActive
                  ? " (Active)"
                  : ""}
              </span>
            ) : (
              <span className="text-muted-foreground">
                Select academic year
              </span>
            )}
          </SelectTrigger>

          <SelectContent>
            {academicYears.map((year) => (
              <SelectItem
                key={String(year._id)}
                value={String(year._id)}
              >
                {year.label}
                {year.isActive ? " (Active)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

      </div>

      {!academicYearFilter ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Select an academic year to view and manage holidays.
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="h-24 animate-pulse bg-muted/40" />
            </Card>
          ))}
        </div>
      ) : sortedHolidays.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="mb-3 h-7 w-7 text-primary" />
            <h3 className="font-semibold">No holidays defined yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add holidays to manage the academic calendar for this year.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sortedHolidays.map((holiday) => (
            <Card
              key={holiday._id}
              className="transition-all hover:border-primary/30 hover:shadow-sm"
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{holiday.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(holiday.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={holiday.type === "holiday" ? "default" : "secondary"}>
                    {holiday.type === "holiday" ? "Holiday" : "Working Day"}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditing(holiday);
                        setForm({
                          date: holiday.date.split("T")[0],
                          title: holiday.title,
                          type: holiday.type,
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
                        setToDelete(holiday);
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
              {editing ? "Edit Holiday" : "Add Holiday"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Update the holiday details."
                : "Add a new holiday or working day to the academic calendar."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="holiday-date">Date</Label>
              <Input
                id="holiday-date"
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm({ ...form, date: e.target.value })
                }
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="holiday-title">Title</Label>
              <Input
                id="holiday-title"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                placeholder="e.g. Christmas Day"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="holiday-type">Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) =>
                  setForm({ ...form, type: v as "holiday" | "workingDay" })
                }
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="holiday">Holiday</SelectItem>
                  <SelectItem value="workingDay">Working Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createHoliday.isPending || updateHoliday.isPending}
            >
              {editing ? "Update Holiday" : "Create Holiday"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteModal
        isOpen={deleteOpen}
        title="Delete Holiday"
        message={
          toDelete
            ? `Delete "${toDelete.title}"? This cannot be undone.`
            : "Delete this holiday?"
        }
        onConfirm={async () => {
          if (!toDelete) return;
          try {
            await deleteHoliday.mutateAsync(toDelete._id);
            toast.success("Holiday deleted successfully");
            setDeleteOpen(false);
            setToDelete(null);
          } catch (err) {
            toast.error(
              err instanceof Error ? err.message : "Failed to delete holiday",
            );
          }
        }}
        onCancel={() => {
          setDeleteOpen(false);
          setToDelete(null);
        }}
        isDeleting={deleteHoliday.isPending}
      />
    </section>
  );
}