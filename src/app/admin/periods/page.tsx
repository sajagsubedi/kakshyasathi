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
    periodNumber: "",
    startTime: "",
    endTime: "",
  });

  const resetForm = () => {
    setForm({ periodNumber: "", startTime: "", endTime: "" });
    setEditing(null);
  };

  const handleSubmit = async () => {
    const periodNumber = Number(form.periodNumber);
    if (!form.periodNumber || Number.isNaN(periodNumber) || periodNumber < 1) {
      toast.error("Valid period number is required");
      return;
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
            periodNumber,
            startTime: form.startTime,
            endTime: form.endTime,
          },
        });
        toast.success("Period updated successfully");
      } else {
        await createPeriod.mutateAsync({
          academicYear: academicYearFilter,
          periodNumber,
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
    () => [...periods].sort((a, b) => a.periodNumber - b.periodNumber),
    [periods],
  );

  return (
    <section>
      <PageHeader
        title="Global Timetable"
        description="Define the period timings for the school day"
        action={
          <Button
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}
            disabled={!academicYearFilter}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Period
          </Button>
        }
      />

      <div className="mb-4">
        <Select
          value={academicYearFilter || null}
          onValueChange={(v) => setAcademicYearFilter(v ?? "")}
        >
          <SelectTrigger className="w-full sm:w-80">
            <SelectValue placeholder="Select academic year" />
          </SelectTrigger>
          <SelectContent>
            {academicYears.map((y) => (
              <SelectItem key={y._id} value={y._id}>
                {y.label}
                {y.isActive ? " (Active)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
            <h3 className="font-semibold">No periods defined yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Create periods to build the global timetable for this academic year.
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
                      Period {period.periodNumber}
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
                        periodNumber: String(period.periodNumber),
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
              {editing ? "Edit Period" : "Add Period"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Update the period timing."
                : "Define a new period for the global timetable."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
              {editing ? "Update Period" : "Create Period"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteModal
        isOpen={deleteOpen}
        title="Delete Period"
        message={
          toDelete
            ? `Delete Period ${toDelete.periodNumber}? This cannot be undone.`
            : "Delete this period?"
        }
        onConfirm={async () => {
          if (!toDelete) return;
          try {
            await deletePeriod.mutateAsync(toDelete._id);
            toast.success("Period deleted successfully");
            setDeleteOpen(false);
            setToDelete(null);
          } catch (err) {
            toast.error(
              err instanceof Error ? err.message : "Failed to delete period",
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
