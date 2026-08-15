'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Bell, LogOut, User as UserIcon, Settings, ClipboardCheck } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { roleDashboardPath } from '@/lib/routes';
import { useAuth } from '@/lib/auth-context';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TopBarProps {
  title: string;
  description?: string;
  showLogoOnMobile?: boolean;
  logoTitle?: string;
}

export function TopBar({ title, description, showLogoOnMobile = true, logoTitle = 'Kakshyasathi' }: TopBarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const roleLabel: Record<string, string> = {
    ADMIN: 'Administrator',
    TEACHER: 'Teacher',
    STUDENT: 'Student',
    SMARTBOARD: 'Smart Board',
  };

  const initials = user
    ? user.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '??';

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card/80 px-3 backdrop-blur-md sm:h-16 sm:px-6">
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 p-1">
            <Image
              src="/logo/icon.png"
              alt={logoTitle}
              width={22}
              height={22}
              className="h-full w-full object-contain"
            />
          </div>
          <span className="hidden text-sm font-bold tracking-tight sm:block">{logoTitle}</span>
        </div>

        <div className="hidden h-6 w-px shrink-0 bg-border sm:block" />

        <div className="min-w-0">
          <h1 className="truncate text-sm font-bold tracking-tight text-foreground sm:text-base">{title}</h1>
          {description && (
            <p className="hidden truncate text-xs text-muted-foreground sm:block">{description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <Button variant="ghost" size="icon" className="relative hidden h-8 w-8 sm:h-9 sm:w-9" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary sm:h-2 sm:w-2" />
        </Button>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 text-left hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:px-2">
            <Avatar className="h-8 w-8 border-2 border-primary/20">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-xs font-semibold text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden flex-col items-start leading-tight sm:flex">
              <span className="text-sm font-semibold leading-tight">
                {user?.fullName ?? 'Guest User'}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {user ? roleLabel[user.role] ?? 'User' : ''}
              </span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="p-0">
              <div className="flex items-center gap-3 p-3">
                <Avatar className="h-11 w-11 border-2 border-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-sm font-semibold text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{user?.fullName ?? 'Guest User'}</p>
                  <p className="truncate text-xs text-muted-foreground">@{user?.username ?? 'guest'}</p>
                  <Badge variant="secondary" className="mt-1 gap-1 text-[10px]">
                    {user ? roleLabel[user.role] ?? 'User' : 'Signed out'}
                  </Badge>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(user ? roleDashboardPath(user.role) : '/signin')}>
              <UserIcon className="mr-2 h-4 w-4" />
              Dashboard
            </DropdownMenuItem>
            {user?.role === 'STUDENT' && (
              <DropdownMenuItem onClick={() => router.push('/student/attendance')}>
                <ClipboardCheck className="mr-2 h-4 w-4" />
                My Attendance
              </DropdownMenuItem>
            )}
            {user?.role === 'TEACHER' && (
              <DropdownMenuItem onClick={() => router.push('/teacher/presence')}>
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Presence History
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => router.push(user ? `/${user.role.toLowerCase()}/dashboard` : '/signin')}>
              <Settings className="mr-2 h-4 w-4" />
              Account Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
