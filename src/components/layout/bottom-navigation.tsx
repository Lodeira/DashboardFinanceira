"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartNoAxesCombined,
  Home,
  ReceiptText,
  Target,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const items = [
  { href: "/", label: "Início", icon: Home },
  { href: "/transactions", label: "Movimentações", icon: ReceiptText },
  { href: "/analytics", label: "Análises", icon: ChartNoAxesCombined },
  { href: "/goals", label: "Metas", icon: Target },
  { href: "/profile", label: "Perfil", icon: User },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-white/95 backdrop-blur-md lg:hidden"
      aria-label="Navegação principal"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1.5">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname.startsWith(href);

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-2xl px-1 py-1.5 text-[10px] font-medium transition",
                  active
                    ? "text-primary"
                    : "text-text-secondary hover:text-primary-medium"
                )}
                aria-current={active ? "page" : undefined}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-2xl transition",
                    active && "bg-accent-light/70"
                  )}
                >
                  <Icon
                    className="h-5 w-5"
                    strokeWidth={active ? 2.25 : 1.75}
                    aria-hidden
                  />
                </span>
                <span className="truncate max-w-[4.5rem]">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
