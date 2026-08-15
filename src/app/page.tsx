'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { roleDashboardPath } from '@/lib/routes';

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;

    if (session?.user?.userRole) {
      router.replace(roleDashboardPath(session.user.userRole));
    } else {
      router.replace('/signin');
    }
  }, [status, session, router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl bg-primary-foreground p-3">
          <img src="/logo/icon.png" alt="Kakshyasathi" />
        </div>
        <p className="text-sm text-muted-foreground">Loading Kakshyasathi...</p>
      </div>
    </div>
  );
}
