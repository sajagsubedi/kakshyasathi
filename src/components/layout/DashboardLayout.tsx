'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar, type NavItem } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { BottomNav } from '@/components/layout/BottomNav';
import { TopBar } from '@/components/layout/TopBar';
import { useAuth } from '@/lib/auth-context';
import type { UserRole } from '@/types';

interface DashboardLayoutProps {
  items: NavItem[];
  title: string;
  subtitle: string;
  pageTitle: string;
  pageDescription?: string;
  allowedRoles?: UserRole[];
  bottomNavItems?: NavItem[];
  children: React.ReactNode;
}

export function DashboardLayout({
  items,
  title,
  subtitle,
  pageTitle,
  pageDescription,
  allowedRoles,
  bottomNavItems,
  children,
}: DashboardLayoutProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push('/signin');
      return;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.push(`/${user.role.toLowerCase()}/dashboard`);
    }
  }, [user, isLoading, allowedRoles, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const useBottomNav = !!bottomNavItems;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar items={items} title={title} subtitle={subtitle} />
      <div className="flex flex-1 flex-col overflow-hidden">
        {useBottomNav ? (
          <BottomNav items={bottomNavItems} title={title} />
        ) : (
          <MobileNav items={items} title={title} />
        )}
        <TopBar title={pageTitle} description={pageDescription} />
        <main
          className={
            useBottomNav
              ? 'flex-1 overflow-y-auto p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8'
              : 'flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8'
          }
        >
          {children}
        </main>
      </div>
    </div>
  );
}
