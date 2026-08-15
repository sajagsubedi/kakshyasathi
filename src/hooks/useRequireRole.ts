'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { roleDashboardPath, type AppRole } from '@/lib/routes';
import type { UserRole } from '@/types';

const rolePrefixMap: Record<string, UserRole[]> = {
  '/admin': ['ADMIN'],
  '/teacher': ['TEACHER'],
  '/student': ['STUDENT'],
  '/smartboard': ['SMARTBOARD'],
};

export function useRequireRole(allowedRoles: UserRole[]) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user) {
      router.replace('/signin');
      return;
    }

    const role = session.user.userRole as UserRole;
    if (!allowedRoles.includes(role)) {
      router.replace(roleDashboardPath(role));
    }
  }, [session, status, allowedRoles, router]);

  return {
    session,
    isLoading: status === 'loading',
    role: session?.user?.userRole as UserRole | undefined,
  };
}

export function getRoleFromPath(path: string): UserRole[] | null {
  for (const [prefix, roles] of Object.entries(rolePrefixMap)) {
    if (path.startsWith(prefix)) return roles;
  }
  return null;
}
