"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  FileText,
  Calendar,
  Award,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { STUDENT_NAVIGATION_ITEMS } from "@/lib/constants";

// Extended navigation item type with optional badge
interface NavigationItemWithBadge {
  title: string;
  href: string;
  icon: string;
  badge?: number | boolean; // Number for count, boolean for dot indicator
}

const iconMap = {
  LayoutDashboard: LayoutDashboard,
  BookOpen: BookOpen,
  TrendingUp: TrendingUp,
  FileText: FileText,
  Calendar: Calendar,
  Award: Award,
};

// Special handling for Assignments - using ClipboardList icon
const getIcon = (iconName: string, title: string) => {
  if (title === "Assignments") {
    return ClipboardList;
  }
  return iconMap[iconName as keyof typeof iconMap] || FileText;
};

interface MobileBottomTabsProps {
  badges?: Record<string, number | boolean>; // Map of href to badge value
  isLoading?: boolean;
}

export function MobileBottomTabs({
  badges = {},
  isLoading = false,
}: MobileBottomTabsProps) {
  const pathname = usePathname();

  // Active route detection function
  const isActive = (href: string) => {
    if (!pathname) return false;

    // Normalize: remove client segment if present (e.g., /mit/student/dashboard -> /student/dashboard)
    const normalizedPath =
      pathname.replace(/^\/[^/]+(?=\/student)/, "") || pathname;

    // Handle exact match for dashboard
    if (href === "/student/dashboard") {
      return (
        normalizedPath === "/student/dashboard" ||
        normalizedPath === "/dashboard"
      );
    }

    // Exact match - highest priority
    if (normalizedPath === href) {
      return true;
    }

    // Check if path is a sub-route of href (e.g., /student/explore/batches)
    // Must start with href followed by a forward slash to avoid partial matches
    // This prevents /student/my-learning from matching /student/my-learning-explore
    if (normalizedPath.startsWith(href)) {
      const nextChar = normalizedPath[href.length];
      // Only match if next character is a slash (sub-route) or end of string
      return nextChar === "/" || nextChar === undefined;
    }

    return false;
  };

  // Filter navigation items - UX best practice: 4-5 items max for optimal usability
  // Prioritize: Dashboard, Batches, Progress, Tests, Grades
  const navItems = STUDENT_NAVIGATION_ITEMS.slice(0, 5).map((item) => ({
    ...item,
    badge: badges[item.href],
  })); // Reduced from 7 to 5 for better UX

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    // Normalize paths for comparison
    const normalizedPath =
      pathname?.replace(/^\/[^/]+(?=\/student)/, "") || pathname;
    const normalizedHref = href.replace(/^\/[^/]+(?=\/student)/, "");

    // Only scroll if we're navigating to a different route
    if (
      normalizedPath !== normalizedHref &&
      !normalizedPath?.startsWith(normalizedHref + "/")
    ) {
      // Scroll to top when navigating to a new route
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "auto",
        });
      }, 50);
    }
  };

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        // Premium glassmorphism
        "bg-background/80 dark:bg-background/90",
        "backdrop-blur-xl backdrop-saturate-150",
        "supports-[backdrop-filter]:bg-background/70 supports-[backdrop-filter]:dark:bg-background/85",
        // Premium border with gradient
        "border-t border-border/60 dark:border-border/40",
        // Premium shadow with multiple layers
        "shadow-[0_-4px_24px_-4px_rgba(0,0,0,0.08),0_-8px_32px_-8px_rgba(0,0,0,0.04)]",
        "dark:shadow-[0_-4px_24px_-4px_rgba(0,0,0,0.3),0_-8px_32px_-8px_rgba(0,0,0,0.2)]",
        // Layout
        "flex items-center justify-around",
        "px-1 py-1",
        "md:hidden", // Only show on mobile
        // Premium overflow handling
        "overflow-hidden"
      )}
      style={{
        paddingBottom:
          "max(0.5rem, calc(0.5rem + env(safe-area-inset-bottom)))",
        paddingTop: "0.5rem",
      }}
    >
      {/* Premium top border glow effect */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-50" />

      {/* Loading skeleton */}
      {isLoading ? (
        <div className="flex items-center justify-around w-full px-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1">
              <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
              <div className="w-12 h-2 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        navItems.map((item, index) => {
          const Icon = getIcon(item.icon, item.title);
          const active = isActive(item.href);

          return (
            <div key={item.href} className="flex-1 min-w-0">
              <Link
                href={item.href}
                onClick={(e) => handleClick(e, item.href)}
                className={cn(
                  "relative flex flex-col items-center justify-center",
                  "min-w-0 w-full px-2 py-2",
                  "min-h-[44px] rounded-xl", // WCAG 2.1 AAA: 44px minimum touch target
                  "touch-manipulation select-none", // Optimize for touch
                  "overflow-hidden",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" // Keyboard accessibility
                )}
                aria-label={item.title}
                aria-current={active ? "page" : undefined}
              >
                <div
                  className={cn(
                    "relative flex items-center justify-center",
                    "w-10 h-10 rounded-full mb-1", // Slightly larger for better visual balance
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <div className="flex items-center justify-center relative z-10">
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        active ? "text-primary" : "text-muted-foreground",
                        "relative z-10"
                      )}
                      strokeWidth={active ? 2.5 : 2}
                      aria-hidden="true" // Icon is decorative, label provides context
                    />
                  </div>

                  {/* Badge/Notification indicator */}
                  {item.badge !== undefined && item.badge !== false && (
                    <div
                      className={cn(
                        "absolute -top-0.5 -right-0.5 flex items-center justify-center",
                        "rounded-full bg-destructive text-destructive-foreground",
                        "text-[10px] font-bold leading-none",
                        typeof item.badge === "number" && item.badge > 0
                          ? "min-w-[18px] h-[18px] px-1"
                          : "w-2 h-2"
                      )}
                      aria-label={
                        typeof item.badge === "number"
                          ? `${item.badge} notifications`
                          : "New notification"
                      }
                    >
                      {typeof item.badge === "number" && item.badge > 0 && (
                        <span className="px-0.5">
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium leading-tight",
                    "px-0.5",
                    "relative z-10",
                    "overflow-hidden text-ellipsis whitespace-nowrap",
                    "max-w-full",
                    active
                      ? "text-primary font-semibold"
                      : "text-muted-foreground"
                  )}
                  style={{
                    maxWidth: "calc((100vw - 2rem) / 5 - 0.5rem)",
                  }}
                  title={item.title}
                >
                  {item.title}
                </span>
              </Link>
            </div>
          );
        })
      )}
    </nav>
  );
}
