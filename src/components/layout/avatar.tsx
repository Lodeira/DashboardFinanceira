import { cn } from "@/lib/utils/cn";

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Avatar({ name, size = "md", className }: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || "U";

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary-medium font-semibold text-white shadow-soft",
        {
          "h-9 w-9 text-sm": size === "sm",
          "h-11 w-11 text-base": size === "md",
          "h-14 w-14 text-xl": size === "lg",
        },
        className
      )}
      aria-hidden
    >
      {initial}
    </div>
  );
}
