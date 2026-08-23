'use client';

import { UserCheck, Plus, Calendar, Clock } from 'lucide-react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  substitutions,
  getSectionName,
  getTeacherName,
  getPeriod,
} from '@/lib/mock-data';

export default function AdminSubstitutionsPage() {
  return (
    <section

    >
      <PageHeader
        title="Substitute Teachers"
        description={`${substitutions.length} substitutions scheduled`}
        action={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Assign Substitute
          </Button>
        }
      />

      {substitutions.length > 0 ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Regular Teacher</TableHead>
                <TableHead>Substitute</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {substitutions.map((sub) => {
                const period = getPeriod(sub.periodId);
                return (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(sub.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{getSectionName(sub.sectionId)}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-sm">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        Period {period?.periodNumber}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="bg-muted text-xs">
                            {getTeacherName(sub.regularTeacherId).split(' ').map((n) => n[0]).slice(0, 2).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground line-through">
                          {getTeacherName(sub.regularTeacherId)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="bg-amber-500/10 text-xs text-amber-600">
                            {getTeacherName(sub.substituteTeacherId).split(' ').map((n) => n[0]).slice(0, 2).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {getTeacherName(sub.substituteTeacherId)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/10">
                        Active
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <EmptyState
          icon={UserCheck}
          title="No substitutions scheduled"
          description="When a teacher is absent, assign a substitute here."
          action={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Assign Substitute
            </Button>
          }
        />
      )}
    </section>
  );
}
