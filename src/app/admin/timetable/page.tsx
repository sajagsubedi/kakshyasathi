"use client";

import * as React from "react";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  useAdminTimetable,
  type TimetableEntry,
} from "@/hooks/admin/useTimetable";
import { useAdminPeriods, type PeriodItem } from "@/hooks/admin/usePeriods";
import { useAdminSections } from "@/hooks/admin/useSections";
import { useAdminSubjects } from "@/hooks/admin/useSubjects";
import { useAdminTeachers } from "@/hooks/admin/useTeachers";
import { useAdminClassrooms } from "@/hooks/admin/useClassrooms";
import { DayOfWeek } from "@/types";
import { sectionLabel, refId, teacherName, classroomLabel } from "@/lib/adminDisplay";

const DAYS: DayOfWeek[] = [
  DayOfWeek.sunday,
  DayOfWeek.monday,
  DayOfWeek.tuesday,
  DayOfWeek.wednesday,
  DayOfWeek.thursday,
  DayOfWeek.friday,
  DayOfWeek.saturday,
];

const DAY_NAMES: Record<DayOfWeek, string> = {
  [DayOfWeek.sunday]: "Sunday",
  [DayOfWeek.monday]: "Monday",
  [DayOfWeek.tuesday]: "Tuesday",
  [DayOfWeek.wednesday]: "Wednesday",
  [DayOfWeek.thursday]: "Thursday",
  [DayOfWeek.friday]: "Friday",
  [DayOfWeek.saturday]: "Saturday",
};

function subjectNameOf(sub: TimetableEntry["subject"]): string {
  if (!sub || typeof sub === "string") return "Unknown";
  return sub.name;
}

