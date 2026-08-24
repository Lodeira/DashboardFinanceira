import { cn } from "@/lib/utils/cn";

interface AppLogoProps {
  size?: number;
  className?: string;
}

/** Símbolo temporário — fácil de substituir depois. */
export function AppLogo({ size = 36, className }: AppLogoProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary-medium to-primary text-white shadow-soft",
        className
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        width={size * 0.48}
        height={size * 0.48}
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M6 18V8.5C6 7.12 7.12 6 8.5 6H12c2.2 0 4 1.6 4 3.6S14.2 13.2 12 13.2H8.2"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.2 13.2H13c2.1 0 3.8 1.4 3.8 3.2S15.1 19.5 13 19.5H8.5"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.75"
        />
      </svg>
    </div>
  );
}
