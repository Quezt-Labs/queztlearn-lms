"use client";

import { ReactNode } from "react";
import { Sidebar } from "@/components/common/sidebar";
import { MobileBottomTabs } from "@/components/common/mobile-bottom-tabs";
import { useRequireAuth } from "@/hooks";
import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";

interface StudentLayoutProps {
  children: ReactNode;
}

export function StudentLayout({ children }: StudentLayoutProps) {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const pathname = usePathname();
  const isAttemptRoute = Boolean(
    pathname?.includes("/student/tests/") && pathname?.endsWith("/attempt")
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-background relative">
      {/* Hide sidebar on student test attempt route for distraction-free exam mode */}
      {/* Hide sidebar completely on mobile - students use bottom tabs for navigation */}
      {!isAttemptRoute ? (
        <div className="hidden md:block">
          <Sidebar />
        </div>
      ) : null}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 w-full md:w-auto">
        {/* Student routes use StudentHeader in page content, not the main Header */}
        <main
          className={
            !isAttemptRoute
              ? "flex-1 overflow-y-auto overflow-x-hidden bg-[radial-gradient(80rem_50rem_at_120%_-10%,--theme(--color-primary/6),transparent_60%),radial-gradient(60rem_40rem_at_-10%_-20%,--theme(--color-muted/40),transparent_50%)] relative z-0"
              : "flex-1 overflow-auto p-0"
          }
        >
          {children}
        </main>
      </div>
      {/* Mobile bottom tabs - only show for student routes and not on attempt pages */}
      {isAuthenticated && !isAttemptRoute && <MobileBottomTabs />}
    </div>
  );
}
