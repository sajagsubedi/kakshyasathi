'use client';

import * as React from 'react';
import { ScanLine, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useSmartboardAttendance, useBarcodeScan, useSharedLookup } from '@/hooks/useApi';

export default function SmartBoardAttendancePage() {
  const [barcode, setBarcode] = React.useState('');
  const [scanRole, setScanRole] = React.useState<'STUDENT' | 'TEACHER'>('STUDENT');
  const { data: attendance = [] } = useSmartboardAttendance();
  const scan = useBarcodeScan();
  const { data: lookup } = useSharedLookup();
  const users = lookup?.users ?? [];

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) return;
    try {
      await scan.mutateAsync({ barcode: barcode.trim(), role: scanRole });
      toast.success(`${scanRole === 'STUDENT' ? 'Attendance' : 'Presence'} recorded`);
      setBarcode('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Scan failed');
    }
  };

  return (
    <section>
      <PageHeader title="Scan ID Cards" description="Scan student or teacher barcodes" />
      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">Barcode Scanner</CardTitle><CardDescription>Username from school ID card</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={handleScan} className="flex flex-col gap-3 sm:flex-row">
            <Input value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="Scan or enter barcode..." className="flex-1 font-mono" autoFocus />
            <div className="flex gap-2">
              <Button type="button" variant={scanRole === 'STUDENT' ? 'default' : 'outline'} onClick={() => setScanRole('STUDENT')}>Student</Button>
              <Button type="button" variant={scanRole === 'TEACHER' ? 'default' : 'outline'} onClick={() => setScanRole('TEACHER')}>Teacher</Button>
              <Button type="submit" disabled={scan.isPending}><ScanLine className="mr-2 h-4 w-4" />Scan</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Today's Attendance</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {attendance.map((record) => {
            const student = users.find((u) => u.id === record.studentId);
            return (
              <div key={record.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                <span className="text-sm">{student?.fullName ?? record.studentId}</span>
                <Badge className={record.status === 'PRESENT' ? 'bg-emerald-500 text-white' : ''} variant={record.status === 'ABSENT' ? 'destructive' : 'default'}>
                  {record.status === 'PRESENT' ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                  {record.status}
                </Badge>
              </div>
            );
          })}
          {!attendance.length && <p className="text-sm text-muted-foreground">No attendance records yet</p>}
        </CardContent>
      </Card>
    </section>
  );
}
