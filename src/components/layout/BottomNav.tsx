'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/components/layout/Sidebar';
import { adminNavIcons } from '@/lib/navigation';

interface BottomNavProps {
  navlinks: NavItem[];
  title: string;
  showTopHeader?: boolean;
}

export function BottomNav({ navlinks, title, showTopHeader = false }: BottomNavProps) {
  const pathname = usePathname();

  const items = navlinks.map((elem) => {
    if (elem.icon) {
      return { ...elem, icon: elem.icon };
    }
    const cr = adminNavIcons.find((el2) => el2.label === elem.label);
    return {
      ...elem,
      icon: cr?.icon,
    };
  });
  return (
    <>
      {showTopHeader && (
        <div className="flex h-12 items-center justify-between border-b border-border bg-card px-4 lg:hidden safe-area-inset-top safe-area-inset-left safe-area-inset-right">
          <span className="text-xs font-bold tracking-tight text-muted-foreground">{title}</span>
        </div>
      )}

      {/* MOBILE BOTTOM NAV BAR */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-md lg:hidden safe-area-inset-bottom">
        <ul className="flex items-center justify-around">
          {items.map((item) => {
            const Icon: LucideIcon = item.icon ?? Circle;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center justify-center gap-0.5 py-2.5 px-1 text-[10px] font-medium transition-all',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-xl transition-all',
                      isActive
                        ? 'bg-primary/15 scale-105'
                        : 'bg-transparent'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-[18px] w-[18px] shrink-0 transition-all',
                        isActive
                          ? 'text-primary stroke-[2.25px]'
                          : 'text-current'
                      )}
                    />
                  </div>
                  <span className="truncate max-w-full">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
