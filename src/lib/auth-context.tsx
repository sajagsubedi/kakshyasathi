'use client';

import { createContext, useContext, useMemo } from 'react';
import { useSession, signOut } from 'next-auth/react';
import type { UserRole } from '@/types';

interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  sectionId?: string | null;
  deviceId?: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  const value = useMemo<AuthContextValue>(() => {
    const sessionUser = session?.user;

    return {
      user: sessionUser
        ? {
            id: sessionUser._id,
            username: sessionUser.username,
            fullName: sessionUser.fullName,
            role: sessionUser.userRole as UserRole,
            sectionId: sessionUser.sectionId,
            deviceId: sessionUser.deviceId,
          }
        : null,
      isLoading: status === 'loading',
      logout: () => signOut({ callbackUrl: '/signin' }),
    };
  }, [session, status]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
