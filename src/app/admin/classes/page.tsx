"use client";

import * as React from "react";
import { Building2, Plus, GraduationCap, ChevronRight, Users as UsersIcon } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminNav, adminBottomNav } from "@/lib/nav";
import {
  useAdminClasses,
  useAdminSections,
  useAdminLookup,
  useCreateClass,
} from "@/hooks/useApi";

export default function AdminClassesPage() {
  const router = useRouter();
  const { data: classes = [] } = useAdminClasses();
  const { data: sections = [] } = useAdminSections();
  const { data: lookup } = useAdminLookup();
  const users = lookup?.users ?? [];
  const createClass = useCreateClass();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    grade: "",
    academicYear: new Date().getFullYear().toString(),
  });

  const handleCreate = async () => {
    if (!form.name.trim()) {
      toast.error("Class name is required");
      return;
    }
    try {
      await createClass.mutateAsync(form);
      toast.success("Class created successfully");
      setDialogOpen(false);
      setForm({ name: "", grade: "", academicYear: new Date().getFullYear().toString() });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create class");
    }
  };

  const openClassDetail = (classId: string) => {
    router.push(`/admin/classes/${classId}`);
  };

  return (
    <DashboardLayout
      items={adminNav}
      title="Kakshyasathi"
      subtitle="Admin Portal"
      pageTitle="Classes"
      pageDescription="Manage academic classes and their sections"
      allowedRoles={["ADMIN"]}
      bottomNavItems={adminBottomNav}
    >
      <PageHeader
        title="Academic Classes"
        description={`${classes.length} classes · Click a card for detailed view`}
        action={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Class
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((cls) => {
          const classSections = sections.filter((s) => s.classId === cls.id);
          const studentCount = users.filter(
            (u) => u.role === "STUDENT" && (u.classId === cls.id || classSections.some((cs) => cs.id === u.sectionId)),
          ).length;
          return (
            <Card
              key={cls.id}
              className="group cursor-pointer transition-all hover:border-primary/40 hover:shadow-md active:scale-[0.99]"
              onClick={() => openClassDetail(cls.id)}
            >
              <CardHeader className="flex-row items-start justify-between pb-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base flex items-center gap-1.5">
                      {cls.name}
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </CardTitle>
                    <CardDescription>
                      {cls.grade ? `Grade ${cls.grade} · ` : ""}AY {cls.academicYear}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="gap-1 shrink-0">
                  <Building2 className="h-3 w-3" />
                  {classSections.length}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                {classSections.length > 0 ? (
                  classSections.slice(0, 4).map((sec) => {
                    const secStudents = users.filter((u) => u.sectionId === sec.id).length;
                    return (
                      <div
                        key={sec.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2 transition-colors group-hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Section {sec.name}</span>
                        </div>
                        <Badge variant="outline" className="gap-1 border-border text-[10px]">
                          <UsersIcon className="h-3 w-3" />
                          {secStudents}
                        </Badge>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-4 text-center">
                    <p className="text-xs text-muted-foreground">No sections yet</p>
                  </div>
                )}
                {classSections.length > 4 && (
                  <p className="text-center text-[11px] text-muted-foreground">+{classSections.length - 4} more sections</p>
                )}
                <div className="mt-2 flex items-center justify-between rounded-lg bg-primary/5 px-3 py-2 text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <UsersIcon className="h-3.5 w-3.5" />
                    Total Students
                  </div>
                  <span className="font-bold text-foreground">{studentCount}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Class</DialogTitle>
            <DialogDescription>
              Create a new academic class.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="class-name">Class Name</Label>
              <Input
                id="class-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Grade 10"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="class-grade">Grade (optional)</Label>
              <Input
                id="class-grade"
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
                placeholder="e.g. 10"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="class-year">Academic Year</Label>
              <Input
                id="class-year"
                value={form.academicYear}
                onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                placeholder="e.g. 2025"
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createClass.isPending}>
              {createClass.isPending ? "Creating..." : "Create Class"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
