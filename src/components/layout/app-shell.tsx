"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { DesktopSidebar } from "@/components/layout/desktop-sidebar";
import { DemoBanner } from "@/components/layout/demo-banner";
import { DashboardSkeleton } from "@/components/ui/loading-skeleton";
import { isDemoMode } from "@/lib/supabase/config";
import { useFinance } from "@/providers/finance-provider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { loading, authenticated, profile, demoMode } = useFinance();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/onboarding");

  useEffect(() => {
    if (loading) return;

    if (!authenticated && !isAuthRoute) {
      router.replace("/login");
      return;
    }

    if (
      authenticated &&
      profile &&
      !profile.onboarding_completed &&
      pathname !== "/onboarding"
    ) {
      router.replace("/onboarding");
      return;
    }

    if (
      authenticated &&
      profile?.onboarding_completed &&
      pathname === "/onboarding"
    ) {
      router.replace("/");
    }

    if (authenticated && pathname === "/login") {
      router.replace(
        profile?.onboarding_completed ? "/" : "/onboarding"
      );
    }
  }, [authenticated, loading, pathname, profile, router, isAuthRoute]);

  if (loading && !isAuthRoute) {
    return <DashboardSkeleton />;
  }

  if (isAuthRoute) {
    return <>{children}</>;
  }

  if (!authenticated) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-dvh bg-background">
      <DemoBanner />
      <div className="mx-auto flex min-h-dvh w-full max-w-7xl">
        <DesktopSidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <BottomNavigation />
      {demoMode || isDemoMode() ? null : null}
    </div>
  );
}
