"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

export interface EmptyStateCardProps {
  /** Icon to display */
  icon: LucideIcon;
  /** Title text */
  title: string;
  /** Description text */
  description: string;
  /** Optional className */
  className?: string;
}

/**
 * Reusable empty state card component
 *
 * Displays a centered empty state with:
 * - Large icon
 * - Title
 * - Description
 *
 * @example
 * ```tsx
 * <EmptyStateCard
 *   icon={BookOpen}
 *   title="No chapters available"
 *   description="Chapters will be available here once they are added."
 * />
 * ```
 */
export function EmptyStateCard({
  icon: Icon,
  title,
  description,
  className,
}: EmptyStateCardProps) {
  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <Icon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground text-center max-w-md">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
