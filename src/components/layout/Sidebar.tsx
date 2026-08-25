'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { navIcons } from '@/lib/navigation';

export interface NavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
}

interface SidebarProps {
  navlinks: NavItem[];
  title: string;
  subtitle: string;
  academicYear?: string;
}

export function Sidebar({ navlinks, title, subtitle, academicYear }: SidebarProps) {
  const pathname = usePathname();

  const items = navlinks.map((elem) => {
    if (elem.icon) {
      return { ...elem, icon: elem.icon };
    }
    const cr = navIcons.find((el2) => el2.label === elem.label);
    return {
      ...elem,
      icon: cr?.icon,
    };
  });
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      {/* LOGO */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 p-1.5">
          <Image
            src="/logo/icon.png"
            alt={title}
            width={28}
            height={28}
            className="h-full w-full object-contain"
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-sidebar-foreground">{title}</p>
          <p className="truncate text-[11px] text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      {/* NAV */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => {
          const Icon: LucideIcon = item.icon ?? Circle;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Academic Year</p>
          <p className="mt-0.5">{academicYear || '2025 – 2026'}</p>
        </div>
      </div>
    </aside>
  );
}
