"use client";

import { Clock, CheckCircle2, Play, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";

export interface TestCardProps {
  /**
   * Test ID
   */
  id: string;
  /**
   * Test title
   */
  title: string;
  /**
   * Duration in minutes
   */
  durationMinutes: number;
  /**
   * Total marks
   */
  totalMarks: number;
  /**
   * Whether the test is free
   */
  isFree?: boolean;
  /**
   * Attempt status (optional)
   */
  attemptStatus?: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  /**
   * Whether user is enrolled (shows action button)
   */
  isEnrolled?: boolean;
  /**
   * Whether the test is purchased/unlocked
   */
  isPurchased?: boolean;
  /**
   * Link to test instructions/start page
   */
  testLink?: string;
  /**
   * Custom className
   */
  className?: string;
  /**
   * Animation index for staggered animations
   */
  index?: number;
  /**
   * Whether to show internal animation (disable when parent handles animation)
   */
  showAnimation?: boolean;
  /**
   * Whether to show action button
   */
  showAction?: boolean;
  /**
   * Custom action button text
   */
  actionText?: string;
  /**
   * On action click handler
   */
  onActionClick?: () => void;
}

/**
 * Common Test Card Component
 *
 * Displays test information in a clean card format with title, duration, and marks.
 * Supports optional free badge, attempt status, and action buttons.
 *
 * @example
 * ```tsx
 * <TestCard
 *   id="test-1"
 *   title="Back to Basic"
 *   durationMinutes={60}
 *   totalMarks={102}
 *   isFree={false}
 *   testLink="/student/tests/test-1/instructions"
 * />
 * ```
 */
export function TestCard({
  id,
  title,
  durationMinutes,
  totalMarks,
  isFree = false,
  attemptStatus,
  isEnrolled = false,
  isPurchased = true,
  testLink,
  className,
  index = 0,
  showAnimation = true,
  showAction = true,
  actionText,
  onActionClick,
}: TestCardProps) {
  const getActionText = () => {
    if (actionText) return actionText;
    if (attemptStatus === "COMPLETED") return "Review";
    if (attemptStatus === "IN_PROGRESS") return "Resume";
    return "Start";
  };

  const getActionVariant = () => {
    if (attemptStatus === "COMPLETED") return "outline";
    return "default";
  };

  const cardContent = (
    <Card
      className={cn(
        "bg-card/95 text-card-foreground flex flex-col gap-6 rounded-xl border border-border/60 py-6 shadow-md hover:shadow-md transition-shadow",
        className
      )}
    >
      <CardContent className="p-0 px-6 flex flex-col gap-6">
        {/* Title and Info in one line */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-lg leading-tight">{title}</h4>
            {!isPurchased && (
              <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span>{durationMinutes} min</span>
            <span>{totalMarks} marks</span>
            {isFree && (
              <Badge variant="secondary" className="text-xs">
                Free
              </Badge>
            )}
          </div>
        </div>

        {/* Attempt Status */}
        {attemptStatus && (
          <Badge
            variant={
              attemptStatus === "COMPLETED"
                ? "default"
                : attemptStatus === "IN_PROGRESS"
                ? "secondary"
                : "outline"
            }
            className="w-fit"
          >
            {attemptStatus === "COMPLETED" ? (
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3" />
                Completed
              </span>
            ) : attemptStatus === "IN_PROGRESS" ? (
              "In Progress"
            ) : (
              "Not Started"
            )}
          </Badge>
        )}

        {/* Action Button */}
        {showAction && (isEnrolled || testLink) && (
          <div className="pt-2">
            {testLink ? (
              <Button
                asChild
                size="sm"
                variant={getActionVariant()}
                className="w-full sm:w-auto"
              >
                <Link href={testLink}>
                  <Play className="mr-2 h-4 w-4" />
                  {getActionText()}
                </Link>
              </Button>
            ) : onActionClick ? (
              <Button
                size="sm"
                variant={getActionVariant()}
                onClick={onActionClick}
                className="w-full sm:w-auto"
              >
                <Play className="mr-2 h-4 w-4" />
                {getActionText()}
              </Button>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Only apply internal animation if showAnimation is true and index > 0
  if (showAnimation && index > 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
}
