import { cn } from "@/lib/utils/cn";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "soft";
  size?: "sm" | "md" | "lg" | "icon";
  children: ReactNode;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
        {
          "bg-primary text-white shadow-soft hover:bg-primary-medium":
            variant === "primary",
          "bg-white text-primary border border-border hover:bg-muted":
            variant === "secondary",
          "bg-transparent text-text-secondary hover:bg-white/60":
            variant === "ghost",
          "bg-danger text-white hover:bg-danger/90": variant === "danger",
          "bg-accent-light/60 text-primary hover:bg-accent-light":
            variant === "soft",
          "h-9 px-3 text-sm rounded-xl": size === "sm",
          "h-11 px-5 text-sm rounded-2xl": size === "md",
          "h-14 px-6 text-base rounded-2xl": size === "lg",
          "h-11 w-11 rounded-2xl": size === "icon",
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
