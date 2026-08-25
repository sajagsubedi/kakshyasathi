"use client";

import * as React from "react";
import { Users, Plus, Search, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import {
  useAdminUsers,
  type AdminUserItem,
  type CreateUserPayload,
} from "@/hooks/admin/useUsers";
import { useAdminSections } from "@/hooks/admin/useSections";
import { useAdminSubjects } from "@/hooks/admin/useSubjects";
import { useAdminTeachers } from "@/hooks/admin/useTeachers";
import { UserRole, PersonGender } from "@/types";
import { sectionLabel, refId } from "@/lib/adminDisplay";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const ROLE_FILTER_ALL = "all";

const roleBadge = (role: UserRole) => {
  if (role === UserRole.admin)
    return <Badge variant="default">Admin</Badge>;
  if (role === UserRole.teacher)
    return (
      <Badge variant="secondary" className="bg-chart-3/10 text-chart-3">
        Teacher
      </Badge>
    );
  return (
    <Badge
      variant="secondary"
      className="bg-emerald-500/10 text-emerald-600"
    >
      Student
    </Badge>
  );
};

const userSectionRef = (u: AdminUserItem) => u.student?.section ?? u.teacher?.assignedSections?.[0];

export default function AdminUsersPage() {
  const router = useRouter();
  const [page, setPage] = React.useState(1);
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>(ROLE_FILTER_ALL);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [form, setForm] = React.useState<{
    role: UserRole | "";
    name: string;
    username: string;
    email: string;
    password: string;
    gender: PersonGender;
    section: string;
    rollNumber: string;
    symbolNumber: string;
    enrollmentYear: string;
    guardianContact: string;
    subjects: string[];
    assignedSections: string[];
  }>({
    role: "",
    name: "",
    username: "",
    email: "",
    password: "",
    gender: PersonGender.male,
    section: "",
    rollNumber: "",
    symbolNumber: "",
    enrollmentYear: "",
    guardianContact: "",
    subjects: [],
    assignedSections: [],
  });

  const {
    data,
    isLoading,
    isError,
    error,
    createUser,
  } = useAdminUsers({
    search: search || undefined,
    role: roleFilter === ROLE_FILTER_ALL ? undefined : roleFilter,
    page,
    limit: 10,
  });

  const users = data?.items ?? [];

  const { data: sectionsData } = useAdminSections({ limit: 100 });
  const sections = sectionsData?.items ?? [];

  const { data: subjectsData } = useAdminSubjects({ limit: 100 });
  const subjects = subjectsData?.items ?? [];

  const { data: teachersData } = useAdminTeachers(100);
  const teachers = teachersData?.items ?? [];

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  const resetForm = () => {
    setForm({
      role: "",
      name: "",
      username: "",
      email: "",
      password: "",
      gender: PersonGender.male,
      section: "",
      rollNumber: "",
      symbolNumber: "",
      enrollmentYear: "",
      guardianContact: "",
      subjects: [],
      assignedSections: [],
    });
  };

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) resetForm();
  };

  const handleCreate = async () => {
    if (!form.role) {
      toast.error("Role is required");
      return;
    }
    if (!form.name.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (!form.username.trim()) {
      toast.error("Username is required");
      return;
    }
    if (!form.email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (form.role === UserRole.student && !form.section) {
      toast.error("Please assign a section for students");
      return;
    }

    try {
      const payload: CreateUserPayload = {
        role: form.role,
        name: form.name.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        gender: form.gender,
      };

      if (form.role === UserRole.student) {
        payload.section = form.section || undefined;
        payload.rollNumber = form.rollNumber.trim() || undefined;
        payload.symbolNumber = form.symbolNumber.trim() || undefined;
        payload.enrollmentYear = form.enrollmentYear.trim() || undefined;
        payload.guardianContact = form.guardianContact.trim() || undefined;
      }

      if (form.role === UserRole.teacher) {
        payload.subjects = form.subjects?.length ? form.subjects : undefined;
        payload.assignedSections = form.assignedSections?.length
          ? form.assignedSections
          : undefined;
      }

      await createUser.mutateAsync(payload);
      toast.success("User created successfully");
      setDialogOpen(false);
      resetForm();
      if (data && data.totalPages < Math.ceil((data.total + 1) / 10)) {
        setPage(data.totalPages + 1);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create user"
      );
    }
  };

  const viewUser = (userId: string) => {
    router.push(`/admin/users/${userId}`);
  };

  return (
    <section>
      <PageHeader
        title="User Management"
        description={
          data
            ? `${data.total} ${data.total === 1 ? "user" : "users"} across all roles`
            : "Manage students, teachers, and admins"
        }
        action={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or username..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={handleSearch}>
          Search
        </Button>
        <Select
          value={roleFilter}
          onValueChange={(value) => {
            setPage(1);
            setRoleFilter(value ?? ROLE_FILTER_ALL);
          }}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ROLE_FILTER_ALL}>All Roles</SelectItem>
            <SelectItem value={UserRole.admin}>Admin</SelectItem>
            <SelectItem value={UserRole.teacher}>Teacher</SelectItem>
            <SelectItem value={UserRole.student}>Student</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Loading users...
          </CardContent>
        </Card>
      )}

      {isError && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load users"}
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && users.length === 0 && (
        <EmptyState
          icon={Users}
          title="No users found"
          description={
            search || roleFilter !== ROLE_FILTER_ALL
              ? "Try adjusting your search or filter criteria."
              : "Create your first user to get started."
          }
        />
      )}

      {!isLoading && !isError && users.length > 0 && (
        <>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Section
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Email
                  </TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const sectionRef = userSectionRef(user);
                  const resolvedSection =
                    sectionRef && typeof sectionRef !== "string"
                      ? sectionRef
                      : sections.find((s) => s._id === refId(sectionRef));
                  const sectionDisplay = resolvedSection
                    ? sectionLabel(resolvedSection)
                    : user.role === UserRole.admin
                      ? "—"
                      : "Unknown";

                  return (
                    <TableRow
                      key={user._id}
                      className="cursor-pointer transition-colors hover:bg-muted/40"
                      onClick={() => viewUser(user._id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-xs text-primary">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {user.name}
                            </p>
                            {user.student?.rollNumber && (
                              <p className="text-xs text-muted-foreground">
                                Roll: {user.student.rollNumber}
                              </p>
                            )}
                            {user.role === UserRole.teacher &&
                              !user.student && (
                                <p className="text-xs text-muted-foreground">
                                  {user.teacher?.assignedSections?.length
                                    ? `${user.teacher.assignedSections.length} section(s)`
                                    : "Teacher"}
                                </p>
                              )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-muted-foreground">
                          @{user.username}
                        </span>
                      </TableCell>
                      <TableCell>{roleBadge(user.role)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm">{sectionDisplay}</span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {user.email || "—"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            viewUser(user._id);
                          }}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>

          {data && data.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {data.page} of {data.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((c) => c - 1)}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.totalPages}
                  onClick={() => setPage((c) => c + 1)}
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new student, teacher, or admin account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="user-role">
                Role <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.role || undefined}
                onValueChange={(v) =>
                  setForm((prev) => ({
                    ...prev,
                    role: (v as UserRole) ?? "",
                    section: "",
                    subjects: [],
                    assignedSections: [],
                  }))
                }
              >
                <SelectTrigger id="user-role" className="mt-1.5">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.student}>Student</SelectItem>
                  <SelectItem value={UserRole.teacher}>Teacher</SelectItem>
                  <SelectItem value={UserRole.admin}>Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="user-name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="user-name"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                placeholder="e.g. John Doe"
                className="mt-1.5"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="user-username">
                  Username <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="user-username"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  placeholder="e.g. john2025"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="user-email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="user-email"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  placeholder="e.g. john@school.edu"
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="user-password">
                  Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="user-password"
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="Min 8 characters"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="user-gender">Gender</Label>
                <Select
                  value={form.gender}
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      gender: (v as PersonGender) ?? PersonGender.male,
                    })
                  }
                >
                  <SelectTrigger id="user-gender" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PersonGender.male}>Male</SelectItem>
                    <SelectItem value={PersonGender.female}>
                      Female
                    </SelectItem>
                    <SelectItem value={PersonGender.other}>Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {form.role === UserRole.student && (
              <div className="grid gap-4 rounded-lg border border-primary/20 bg-primary/5 p-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="user-section">
                    Assign to Section{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={form.section || undefined}
                    onValueChange={(v) =>
                      setForm((prev) => ({
                        ...prev,
                        section: v ?? "",
                      }))
                    }
                  >
                    <SelectTrigger id="user-section" className="mt-1.5">
                      <SelectValue placeholder="Select a section">
                        {form.section
                          ? sectionLabel(
                            sections.find(
                              (section) => section._id === form.section
                            )
                          )
                          : "Select a section"}
                      </SelectValue>
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
                <div>
                  <Label htmlFor="user-roll">Roll Number</Label>
                  <Input
                    id="user-roll"
                    value={form.rollNumber}
                    onChange={(e) =>
                      setForm({ ...form, rollNumber: e.target.value })
                    }
                    placeholder="e.g. 101"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="user-symbol">Symbol Number</Label>
                  <Input
                    id="user-symbol"
                    value={form.symbolNumber}
                    onChange={(e) =>
                      setForm({ ...form, symbolNumber: e.target.value })
                    }
                    placeholder="e.g. SYM-001"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="user-enrollment">Enrollment Year</Label>
                  <Input
                    id="user-enrollment"
                    value={form.enrollmentYear}
                    onChange={(e) =>
                      setForm({ ...form, enrollmentYear: e.target.value })
                    }
                    placeholder="e.g. 2082"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="user-guardian">Guardian Contact</Label>
                  <Input
                    id="user-guardian"
                    value={form.guardianContact}
                    onChange={(e) =>
                      setForm({ ...form, guardianContact: e.target.value })
                    }
                    placeholder="e.g. 98XXXXXXXX"
                    className="mt-1.5"
                  />
                </div>
              </div>
            )}

            {form.role === UserRole.teacher && (
              <div className="rounded-lg border border-chart-3/20 bg-chart-3/5 p-4 space-y-4">
                <div>
                  <Label htmlFor="teacher-subjects">Subjects</Label>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {subjects.map((sub) => {
                      const selected = form.subjects?.includes(sub._id);
                      return (
                        <Button
                          key={sub._id}
                          type="button"
                          size="sm"
                          variant={selected ? "default" : "outline"}
                          onClick={() =>
                            setForm((prev) => {
                              const current = prev.subjects ?? [];
                              return {
                                ...prev,
                                subjects: selected
                                  ? current.filter((id) => id !== sub._id)
                                  : [...current, sub._id],
                              };
                            })
                          }
                        >
                          {sub.name}
                        </Button>
                      );
                    })}
                    {subjects.length === 0 && (
                      <span className="text-xs text-muted-foreground">
                        No subjects available yet.
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <Label>Assigned Sections</Label>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {sections.map((sec) => {
                      const selected =
                        form.assignedSections?.includes(sec._id);
                      return (
                        <Button
                          key={sec._id}
                          type="button"
                          size="sm"
                          variant={selected ? "default" : "outline"}
                          onClick={() =>
                            setForm((prev) => {
                              const current = prev.assignedSections ?? [];
                              return {
                                ...prev,
                                assignedSections: selected
                                  ? current.filter((id) => id !== sec._id)
                                  : [...current, sec._id],
                              };
                            })
                          }
                        >
                          {sectionLabel(sec)}
                        </Button>
                      );
                    })}
                    {sections.length === 0 && (
                      <span className="text-xs text-muted-foreground">
                        No sections available yet.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {form.role === UserRole.admin && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs text-muted-foreground">
                Admin accounts have full system access. No student/teacher
                fields are required.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createUser.isPending || !form.role}
            >
              {createUser.isPending ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
} 
