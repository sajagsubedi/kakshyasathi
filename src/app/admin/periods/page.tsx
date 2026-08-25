"use client";

import * as React from "react";
import { Clock, Plus, Pencil, Trash2 } from "lucide-react";
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
import { useAdminPeriods, type PeriodItem } from "@/hooks/admin/usePeriods";
import { useAdminAcademicYears } from "@/hooks/admin/useAcademicYears";

export default function AdminPeriodsPage() {
  const { data: academicYears = [] } = useAdminAcademicYears();
  const activeYear = academicYears.find((y) => y.isActive);
  const [academicYearFilter, setAcademicYearFilter] = React.useState<string>("");

  React.useEffect(() => {
    if (activeYear && !academicYearFilter) {
      setAcademicYearFilter(activeYear._id);
    }
  }, [activeYear, academicYearFilter]);

  const {
    data: periods = [],
    isLoading,
    createPeriod,
    updatePeriod,
    deletePeriod,
  } = useAdminPeriods(academicYearFilter || undefined);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<PeriodItem | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [toDelete, setToDelete] = React.useState<PeriodItem | null>(null);
  const [form, setForm] = React.useState({
    order: "",
    slotType: "period" as "period" | "break",
    periodNumber: "",
    label: "",
    startTime: "",
    endTime: "",
  });

  const resetForm = () => {
    setForm({ order: "", slotType: "period", periodNumber: "", label: "", startTime: "", endTime: "" });
    setEditing(null);
  };

  const handleSubmit = async () => {
    const order = Number(form.order);
    if (!form.order || Number.isNaN(order) || order < 1) {
      toast.error("Valid order is required");
      return;
    }
    if (!form.slotType || !["period", "break"].includes(form.slotType)) {
      toast.error("Valid slot type is required");
      return;
    }
    if (form.slotType === "period") {
      const periodNumber = Number(form.periodNumber);
      if (!form.periodNumber || Number.isNaN(periodNumber) || periodNumber < 1) {
        toast.error("Valid period number is required for period slots");
        return;
      }
    }
    if (!form.startTime || !form.endTime) {
      toast.error("Start and end time are required");
      return;
    }
    if (form.startTime >= form.endTime) {
      toast.error("Start time must be before end time");
      return;
    }
    if (!academicYearFilter) {
      toast.error("Select an academic year first");
      return;
    }

    try {
      if (editing) {
        await updatePeriod.mutateAsync({
          id: editing._id,
          payload: {
            order,
            slotType: form.slotType,
            periodNumber: form.slotType === "period" ? Number(form.periodNumber) : undefined,
            label: form.label || undefined,
            startTime: form.startTime,
            endTime: form.endTime,
          },
        });
        toast.success("Period updated successfully");
      } else {
        await createPeriod.mutateAsync({
          academicYear: academicYearFilter,
          order,
          slotType: form.slotType,
          periodNumber: form.slotType === "period" ? Number(form.periodNumber) : undefined,
          label: form.label || undefined,
          startTime: form.startTime,
          endTime: form.endTime,
        });
        toast.success("Period created successfully");
      }
      setDialogOpen(false);
      resetForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save period");
    }
  };

  const sortedPeriods = React.useMemo(
    () => [...periods].sort((a, b) => a.order - b.order),
    [periods],
  );

  return (
    <section>
      <PageHeader
        title="Global Timetable"
        description="Define periods and breaks for the school day"
        action={
          <Button
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}
            disabled={!academicYearFilter}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Slot
          </Button>
        }
      />

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

      {!academicYearFilter ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Select an academic year to view and manage periods.
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
      ) : sortedPeriods.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Clock className="mb-3 h-7 w-7 text-primary" />
            <h3 className="font-semibold">No slots defined yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Create periods and breaks to build the global timetable for this academic year.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sortedPeriods.map((period) => (
            <Card
              key={period._id}
              className="transition-all hover:border-primary/30 hover:shadow-sm"
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {period.slotType === "period"
                        ? `Period ${period.periodNumber}`
                        : period.label || `Break ${period.order}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {period.startTime} – {period.endTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditing(period);
                      setForm({
                        order: String(period.order),
                        slotType: period.slotType,
                        periodNumber: period.periodNumber ? String(period.periodNumber) : "",
                        label: period.label || "",
                        startTime: period.startTime,
                        endTime: period.endTime,
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
                      setToDelete(period);
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
              {editing ? "Edit Slot" : "Add Slot"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Update the slot timing and details."
                : "Define a new period or break for the global timetable."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="period-order">Order</Label>
                <Input
                  id="period-order"
                  type="number"
                  min={1}
                  value={form.order}
                  onChange={(e) =>
                    setForm({ ...form, order: e.target.value })
                  }
                  placeholder="e.g. 1"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="period-slot-type">Slot Type</Label>
                <Select
                  value={form.slotType}
                  onValueChange={(v) =>
                    setForm({ ...form, slotType: v as "period" | "break" })
                  }
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="period">Period</SelectItem>
                    <SelectItem value="break">Break</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {form.slotType === "period" && (
              <div>
                <Label htmlFor="period-number">Period Number</Label>
                <Input
                  id="period-number"
                  type="number"
                  min={1}
                  value={form.periodNumber}
                  onChange={(e) =>
                    setForm({ ...form, periodNumber: e.target.value })
                  }
                  placeholder="e.g. 1"
                  className="mt-1.5"
                />
              </div>
            )}
            {form.slotType === "break" && (
              <div>
                <Label htmlFor="period-label">Label</Label>
                <Input
                  id="period-label"
                  value={form.label}
                  onChange={(e) =>
                    setForm({ ...form, label: e.target.value })
                  }
                  placeholder="e.g. Lunch Break"
                  className="mt-1.5"
                />
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="period-start">Start Time</Label>
                <Input
                  id="period-start"
                  type="time"
                  value={form.startTime}
                  onChange={(e) =>
                    setForm({ ...form, startTime: e.target.value })
                  }
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="period-end">End Time</Label>
                <Input
                  id="period-end"
                  type="time"
                  value={form.endTime}
                  onChange={(e) =>
                    setForm({ ...form, endTime: e.target.value })
                  }
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createPeriod.isPending || updatePeriod.isPending}
            >
              {editing ? "Update Slot" : "Create Slot"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteModal
        isOpen={deleteOpen}
        title="Delete Slot"
        message={
          toDelete
            ? `Delete ${toDelete.slotType === "period"
              ? `Period ${toDelete.periodNumber}`
              : (toDelete.label || `Break ${toDelete.order}`)}? This cannot be undone.`
            : "Delete this slot?"
        }
        onConfirm={async () => {
          if (!toDelete) return;
          try {
            await deletePeriod.mutateAsync(toDelete._id);
            toast.success("Slot deleted successfully");
            setDeleteOpen(false);
            setToDelete(null);
          } catch (err) {
            toast.error(
              err instanceof Error ? err.message : "Failed to delete slot",
            );
          }
        }}
        onCancel={() => {
          setDeleteOpen(false);
          setToDelete(null);
        }}
        isDeleting={deletePeriod.isPending}
      />
    </section>
  );
}
