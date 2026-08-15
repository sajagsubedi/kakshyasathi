'use client';

import { UserCheck, Plus } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { adminNav } from '@/lib/nav';
import { useAdminSubstitutions, useSharedLookup } from '@/hooks/useApi';

export default function AdminSubstitutionsPage() {
  const today = new Date().toISOString().split('T')[0];
  const { data: substitutions = [] } = useAdminSubstitutions(today);
  const { data: lookup } = useSharedLookup();
  const getSectionName = lookup?.getSectionName ?? ((id: string) => id);
  const getTeacherName = lookup?.getTeacherName ?? ((id: string) => id);
  const getPeriod = lookup?.getPeriod ?? (() => undefined);

  return (
    <DashboardLayout items={adminNav} title="Kakshyasathi" subtitle="Admin Portal" pageTitle="Substitutions" pageDescription="Manage substitute teacher assignments" allowedRoles={['ADMIN']}>
      <PageHeader title="Substitutions" description={`${substitutions.length} substitutions today`} action={<Button><Plus className="mr-2 h-4 w-4" />Add Substitution</Button>} />
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Substitute</TableHead>
              <TableHead>Regular Teacher</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {substitutions.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7"><AvatarFallback className="text-xs">{getTeacherName(sub.substituteTeacherId).slice(0, 2)}</AvatarFallback></Avatar>
                    <span className="text-sm">{getTeacherName(sub.substituteTeacherId)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{getTeacherName(sub.regularTeacherId)}</TableCell>
                <TableCell><Badge variant="secondary">{getSectionName(sub.sectionId)}</Badge></TableCell>
                <TableCell>P{getPeriod(sub.periodId)?.periodNumber ?? '?'}</TableCell>
                <TableCell className="text-sm">{sub.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {substitutions.length === 0 && <CardContent className="py-8 text-center text-sm text-muted-foreground">No substitutions for today</CardContent>}
      </Card>
    </DashboardLayout>
  );
}
