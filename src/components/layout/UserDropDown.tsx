"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
    Bell,
    LayoutDashboard,
    LogOut,
    Settings,
    User as UserIcon,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "next-auth";

interface UserDropDownProps {
    user: User;
}

const roleLabel: Record<string, string> = {
    admin: "Administrator",
    teacher: "Teacher",
    student: "Student",
};

export default function UserDropDown({ user }: UserDropDownProps) {
    const router = useRouter();

    const name = user.name ?? "User";
    const role = user.role ?? "";
    const username = user.username ?? "user";

    const initials = name
        .split(" ")
        .filter(Boolean)
        .map((v: string) => v[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const dashboard = role ? `/${role.toLowerCase()}/dashboard` : "/signin";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                aria-label="Open user menu"
                className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 text-left hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:px-2"
            >
                <Avatar className="h-8 w-8 border-2 border-primary/20">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-xs font-semibold text-primary-foreground">
                        {initials}
                    </AvatarFallback>
                </Avatar>

                <div className="hidden min-w-0 text-left leading-tight sm:block">
                    <p className="max-w-32 truncate text-sm font-semibold">
                        {name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                        {roleLabel[role] ?? "User"}
                    </p>
                </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" sideOffset={8} className="w-60">
                <div className="p-3">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-primary/20">
                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-sm font-semibold text-primary-foreground">
                                {initials}
                            </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                                {name}
                            </p>

                            <p className="truncate text-xs text-muted-foreground">
                                @{username}
                            </p>

                            <p className="mt-0.5 text-[10px] text-muted-foreground">
                                {roleLabel[role] ?? "User"}
                            </p>
                        </div>
                    </div>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => router.push(dashboard)}>
                    <LayoutDashboard />
                    Dashboard
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <UserIcon />
                    My Profile
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => router.push("/dashboard/notifications")}
                >
                    <Bell />
                    Notifications
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => router.push("/dashboard/settings")}
                >
                    <Settings />
                    Settings
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/signin" })}
                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                    <LogOut />
                    Sign Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}