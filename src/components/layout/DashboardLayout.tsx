"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

import { Sidebar, type NavItem } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { TopBar } from "@/components/layout/TopBar";
import { useAdminAcademicYears } from "@/hooks/admin/useAcademicYears";

import type { UserRole } from "@/types";
import { useSession } from "next-auth/react";
import { roleDashboardPath } from "@/lib/routes";

interface DashboardLayoutProps {
  items: NavItem[];
  title: string;
  subtitle: string;
  allowedRoles?: UserRole[];
  bottomNavItems?: NavItem[];
  children: React.ReactNode;
}

export function DashboardLayout({
  items,
  title,
  subtitle,
  allowedRoles,
  bottomNavItems,
  children,
}: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { data: academicYears } = useAdminAcademicYears();

  const latestAcademicYear = React.useMemo(() => {
    if (!academicYears || academicYears.length === 0) return null;
    const activeYear = academicYears.find(ay => ay.isActive);
    if (activeYear) return activeYear.label;
    return academicYears[academicYears.length - 1].label;
  }, [academicYears]);

  React.useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (status === "unauthenticated" || !session?.user) {
      router.replace("/signin");
      return;
    }

    if (!allowedRoles || allowedRoles.length === 0) {
      return;
    }
    const userRole = session.user.role as UserRole;
    if (allowedRoles.includes(userRole)) {
      return;
    }
    router.replace(roleDashboardPath(userRole));
  }, [status, session, allowedRoles, router]);

  const currentNavItem = React.useMemo(() => {
    const allItems = [
      ...items,
      ...(bottomNavItems ?? []),
    ];

    return allItems.find(
      (item) =>
        pathname === item.href ||
        pathname.startsWith(item.href + "/")
    );
  }, [items, bottomNavItems, pathname]);

  const pageTitle = currentNavItem?.label ?? title;

  if (status === "loading") {
    return (
      <div className="flex h-dvh items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">
          Loading...
        </p>
      </div>
    );
  }

  if (status === "unauthenticated" || !session?.user) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">
          Redirecting...
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <Sidebar
        navlinks={items}
        title={title}
        subtitle={subtitle}
        academicYear={latestAcademicYear || undefined}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {bottomNavItems && (
          <BottomNav
            navlinks={bottomNavItems}
            title={title}
          />
        )}

        <TopBar
          title={pageTitle}
        />

        <main className="min-h-0 flex-1 overflow-y-auto p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}