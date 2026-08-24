"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartNoAxesCombined,
  Home,
  PiggyBank,
  ReceiptText,
  Target,
  User,
} from "lucide-react";
import { appConfig } from "@/lib/config";
import { cn } from "@/lib/utils/cn";
import { AppLogo } from "@/components/layout/app-logo";

const items = [
  { href: "/", label: "Início", icon: Home },
  { href: "/transactions", label: "Movimentações", icon: ReceiptText },
  { href: "/analytics", label: "Análises", icon: ChartNoAxesCombined },
  { href: "/goals", label: "Metas", icon: Target },
  { href: "/reserve", label: "Reserva", icon: PiggyBank },
  { href: "/profile", label: "Perfil", icon: User },
];

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-border lg:bg-white/70 lg:backdrop-blur-sm">
      <div className="flex items-center gap-3 px-6 py-6">
        <AppLogo size={40} />
        <div>
          <p className="font-semibold text-primary leading-tight">
            {appConfig.name}
          </p>
          <p className="text-xs text-text-secondary">Finanças pessoais</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3" aria-label="Menu">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                active
                  ? "bg-primary text-white shadow-soft"
                  : "text-text-secondary hover:bg-muted hover:text-primary"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={1.9} aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
