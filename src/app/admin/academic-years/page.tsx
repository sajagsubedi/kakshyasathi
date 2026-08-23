"use client";

import * as React from "react";
import {
    CalendarDays,
    Plus,
    CheckCircle2,
    Circle,
    Pencil,
    Trash2,
    Power,
    Clock3,
} from "lucide-react";
import { toast } from "react-toastify";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/shared/PageHeader";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";

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
    useAdminAcademicYears,
    type AcademicYear,
} from "@/hooks/admin/useAcademicYears";

export default function AdminAcademicYearsPage() {
    const {
        data: academicYears = [],
        isLoading,
        createAcademicYear,
        updateAcademicYear,
        deleteAcademicYear,
        activateAcademicYear,
    } = useAdminAcademicYears();

    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [editingYear, setEditingYear] =
        React.useState<AcademicYear | null>(null);

    const [form, setForm] = React.useState({
        label: "",
        startDate: "",
        endDate: "",
    });

    const resetForm = () => {
        setForm({
            label: "",
            startDate: "",
            endDate: "",
        });

        setEditingYear(null);
    };

    const openCreateDialog = () => {
        resetForm();
        setDialogOpen(true);
    };

    const openEditDialog = (year: AcademicYear) => {
        setEditingYear(year);

        setForm({
            label: year.label,
            startDate: formatDateForInput(year.startDate),
            endDate: formatDateForInput(year.endDate),
        });

        setDialogOpen(true);
    };

    const handleDialogChange = (open: boolean) => {
        setDialogOpen(open);

        if (!open) {
            resetForm();
        }
    };

    const handleSubmit = async () => {
        if (!form.label.trim()) {
            toast.error("Academic year label is required");
            return;
        }

        if (!form.startDate) {
            toast.error("Start date is required");
            return;
        }

        if (!form.endDate) {
            toast.error("End date is required");
            return;
        }

        if (new Date(form.startDate) >= new Date(form.endDate)) {
            toast.error("End date must be after start date");
            return;
        }

        try {
            if (editingYear) {
                await updateAcademicYear.mutateAsync({
                    id: editingYear._id,
                    payload: {
                        label: form.label.trim(),
                        startDate: form.startDate,
                        endDate: form.endDate,
                    },
                });

                toast.success("Academic year updated successfully");
            } else {
                await createAcademicYear.mutateAsync({
                    label: form.label.trim(),
                    startDate: form.startDate,
                    endDate: form.endDate,
                });

                toast.success("Academic year created successfully");
            }

            setDialogOpen(false);
            resetForm();
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : editingYear
                        ? "Failed to update academic year"
                        : "Failed to create academic year",
            );
        }
    };

    const handleActivate = async (year: AcademicYear) => {
        if (year.isActive) return;

        const confirmed = window.confirm(
            `Set "${year.label}" as the active academic year?`,
        );

        if (!confirmed) return;

        try {
            await activateAcademicYear.mutateAsync(year._id);
            toast.success(`${year.label} is now the active academic year`);
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Failed to activate academic year",
            );
        }
    };

    const handleDelete = async (year: AcademicYear) => {
        if (year.isActive) {
            toast.error("The active academic year cannot be deleted");
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete "${year.label}"? This action cannot be undone.`,
        );

        if (!confirmed) return;

        try {
            await deleteAcademicYear.mutateAsync(year._id);
            toast.success("Academic year deleted successfully");
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Failed to delete academic year",
            );
        }
    };

    return (
        <section

        >
            <PageHeader
                title="Academic Years"
                description={`${academicYears.length} academic ${academicYears.length === 1 ? "year" : "years"
                    }`}
                action={
                    <Button onClick={openCreateDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Academic Year
                    </Button>
                }
            />

            {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Card key={index}>
                            <CardHeader>
                                <div className="h-5 w-32 animate-pulse rounded bg-muted" />
                                <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                            </CardHeader>

                            <CardContent className="space-y-3">
                                <div className="h-10 animate-pulse rounded bg-muted" />
                                <div className="h-10 animate-pulse rounded bg-muted" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : academicYears.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                            <CalendarDays className="h-7 w-7 text-primary" />
                        </div>

                        <h3 className="text-base font-semibold">
                            No academic years yet
                        </h3>

                        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                            Create your first academic year to start managing school
                            sessions.
                        </p>

                        <Button className="mt-5" onClick={openCreateDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Academic Year
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {academicYears.map((year) => (
                        <AcademicYearCard
                            key={year._id}
                            year={year}
                            onEdit={() => openEditDialog(year)}
                            onActivate={() => handleActivate(year)}
                            onDelete={() => handleDelete(year)}
                            isActivating={activateAcademicYear.isPending}
                            isDeleting={deleteAcademicYear.isPending}
                        />
                    ))}
                </div>
            )}

            <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingYear
                                ? "Edit Academic Year"
                                : "Add Academic Year"}
                        </DialogTitle>

                        <DialogDescription>
                            {editingYear
                                ? "Update the academic year information."
                                : "Create a new academic year for your school."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="academic-year-label">
                                Academic Year
                            </Label>

                            <Input
                                id="academic-year-label"
                                value={form.label}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        label: e.target.value,
                                    })
                                }
                                placeholder="e.g. 2026/27"
                                className="mt-1.5"
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="academic-year-start">
                                    Start Date
                                </Label>

                                <Input
                                    id="academic-year-start"
                                    type="date"
                                    value={form.startDate}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            startDate: e.target.value,
                                        })
                                    }
                                    className="mt-1.5"
                                />
                            </div>

                            <div>
                                <Label htmlFor="academic-year-end">
                                    End Date
                                </Label>

                                <Input
                                    id="academic-year-end"
                                    type="date"
                                    value={form.endDate}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            endDate: e.target.value,
                                        })
                                    }
                                    className="mt-1.5"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDialogOpen(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            onClick={handleSubmit}
                            disabled={
                                createAcademicYear.isPending ||
                                updateAcademicYear.isPending
                            }
                        >
                            {createAcademicYear.isPending ||
                                updateAcademicYear.isPending
                                ? editingYear
                                    ? "Updating..."
                                    : "Creating..."
                                : editingYear
                                    ? "Update Academic Year"
                                    : "Create Academic Year"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </section>
    );
}

interface AcademicYearCardProps {
    year: AcademicYear;
    onEdit: () => void;
    onActivate: () => void;
    onDelete: () => void;
    isActivating: boolean;
    isDeleting: boolean;
}

function AcademicYearCard({
    year,
    onEdit,
    onActivate,
    onDelete,
    isActivating,
    isDeleting,
}: AcademicYearCardProps) {
    return (
        <Card
            className={`group transition-all hover:shadow-md ${year.isActive
                ? "border-primary/40 bg-primary/[0.02]"
                : "hover:border-primary/30"
                }`}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                        <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${year.isActive
                                ? "bg-primary/15"
                                : "bg-muted"
                                }`}
                        >
                            <CalendarDays
                                className={`h-5 w-5 ${year.isActive
                                    ? "text-primary"
                                    : "text-muted-foreground"
                                    }`}
                            />
                        </div>

                        <div className="min-w-0">
                            <CardTitle className="flex items-center gap-2 text-base">
                                {year.label}

                                {year.isActive && (
                                    <Badge
                                        variant="default"
                                        className="gap-1 text-[10px]"
                                    >
                                        <CheckCircle2 className="h-3 w-3" />
                                        Active
                                    </Badge>
                                )}
                            </CardTitle>

                            <CardDescription className="mt-1">
                                {formatDate(year.startDate)} –{" "}
                                {formatDate(year.endDate)}
                            </CardDescription>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                <div className="rounded-lg border bg-muted/30 px-3 py-2.5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock3 className="h-3.5 w-3.5" />
                        Duration
                    </div>

                    <p className="mt-1 text-sm font-medium">
                        {formatDuration(year.startDate, year.endDate)}
                    </p>
                </div>

                <div className="flex gap-2">
                    {!year.isActive && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={onActivate}
                            disabled={isActivating}
                        >
                            <Power className="mr-1.5 h-3.5 w-3.5" />
                            {isActivating ? "Activating..." : "Set Active"}
                        </Button>
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        className={year.isActive ? "flex-1" : ""}
                        onClick={onEdit}
                    >
                        <Pencil className="mr-1.5 h-3.5 w-3.5" />
                        Edit
                    </Button>

                    {!year.isActive && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={onDelete}
                            disabled={isDeleting}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function formatDate(date: string) {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(date));
}

function formatDateForInput(date: string) {
    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return "";
    }

    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatDuration(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const days = Math.ceil(
        (end.getTime() - start.getTime()) /
        (1000 * 60 * 60 * 24),
    );

    if (days < 30) {
        return `${days} days`;
    }

    const months = Math.round(days / 30.44);

    if (months < 12) {
        return `${months} months`;
    }

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (remainingMonths === 0) {
        return `${years} ${years === 1 ? "year" : "years"}`;
    }

    return `${years}y ${remainingMonths}m`;
}