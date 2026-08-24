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
  const [deviceKey, setDeviceKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log(deviceKey)

    const result = await signIn("smartboard", {
      deviceKey,
      redirect: false,
    });

    if (result?.error) {
      toast.error("SmartBoard login failed");
      setLoading(false)
      return;
    }

    if (result?.ok) {
      setLoading(false)
      toast.success("Smartboard connected successfully!")
      router.replace("/smartboard/dashboard");
    }
  };

  return (
    <section className="flex min-h-screen items-center justify-center bg-background p-4">
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
              <Label htmlFor="deviceKey">Device Key</Label>
              <Input id="deviceKey" value={deviceKey} onChange={(e) => setDeviceKey(e.target.value)} placeholder="Enter your device key" className="mt-1.5 font-mono" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Connecting...</> : <>Connect<ArrowRight className="ml-2 h-4 w-4" /></>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
