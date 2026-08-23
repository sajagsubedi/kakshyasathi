"use client";

import * as React from "react";
import {
  Building2,
  Plus,
  GraduationCap,
  ChevronRight,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import DeleteModal from "@/components/shared/DeleteModal";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  useAdminClasses,
  type ClassItem,
} from "@/hooks/admin/useClasses";

import { useAdminSections } from "@/hooks/admin/useSections";

import {
  useAdminAcademicYears,
} from "@/hooks/admin/useAcademicYears";

export default function AdminClassesPage() {
  const router = useRouter();

  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [searchInput, setSearchInput] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingClass, setEditingClass] =
    React.useState<ClassItem | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] =
    React.useState(false);

  const [classToDelete, setClassToDelete] =
    React.useState<ClassItem | null>(null);

  const [form, setForm] = React.useState({
    name: "",
    grade: "",
    academicYear: "",
  });

  /*
   * -------------------------------------------------------
   * Classes
   * -------------------------------------------------------
   */

  const {
    data,
    isLoading,
    isError,
    error,
    createClass,
    updateClass,
    deleteClass,
  } = useAdminClasses({
    search: search || undefined,
    page,
    limit: 12,
  });

  const classes = data?.items ?? [];

  /*
  * -------------------------------------------------------
  * Sections
  * -------------------------------------------------------
  */

  const { data: sectionsData } = useAdminSections({
    limit: 100,
  });

  const sections = sectionsData?.items ?? [];
  /*
   * -------------------------------------------------------
   * Academic Years
   * -------------------------------------------------------
   */

  const {
    data: academicYears = [],
    isLoading: isLoadingAcademicYears,
  } = useAdminAcademicYears();

  /*
   * -------------------------------------------------------
   * Search
   * -------------------------------------------------------
   */

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  /*
   * -------------------------------------------------------
   * Dialog
   * -------------------------------------------------------
   */

  const resetForm = () => {
    setForm({
      name: "",
      grade: "",
      academicYear: "",
    });

    setEditingClass(null);
  };

  const openCreateDialog = () => {
    setEditingClass(null);

    /*
     * Automatically select the active academic year
     * when creating a new class.
     */
    const activeYear = academicYears.find(
      (year) => year.isActive,
    );

    setForm({
      name: "",
      grade: "",
      academicYear: activeYear?._id ?? "",
    });

    setDialogOpen(true);
  };

  const openEditDialog = (classItem: ClassItem) => {
    setEditingClass(classItem);

    setForm({
      name: classItem.name,
      grade: String(classItem.grade),
      academicYear: classItem.academicYear,
    });

    setDialogOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);

    if (!open) {
      resetForm();
    }
  };

  /*
   * -------------------------------------------------------
   * Create / Update
   * -------------------------------------------------------
   */

  const handleSubmit = async () => {
    const name = form.name.trim();
    const grade = Number(form.grade);
    const academicYear = form.academicYear;

    if (!name) {
      toast.error("Class name is required");
      return;
    }

    if (!form.grade || Number.isNaN(grade)) {
      toast.error("Valid grade is required");
      return;
    }

    if (grade < 1) {
      toast.error("Grade must be greater than 0");
      return;
    }

    if (!academicYear) {
      toast.error("Academic year is required");
      return;
    }

    try {
      if (editingClass) {
        await updateClass.mutateAsync({
          id: editingClass._id,
          payload: {
            name,
            grade,
            academicYear,
          },
        });

        toast.success("Class updated successfully");
      } else {
        await createClass.mutateAsync({
          name,
          grade,
          academicYear,
        });

        toast.success("Class created successfully");
      }

      setDialogOpen(false);
      resetForm();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : editingClass
            ? "Failed to update class"
            : "Failed to create class",
      );
    }
  };

  /*
   * -------------------------------------------------------
   * Delete
   * -------------------------------------------------------
   */

  const handleDelete = (classItem: ClassItem) => {
    setClassToDelete(classItem);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!classToDelete) return;

    try {
      await deleteClass.mutateAsync(classToDelete._id);

      toast.success("Class deleted successfully");

      setDeleteModalOpen(false);
      setClassToDelete(null);

      if (classes.length === 1 && page > 1) {
        setPage((current) => current - 1);
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to delete class",
      );
    }
  };

  const handleCancelDelete = () => {
    if (deleteClass.isPending) return;

    setDeleteModalOpen(false);
    setClassToDelete(null);
  };

  /*
   * -------------------------------------------------------
   * Navigation
   * -------------------------------------------------------
   */

  const openClassDetail = (classId: string) => {
    router.push(`/admin/classes/${classId}`);
  };

  /*
   * -------------------------------------------------------
   * Render
   * -------------------------------------------------------
   */

  return (
    <section>
      <PageHeader
        title="Academic Classes"
        description={
          data
            ? `${data.total} ${data.total === 1
              ? "class"
              : "classes"
            }`
            : "Manage academic classes"
        }
        action={
          <Button
            onClick={openCreateDialog}
            disabled={isLoadingAcademicYears}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Class
          </Button>
        }
      />

      {/* Search */}
      <div className="mb-5 flex gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={searchInput}
            onChange={(e) =>
              setSearchInput(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            placeholder="Search classes..."
            className="pl-9"
          />
        </div>

        <Button
          variant="outline"
          onClick={handleSearch}
        >
          Search
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map(
            (_, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex gap-3">
                    <div className="h-11 w-11 animate-pulse rounded-xl bg-muted" />

                    <div className="space-y-2">
                      <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-40 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-2">
                  <div className="h-10 animate-pulse rounded-lg bg-muted" />
                  <div className="h-10 animate-pulse rounded-lg bg-muted" />
                </CardContent>
              </Card>
            ),
          )}
        </div>
      )}

      {/* Error */}
      {isError && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="font-medium">
              Failed to load classes
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "Something went wrong"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty */}
      {!isLoading &&
        !isError &&
        classes.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Building2 className="h-7 w-7 text-primary" />
              </div>

              <h3 className="font-semibold">
                {search
                  ? "No classes found"
                  : "No classes yet"}
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                {search
                  ? "Try a different search term."
                  : "Create your first academic class to get started."}
              </p>

              {!search && (
                <Button
                  className="mt-5"
                  onClick={openCreateDialog}
                  disabled={isLoadingAcademicYears}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Class
                </Button>
              )}
            </CardContent>
          </Card>
        )}

      {/* Classes */}
      {!isLoading &&
        !isError &&
        classes.length > 0 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {classes.map((classItem) => {
                const classSections = sections.filter((section) => {
                  if (typeof section.class === "string") {
                    return section.class === classItem._id;
                  }

                  return section.class?._id === classItem._id;
                });

                return (
                  <ClassCard
                    key={classItem._id}
                    classItem={classItem}
                    sections={classSections}
                    onOpen={() => openClassDetail(classItem._id)}
                    onEdit={() => openEditDialog(classItem)}
                    onDelete={() => handleDelete(classItem)}
                    isDeleting={deleteClass.isPending}
                  />
                );
              })}
            </div>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {data.page} of{" "}
                  {data.totalPages}
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() =>
                      setPage(
                        (current) =>
                          current - 1,
                      )
                    }
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Previous
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={
                      page >= data.totalPages
                    }
                    onClick={() =>
                      setPage(
                        (current) =>
                          current + 1,
                      )
                    }
                  >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

      {/* Create / Edit dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={handleDialogChange}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingClass
                ? "Edit Class"
                : "Add New Class"}
            </DialogTitle>

            <DialogDescription>
              {editingClass
                ? "Update the academic class information."
                : "Create a new academic class."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Class Name */}
            <div>
              <Label htmlFor="class-name">
                Class Name
              </Label>

              <Input
                id="class-name"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                placeholder="e.g. Grade 10"
                className="mt-1.5"
              />
            </div>

            {/* Grade */}
            <div>
              <Label htmlFor="class-grade">
                Grade
              </Label>

              <Input
                id="class-grade"
                type="number"
                min={1}
                value={form.grade}
                onChange={(e) =>
                  setForm({
                    ...form,
                    grade: e.target.value,
                  })
                }
                placeholder="e.g. 10"
                className="mt-1.5"
              />
            </div>

            {/* Academic Year */}
            <div>
              <Label htmlFor="class-year">
                Academic Year
              </Label>

              <Select
                value={form.academicYear}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    academicYear: value,
                  }))
                }
                disabled={isLoadingAcademicYears}
              >
                <SelectTrigger id="class-year" className="mt-1.5">
                  <SelectValue
                    placeholder={
                      isLoadingAcademicYears
                        ? "Loading academic years..."
                        : "Select academic year"
                    }
                  >
                    {form.academicYear
                      ? academicYears.find(
                        (year) => year._id === form.academicYear,
                      )?.label
                      : "Select academic year"}
                  </SelectValue>
                </SelectTrigger>

                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem
                      key={year._id}
                      value={year._id}
                    >
                      <div className="flex items-center gap-2">
                        <span>{year.label}</span>

                        {year.isActive && (
                          <Badge
                            variant="secondary"
                            className="px-1.5 py-0 text-[10px]"
                          >
                            Active
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {academicYears.length === 0 &&
                !isLoadingAcademicYears && (
                  <p className="mt-1.5 text-xs text-destructive">
                    Create an academic year before creating a class.
                  </p>
                )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setDialogOpen(false)
              }
            >
              Cancel
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={
                createClass.isPending ||
                updateClass.isPending ||
                isLoadingAcademicYears ||
                academicYears.length === 0
              }
            >
              {createClass.isPending ||
                updateClass.isPending
                ? editingClass
                  ? "Updating..."
                  : "Creating..."
                : editingClass
                  ? "Update Class"
                  : "Create Class"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <DeleteModal
        isOpen={deleteModalOpen}
        title="Delete Class"
        message={
          classToDelete
            ? `Are you sure you want to delete "${classToDelete.name}"? This action cannot be undone.`
            : "Are you sure you want to delete this class?"
        }
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={deleteClass.isPending}
      />
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Class Card                                                                  */
/* -------------------------------------------------------------------------- */

interface ClassCardProps {
  classItem: ClassItem;
  sections: {
    _id: string;
    name: string;
  }[];
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

function ClassCard({
  classItem,
  sections,
  onOpen,
  onEdit,
  onDelete,
  isDeleting,
}: ClassCardProps) {
  console.log(classItem)
  return (
    <Card className="group overflow-hidden transition-all hover:border-primary/40 hover:shadow-md">
      <CardHeader className="flex-row items-start justify-between pb-3">
        <button
          type="button"
          onClick={onOpen}
          className="flex min-w-0 flex-1 items-start gap-3 text-left"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
            <Building2 className="h-5 w-5 text-primary" />
          </div>

          <div className="min-w-0">
            <CardTitle className="flex items-center gap-1.5 text-base">
              <span className="truncate">
                {classItem.name}
              </span>

              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </CardTitle>

            <CardDescription>
              Grade {classItem.grade} · AY{" "}
              {classItem.academicYear.label}
            </CardDescription>
          </div>
        </button>

        <Badge
          variant="secondary"
          className="shrink-0 gap-1"
        >
          <Building2 className="h-3 w-3" />
          {sections.length}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-2">
        {sections.length > 0 ? (
          <>
            {sections.slice(0, 4).map((section) => (
              <div
                key={section._id}
                className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />

                  <span className="text-sm font-medium">
                    Section {section.name}
                  </span>
                </div>
              </div>
            ))}

            {sections.length > 4 && (
              <p className="text-center text-[11px] text-muted-foreground">
                +{sections.length - 4} more sections
              </p>
            )}
          </>
        ) : (
          <div className="rounded-lg border border-dashed bg-muted/20 px-3 py-4 text-center">
            <p className="text-xs text-muted-foreground">
              No sections yet
            </p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onEdit}
          >
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        <button
          type="button"
          onClick={onOpen}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary/5 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
        >
          View class details
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </CardContent>
    </Card>
  );
}