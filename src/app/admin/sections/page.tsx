"use client";

import * as React from "react";
import {
  GraduationCap,
  Plus,
  Users,
  CalendarDays,
  Building2,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { toast } from "react-toastify";

import { PageHeader } from "@/components/shared/PageHeader";
import {
  Card,
  CardContent,
  CardHeader,
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

import DeleteModal from "@/components/shared/DeleteModal";

import {
  useAdminSections,
  type SectionItem,
} from "@/hooks/admin/useSections";

import { useAdminClasses } from "@/hooks/admin/useClasses";

export default function AdminSectionsPage() {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [searchInput, setSearchInput] = React.useState("");

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingSection, setEditingSection] =
    React.useState<SectionItem | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] =
    React.useState(false);

  const [sectionToDelete, setSectionToDelete] =
    React.useState<SectionItem | null>(null);

  const [form, setForm] = React.useState({
    name: "",
    classId: "",
  });

  /*
   * -------------------------------------------------------
   * Sections
   * -------------------------------------------------------
   */

  const {
    data,
    isLoading,
    isError,
    error,
    createSection,
    updateSection,
    deleteSection,
  } = useAdminSections({
    search: search || undefined,
    page,
    limit: 12,
  });

  const sections = data?.items ?? [];

  /*
   * -------------------------------------------------------
   * Classes
   * -------------------------------------------------------
   */

  const {
    data: classesData,
    isLoading: isLoadingClasses,
  } = useAdminClasses({
    limit: 100,
  });

  const classes = classesData?.items ?? [];

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
   * Form
   * -------------------------------------------------------
   */

  const resetForm = () => {
    setForm({
      name: "",
      classId: "",
    });

    setEditingSection(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (section: SectionItem) => {
    setEditingSection(section);

    const classId =
      typeof section.class === "string"
        ? section.class
        : section.class?._id ?? "";

    setForm({
      name: section.name,
      classId,
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
    const classId = form.classId;

    if (!name) {
      toast.error("Section name is required");
      return;
    }

    if (!classId) {
      toast.error("Please select a class");
      return;
    }

    try {
      if (editingSection) {
        await updateSection.mutateAsync({
          id: editingSection._id,
          payload: {
            name,
          },
        });

        toast.success("Section updated successfully");
      } else {
        await createSection.mutateAsync({
          class: classId,
          name,
        });

        toast.success("Section created successfully");
      }

      setDialogOpen(false);
      resetForm();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : editingSection
            ? "Failed to update section"
            : "Failed to create section",
      );
    }
  };

  /*
   * -------------------------------------------------------
   * Delete
   * -------------------------------------------------------
   */

  const handleDelete = (section: SectionItem) => {
    setSectionToDelete(section);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!sectionToDelete) return;

    try {
      await deleteSection.mutateAsync(sectionToDelete._id);

      toast.success("Section deleted successfully");

      setDeleteModalOpen(false);
      setSectionToDelete(null);

      if (sections.length === 1 && page > 1) {
        setPage((current) => current - 1);
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to delete section",
      );
    }
  };

  const handleCancelDelete = () => {
    if (deleteSection.isPending) return;

    setDeleteModalOpen(false);
    setSectionToDelete(null);
  };

  /*
   * -------------------------------------------------------
   * Render
   * -------------------------------------------------------
   */

  return (
    <section>
      <PageHeader
        title="Sections"
        description={
          data
            ? `${data.total} ${data.total === 1 ? "section" : "sections"
            }`
            : "Manage classroom sections"
        }
        action={
          <Button
            onClick={openCreateDialog}
            disabled={isLoadingClasses}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Section
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
            placeholder="Search sections..."
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
          {Array.from({ length: 6 }).map((_, index) => (
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
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="font-medium">
              Failed to load sections
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
        sections.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <GraduationCap className="h-7 w-7 text-primary" />
              </div>

              <h3 className="font-semibold">
                {search
                  ? "No sections found"
                  : "No sections yet"}
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                {search
                  ? "Try a different search term."
                  : "Create your first section to get started."}
              </p>

              {!search && (
                <Button
                  className="mt-5"
                  onClick={openCreateDialog}
                  disabled={isLoadingClasses}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Section
                </Button>
              )}
            </CardContent>
          </Card>
        )}

      {/* Sections */}
      {!isLoading &&
        !isError &&
        sections.length > 0 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sections.map((section) => {

                const classInfo =
                  typeof section.class === "string"
                    ? classes.find(
                      (classItem) =>
                        classItem._id === section.class,
                    )
                    : section.class;

                const className =
                  classInfo?.name ?? "Unknown Class";

                const grade =
                  classInfo?.grade;

                const academicYear =
                  classInfo?.academicYear;


                return (
                  <SectionCard
                    key={section._id}
                    section={section}
                    className={className}
                    grade={grade}
                    academicYear={academicYear}
                    onEdit={() =>
                      openEditDialog(section)
                    }
                    onDelete={() =>
                      handleDelete(section)
                    }
                    isDeleting={
                      deleteSection.isPending
                    }
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
                        (current) => current - 1,
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
                        (current) => current + 1,
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

      {/* Create / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={handleDialogChange}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSection
                ? "Edit Section"
                : "Add New Section"}
            </DialogTitle>

            <DialogDescription>
              {editingSection
                ? "Update the section information."
                : "Create a new section under an existing class."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Section Name */}
            <div>
              <Label htmlFor="section-name">
                Section Name
              </Label>

              <Input
                id="section-name"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="e.g. A, B, C"
                className="mt-1.5"
              />
            </div>

            {/* Class */}
            <div>
              <Label htmlFor="section-class">
                Class
              </Label>

              <Select
                value={form.classId}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    classId: value,
                  }))
                }
                disabled={isLoadingClasses || Boolean(editingSection)}
              >
                <SelectTrigger
                  id="section-class"
                  className="mt-1.5"
                >
                  <SelectValue
                    placeholder={
                      isLoadingClasses
                        ? "Loading classes..."
                        : "Select class"
                    }
                  >
                    {form.classId
                      ? (() => {
                        const selectedClass = classes.find(
                          (classItem) => classItem._id === form.classId
                        );

                        if (!selectedClass) {
                          return "Select class";
                        }

                        return (
                          <>
                            {selectedClass.name}
                            {selectedClass.grade
                              ? ` · Grade ${selectedClass.grade}`
                              : ""}
                          </>
                        );
                      })()
                      : "Select class"}
                  </SelectValue>
                </SelectTrigger>

                <SelectContent>
                  {classes.map((classItem) => (
                    <SelectItem
                      key={classItem._id}
                      value={classItem._id}
                    >
                      {classItem.name}
                      {classItem.grade
                        ? ` · Grade ${classItem.grade}`
                        : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {classes.length === 0 &&
                !isLoadingClasses && (
                  <p className="mt-1.5 text-xs text-destructive">
                    Create a class before creating a
                    section.
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
                createSection.isPending ||
                updateSection.isPending ||
                isLoadingClasses ||
                classes.length === 0
              }
            >
              {createSection.isPending ||
                updateSection.isPending
                ? editingSection
                  ? "Updating..."
                  : "Creating..."
                : editingSection
                  ? "Update Section"
                  : "Create Section"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModalOpen}
        title="Delete Section"
        message={
          sectionToDelete
            ? `Are you sure you want to delete "Section ${sectionToDelete.name}"? This action cannot be undone.`
            : "Are you sure you want to delete this section?"
        }
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={deleteSection.isPending}
      />
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Section Card                                                               */
/* -------------------------------------------------------------------------- */

interface SectionCardProps {
  section: SectionItem;
  className: string;
  grade?: number;
  academicYear?: {
    label: string;
    _id: string;
  };
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

function SectionCard({
  section,
  className,
  grade,
  academicYear,
  onEdit,
  onDelete,
  isDeleting,
}: SectionCardProps) {
  return (
    <Card className="group overflow-hidden transition-all hover:border-primary/30 hover:shadow-md">
      <CardContent className="p-0">
        {/* Header */}
        <div className="border-b border-border bg-gradient-to-r from-primary/15 via-primary/10 to-chart-3/10 px-5 py-4">
          <div className="flex items-start justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/20">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>

              <div className="min-w-0">
                <p className="truncate font-bold tracking-tight">
                  Section {section.name}
                </p>

                <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <Building2 className="h-3 w-3" />

                  <span className="truncate">
                    {className}
                  </span>

                  {grade && (
                    <>
                      <span>·</span>
                      <span>Grade {grade}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <Badge
              variant="secondary"
              className="shrink-0 gap-1 bg-primary/10 text-primary border-primary/20"
            >
              <Users className="h-3 w-3" />
              Section
            </Badge>
          </div>
        </div>

        {/* Information */}
        <div className="grid grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-2">
          <div className="rounded-lg bg-muted/30 p-2.5">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              <CalendarDays className="h-3 w-3" />
              Academic Year
            </div>

            <p className="mt-0.5 text-sm font-semibold text-foreground">
              {academicYear?.label ?? "—"}
            </p>
          </div>

          <div className="rounded-lg bg-muted/30 p-2.5">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              <Building2 className="h-3 w-3" />
              Class
            </div>

            <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
              {className}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-5 pb-5">
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
      </CardContent>
    </Card>
  );
}