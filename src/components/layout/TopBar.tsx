"use client";

import Image from "next/image";
import { Bell } from "lucide-react";
import { useSession } from "next-auth/react";

import { ThemeToggle } from "@/components/theme/ThemeToggle";
import UserDropDown from "./UserDropDown";
import { Button } from "@/components/ui/button";
import { User } from "next-auth";
import { useState } from "react";

interface TopBarProps {
  title: string;
  description?: string;
  showLogoOnMobile?: boolean;
  logoTitle?: string;
}

export function TopBar({
  title,
  description,
  showLogoOnMobile = true,
  logoTitle = "Kakshyasathi",
}: TopBarProps) {
  const { data: session } = useSession();
  const [userdropdownOpen, setUserdropdownOpen] = useState(false)

  return (
    <header
      className="
        sticky top-0 z-40
        flex h-14 items-center justify-between
        border-b border-border
        bg-background/80
        px-3
        backdrop-blur-xl
        sm:h-16 sm:px-5 lg:px-6
      "
    >
      {/* ─────────────────────────────────────────────
          Left
      ───────────────────────────────────────────── */}

      <div className="flex min-w-0 items-center gap-3">
        {/* Brand */}
        <div className="flex shrink-0 items-center gap-2 lg:hidden">
          <div
            className={`
              flex h-8 w-8 items-center justify-center
              rounded-lg bg-primary/10 p-1
              ${!showLogoOnMobile ? "hidden sm:flex" : ""}
            `}
          >
            <Image
              src="/logo/icon.png"
              alt={logoTitle}
              width={24}
              height={24}
              className="h-full w-full object-contain"
              priority
            />
          </div>

          <span className="hidden text-sm font-bold tracking-tight sm:block">
            {logoTitle}
          </span>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-border block lg:hidden" />

        {/* Page title */}
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold tracking-tight sm:text-base">
            {title}
          </h1>

          {description && (
            <p className="hidden max-w-md truncate text-xs text-muted-foreground md:block">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          Right
      ───────────────────────────────────────────── */}

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        {/* Notifications */}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="
            relative
            h-8 w-8
            rounded-lg
            sm:h-9 sm:w-9
          "
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />

          {/* Notification indicator */}
          <span
            className="
              absolute right-1.5 top-1.5
              h-1.5 w-1.5
              rounded-full
              bg-primary
              sm:h-2 sm:w-2
            "
          />
        </Button>

        <ThemeToggle />
        <UserDropDown
          user={session?.user as User}
        />
      </div>
    </header>
  );
}