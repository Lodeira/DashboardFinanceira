import { cn } from "@/lib/utils/cn";

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl bg-accent-light/40",
        className
      )}
      aria-hidden
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <LoadingSkeleton className="h-8 w-48" />
      <LoadingSkeleton className="h-44 w-full rounded-[28px]" />
      <div className="grid grid-cols-2 gap-3">
        <LoadingSkeleton className="h-24" />
        <LoadingSkeleton className="h-24" />
        <LoadingSkeleton className="h-24" />
        <LoadingSkeleton className="h-24" />
      </div>
      <LoadingSkeleton className="h-32 w-full" />
    </div>
  );
}
