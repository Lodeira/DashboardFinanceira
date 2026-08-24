"use client";

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface FabProps {
  onClick: () => void;
  className?: string;
  label?: string;
}

export function Fab({ onClick, className, label = "Adicionar" }: FabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "fixed z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-[0_10px_30px_rgba(11,35,72,0.35)] transition hover:bg-primary-medium active:scale-95",
        "bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-4 lg:bottom-8 lg:right-8",
        className
      )}
    >
      <Plus className="h-7 w-7" strokeWidth={2.2} />
    </button>
  );
}
