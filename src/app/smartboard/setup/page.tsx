'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Monitor, LoaderCircle, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function SmartBoardSetupPage() {
  const router = useRouter();
  const [deviceId, setDeviceId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await signIn('smartboard', {
      deviceId,
      password,
      redirect: false,
    });
    setLoading(false);

    if (result?.error) {
      toast.error('Invalid device credentials');
    } else {
      toast.success('Smart board connected');
      router.push('/smartboard/dashboard');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Monitor className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Smart Board Setup</CardTitle>
          <CardDescription>Sign in with your device credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="deviceId">Device ID</Label>
              <Input id="deviceId" value={deviceId} onChange={(e) => setDeviceId(e.target.value)} placeholder="SB-001" className="mt-1.5 font-mono uppercase" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Connecting...</> : <>Connect<ArrowRight className="ml-2 h-4 w-4" /></>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
