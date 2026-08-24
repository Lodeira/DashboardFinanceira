"use client";

import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  className,
}: BottomSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-primary/45 backdrop-blur-[2px]"
        aria-label="Fechar"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-10 flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-[28px] bg-white shadow-soft animate-sheet-up sm:rounded-[28px] sm:animate-fade-up",
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
      >
        <div className="flex items-center justify-center pt-3 sm:hidden">
          <div className="h-1.5 w-12 rounded-full bg-border" />
        </div>
        <div className="flex items-center justify-between px-5 pb-2 pt-3">
          <h2 id="sheet-title" className="text-lg font-semibold text-text-primary">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-3 py-1.5 text-sm text-text-secondary hover:bg-muted"
          >
            Fechar
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-6 safe-bottom">{children}</div>
      </div>
    </div>
  );
}
