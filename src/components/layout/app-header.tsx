"use client";

import { Bell, Menu } from "lucide-react";
import { AppLogo } from "@/components/layout/app-logo";
import { appConfig } from "@/lib/config";
import { cn } from "@/lib/utils/cn";

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showBrand?: boolean;
  rightSlot?: React.ReactNode;
  className?: string;
}

export function AppHeader({
  title,
  subtitle,
  showBrand = false,
  rightSlot,
  className,
}: AppHeaderProps) {
  return (
    <header
      className={cn(
        "safe-top flex items-start justify-between gap-3 px-4 pb-2 pt-2",
        className
      )}
    >
      <div className="min-w-0">
        {showBrand ? (
          <div className="mb-3 flex items-center gap-2.5 lg:hidden">
            <AppLogo size={34} />
            <span className="text-sm font-semibold text-primary">
              {appConfig.name}
            </span>
          </div>
        ) : null}
        {title ? (
          <h1 className="truncate text-2xl font-semibold tracking-tight text-text-primary">
            {title}
          </h1>
        ) : null}
        {subtitle ? (
          <p className="mt-0.5 text-sm text-text-secondary">{subtitle}</p>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        {rightSlot}
        <button
          type="button"
          className="hidden h-10 w-10 items-center justify-center rounded-2xl bg-white text-text-secondary shadow-card lg:flex"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-text-secondary shadow-card lg:hidden"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
