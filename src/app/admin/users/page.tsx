'use client';

import * as React from 'react';
import { Users, Plus, Search, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { adminNav, adminBottomNav } from '@/lib/nav';
import { useAdminUsers, useAdminLookup, useCreateUser } from '@/hooks/useApi';
import type { UserRole } from '@/types';

interface CreateUserForm {
  fullName: string;
  username: string;
  password: string;
  userRole: UserRole;
  phone: string;
  rollNumber: string;
  sectionId: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [search, setSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState('ALL');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [form, setForm] = React.useState<CreateUserForm>({
    fullName: '',
    username: '',
    password: '',
    userRole: 'STUDENT',
    phone: '',
    rollNumber: '',
    sectionId: '',
  });

  const { data: allUsers = [], isLoading } = useAdminUsers(roleFilter);
  const { data: lookup } = useAdminLookup();
  const createUser = useCreateUser();

  const getSectionName = lookup?.getSectionName ?? (() => 'Unknown');
  const sections = lookup?.sections ?? [];

  const filtered = allUsers.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const roleBadge = (role: UserRole) => {
    if (role === 'ADMIN') return <Badge variant="default">Admin</Badge>;
    if (role === 'TEACHER') return <Badge variant="secondary" className="bg-chart-3/10 text-chart-3">Teacher</Badge>;
    return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">Student</Badge>;
  };

  const handleCreate = async () => {
    if (!form.fullName.trim()) {
      toast.error('Full name is required');
      return;
    }
    if (!form.username.trim()) {
      toast.error('Username is required');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (form.userRole === 'STUDENT' && !form.sectionId) {
      toast.error('Please assign a section for students');
      return;
    }
    try {
      await createUser.mutateAsync({
        fullName: form.fullName.trim(),
        username: form.username.trim(),
        password: form.password,
        userRole: form.userRole,
        phone: form.phone || undefined,
        rollNumber: form.rollNumber || undefined,
        sectionId: form.sectionId || undefined,
      });
      toast.success('User created successfully');
      setDialogOpen(false);
      setForm({
        fullName: '',
        username: '',
        password: '',
        userRole: 'STUDENT',
        phone: '',
        rollNumber: '',
        sectionId: '',
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create user');
    }
  };

  const viewUser = (userId: string) => {
    router.push(`/admin/users/${userId}`);
  };

  return (
    <DashboardLayout items={adminNav} title="Kakshyasathi" subtitle="Admin Portal" pageTitle="Users" pageDescription="Manage students, teachers, and administrators" allowedRoles={['ADMIN']} bottomNavItems={adminBottomNav}>
      <PageHeader title="User Management" description={`${allUsers.length} users across all roles`} action={<Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />Add User</Button>} />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name or username..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value ?? 'ALL')}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Filter by role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="TEACHER">Teacher</SelectItem>
            <SelectItem value="STUDENT">Student</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading users...</p>
      ) : filtered.length > 0 ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden md:table-cell">Section</TableHead>
                <TableHead className="hidden lg:table-cell">Phone</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow
                  key={user.id}
                  className="cursor-pointer transition-colors hover:bg-muted/40"
                  onClick={() => viewUser(user.id)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-xs text-primary">
                          {user.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.fullName}</p>
                        {user.rollNumber && <p className="text-xs text-muted-foreground">Roll: {user.rollNumber}</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><span className="font-mono text-xs text-muted-foreground">{user.username}</span></TableCell>
                  <TableCell>{roleBadge(user.role)}</TableCell>
                  <TableCell className="hidden md:table-cell">{user.sectionId ? <span className="text-sm">{getSectionName(user.sectionId)}</span> : <span className="text-xs text-muted-foreground">—</span>}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{user.phone || '—'}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        viewUser(user.id);
                      }}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <EmptyState icon={Users} title="No users found" description="Try adjusting your search or filter criteria." />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new student, teacher, or admin account.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="e.g. John Doe"
                className="mt-1.5"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="username">Username <span className="text-destructive">*</span></Label>
                <Input
                  id="username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="e.g. john2025"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min 8 characters"
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="role">Role <span className="text-destructive">*</span></Label>
              <Select
                value={form.userRole}
                onValueChange={(v) => setForm({ ...form, userRole: v as UserRole, sectionId: '' })}
              >
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="TEACHER">Teacher</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.userRole === 'STUDENT' && (
              <div className="grid gap-4 rounded-lg border border-primary/20 bg-primary/5 p-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="sectionId">Assign to Section <span className="text-destructive">*</span></Label>
                  <Select
                    value={form.sectionId}
                    onValueChange={(v) => setForm({ ...form, sectionId: v ?? '' })}
                  >
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select a section" /></SelectTrigger>
                    <SelectContent>
                      {sections.map((section) => {
                        const cls = lookup?.classes.find((c) => c.id === section.classId);
                        return (
                          <SelectItem key={section.id} value={section.id}>
                            {cls ? `${cls.name} - Section ${section.name}` : `Section ${section.name}`}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="rollNumber">Roll Number</Label>
                  <Input
                    id="rollNumber"
                    value={form.rollNumber}
                    onChange={(e) => setForm({ ...form, rollNumber: e.target.value })}
                    placeholder="e.g. 101"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="e.g. 98XXXXXXXX"
                    className="mt-1.5"
                  />
                </div>
              </div>
            )}

            {form.userRole === 'TEACHER' && (
              <div className="rounded-lg border border-chart-3/20 bg-chart-3/5 p-4">
                <Label htmlFor="teacherPhone">Phone Number</Label>
                <Input
                  id="teacherPhone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. 98XXXXXXXX"
                  className="mt-1.5"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createUser.isPending}>
              {createUser.isPending ? 'Creating...' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