export default function AdminTimetablePage() {
  const { data: sectionsData } = useAdminSections({ limit: 100 });
  const sections = sectionsData?.items ?? [];

  const [selectedSection, setSelectedSection] = React.useState<string>("");
  React.useEffect(() => {
    if (sections[0] && !selectedSection) {
      setSelectedSection(sections[0]._id);
    }
  }, [sections, selectedSection]);

  const {
    data: timetable = [],
    createEntry,
    deleteEntry,
  } = useAdminTimetable(selectedSection || undefined);

  const { data: periods = [] } = useAdminPeriods();
  const { data: subjectsData } = useAdminSubjects({ limit: 100 });
  const subjects = subjectsData?.items ?? [];
  const { data: teachersData } = useAdminTeachers(100);
  const teachers = teachersData?.items ?? [];
  const { data: classroomsData } = useAdminClassrooms({ limit: 100 });
  const classrooms = classroomsData?.items ?? [];

  const resolvedSection = sections.find((s) => s._id === selectedSection);
  const resolvedSectionLabel = resolvedSection
    ? sectionLabel(resolvedSection)
    : "Select a section";

  const getEntry = (day: DayOfWeek, periodNumber: number) =>
    timetable.find(
      (t) => t.dayOfWeek === day && t.periodNumber === periodNumber
    );

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [form, setForm] = React.useState<{
    dayOfWeek: DayOfWeek;
    periodNumber: number;
    subject: string;
    teacher: string;
    classroom: string;
    customStartTime: string;
    customEndTime: string;
  }>({
    dayOfWeek: DayOfWeek.sunday,
    periodNumber: 0,
    subject: "",
    teacher: "",
    classroom: "",
    customStartTime: "",
    customEndTime: "",
  });

  const resetForm = () => {
    setForm({
      dayOfWeek: DayOfWeek.sunday,
      periodNumber: periods[0]?.periodNumber ?? 0,
      subject: "",
      teacher: "",
      classroom: "",
      customStartTime: "",
      customEndTime: "",
    });
  };

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) resetForm();
  };

  const handleCreate = async () => {
    if (!selectedSection) {
      toast.error("Please select a section first");
      return;
    }
    if (!form.periodNumber || !form.subject || !form.teacher || !form.classroom) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await createEntry.mutateAsync({
        section: selectedSection,
        dayOfWeek: form.dayOfWeek,
        periodNumber: form.periodNumber,
        subject: form.subject,
        teacher: form.teacher,
        classroom: form.classroom,
        customStartTime: form.customStartTime.trim() || undefined,
        customEndTime: form.customEndTime.trim() || undefined,
      });
      toast.success("Timetable entry added successfully");
      setDialogOpen(false);
      resetForm();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to add timetable entry"
      );
    }
  };

  const handleDelete = async (entry: TimetableEntry) => {
    if (!window.confirm("Delete this timetable entry?")) return;
    try {
      await deleteEntry.mutateAsync(entry._id);
      toast.success("Entry deleted");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete entry"
      );
    }
  };

  const periodsSorted = React.useMemo(
    () => [...periods].sort((a, b) => a.periodNumber - b.periodNumber),
    [periods]
  );

  return (
    <section>
      <PageHeader
        title="Section Timetable"
        description={resolvedSectionLabel}
        action={
          <Button
            onClick={() => {
              resetForm();
              if (periodsSorted[0]) {
                setForm((f) => ({
                  ...f,
                  periodNumber: periodsSorted[0].periodNumber,
                }));
              }
              setDialogOpen(true);
            }}
            disabled={!selectedSection}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Entry
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <Select
          value={selectedSection ?? ""}
          onValueChange={(v) => setSelectedSection(v ?? "")}
        >
          <SelectTrigger className="w-full sm:w-80">
            <SelectValue placeholder="Select section" />
          </SelectTrigger>
          <SelectContent>
            {sections.map((s) => (
              <SelectItem key={s._id} value={s._id}>
                {sectionLabel(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedSection && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Select a section above to view its timetable.
          </CardContent>
        </Card>
      )}

      {selectedSection && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              Weekly Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {periodsSorted.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No periods defined yet. Create periods first to build the
                timetable grid.
              </div>
            ) : (
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left min-w-[120px]">Period</th>
                    {DAYS.map((d) => (
                      <th key={d} className="p-2 text-left min-w-[140px]">
                        {DAY_NAMES[d]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {periodsSorted.map((period) => (
                    <tr key={period._id} className="border-b">
                      <td className="p-2 font-medium align-top">
                        P{period.periodNumber}
                        <br />
                        <span className="text-xs text-muted-foreground">
                          {period.startTime}–{period.endTime}
                        </span>
                      </td>
                      {DAYS.map((day) => {
                        const entry = getEntry(day, period.periodNumber);
                        return (
                          <td key={day} className="p-2 align-top">
                            {entry ? (
                              <div className="group/tt relative rounded-lg border bg-muted/30 p-2 transition-colors hover:bg-muted/60">
                                <p className="text-xs font-medium">
                                  {subjectNameOf(entry.subject)}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  {teacherName(entry.teacher)}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                  {classroomLabel(entry.classroom)}
                                </p>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-1 top-1 h-6 w-6 opacity-0 transition-opacity group-hover/tt:opacity-100 text-muted-foreground hover:text-destructive"
                                  onClick={() => handleDelete(entry)}
                                  disabled={deleteEntry.isPending}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-[10px]"
                              >
                                Free
                              </Badge>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Timetable Entry</DialogTitle>
            <DialogDescription>
              Create a new timetable entry for the selected section.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tt-day">Day of Week</Label>
              <Select
                value={form.dayOfWeek}
                onValueChange={(v) =>
                  setForm({ ...form, dayOfWeek: (v as DayOfWeek) ?? DayOfWeek.sunday })
                }
              >
                <SelectTrigger id="tt-day" className="mt-1.5">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {DAY_NAMES[d]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tt-period">Period</Label>
              <Select
                value={form.periodNumber ? String(form.periodNumber) : ""}
                onValueChange={(v) =>
                  setForm({
                    ...form,
                    periodNumber: Number(v ?? 0),
                  })
                }
              >
                <SelectTrigger id="tt-period" className="mt-1.5">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {periodsSorted.map((p) => (
                    <SelectItem key={p._id} value={String(p.periodNumber)}>
                      P{p.periodNumber} ({p.startTime}–{p.endTime})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tt-subject">Subject</Label>
              <Select
                value={form.subject}
                onValueChange={(v) => setForm({ ...form, subject: v ?? "" })}
              >
                <SelectTrigger id="tt-subject" className="mt-1.5">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      {s.name} ({s.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tt-teacher">Teacher</Label>
              <Select
                value={form.teacher}
                onValueChange={(v) => setForm({ ...form, teacher: v ?? "" })}
              >
                <SelectTrigger id="tt-teacher" className="mt-1.5">
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t._id} value={t._id}>
                      {t.user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tt-classroom">Classroom</Label>
              <Select
                value={form.classroom}
                onValueChange={(v) => setForm({ ...form, classroom: v ?? "" })}
              >
                <SelectTrigger id="tt-classroom" className="mt-1.5">
                  <SelectValue placeholder="Select classroom" />
                </SelectTrigger>
                <SelectContent>
                  {classrooms.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {classroomLabel(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="tt-start">Custom Start (optional)</Label>
                <Input
                  id="tt-start"
                  type="time"
                  value={form.customStartTime}
                  onChange={(e) =>
                    setForm({ ...form, customStartTime: e.target.value })
                  }
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="tt-end">Custom End (optional)</Label>
                <Input
                  id="tt-end"
                  type="time"
                  value={form.customEndTime}
                  onChange={(e) =>
                    setForm({ ...form, customEndTime: e.target.value })
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
              onClick={handleCreate}
              disabled={createEntry.isPending}
            >
              {createEntry.isPending ? "Adding..." : "Add Entry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
