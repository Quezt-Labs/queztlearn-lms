"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Youtube,
  Play,
  Radio,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { format, formatDistanceToNow, isPast, isFuture } from "date-fns";
import { type Schedule, type ScheduleStatus } from "@/lib/types/schedule";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { motion } from "framer-motion";

export interface StudentScheduleCardProps {
  /** Schedule data */
  schedule: Schedule;
  /** Callback when watch/join is clicked */
  onWatch?: (schedule: Schedule) => void;
  /** Optional animation delay */
  animationDelay?: number;
  /** Optional className */
  className?: string;
}

/**
 * Premium student schedule card component
 * 
 * Displays schedule information optimized for student viewing with:
 * - Premium visual design with thumbnails
 * - Live status indicators
 * - Join/Watch buttons
 * - Mobile responsive layout
 * - Dark mode support
 * 
 * @example
 * ```tsx
 * <StudentScheduleCard
 *   schedule={schedule}
 *   onWatch={(s) => handleJoin(s)}
 * />
 * ```
 */
export function StudentScheduleCard({
  schedule,
  onWatch,
  animationDelay = 0,
  className,
}: StudentScheduleCardProps) {
  const scheduledDate = new Date(schedule.scheduledAt);
  const isUpcoming = isFuture(scheduledDate);
  const isPastSchedule = isPast(scheduledDate);
  const status = schedule.status || (isPastSchedule ? "COMPLETED" : "SCHEDULED");

  const getStatusConfig = (status: ScheduleStatus) => {
    switch (status) {
      case "LIVE":
        return {
          label: "Live Now",
          icon: Radio,
          className:
            "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
          badgeClassName: "bg-red-600 dark:bg-red-700 text-white",
        };
      case "COMPLETED":
        return {
          label: "Completed",
          icon: CheckCircle2,
          className:
            "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
          badgeClassName: "bg-green-600 dark:bg-green-700 text-white",
        };
      case "CANCELLED":
        return {
          label: "Cancelled",
          icon: Calendar,
          className:
            "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800",
          badgeClassName: "bg-gray-600 dark:bg-gray-700 text-white",
        };
      default:
        return {
          label: "Scheduled",
          icon: Calendar,
          className:
            "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
          badgeClassName: "bg-blue-600 dark:bg-blue-700 text-white",
        };
    }
  };

  const statusConfig = getStatusConfig(status);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const handleWatch = () => {
    if (onWatch && schedule.youtubeLink) {
      onWatch(schedule);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: animationDelay }}
    >
      <Card
        className={cn(
          "group relative overflow-hidden border transition-all duration-300 hover:shadow-xl hover:scale-[1.01]",
          status === "LIVE" &&
            "border-red-500/50 dark:border-red-500/50 shadow-red-500/10 dark:shadow-red-500/20",
          className
        )}
      >
        <CardContent className="p-0">
          {/* Thumbnail Section */}
          {schedule.thumbnailUrl ? (
            <div className="relative aspect-video overflow-hidden bg-muted">
              <Image
                src={schedule.thumbnailUrl}
                alt={schedule.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {status === "LIVE" && (
                <div className="absolute inset-0 bg-red-500/20 dark:bg-red-500/30 flex items-center justify-center">
                  <motion.div
                    className="flex items-center gap-2 bg-red-600 dark:bg-red-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-2xl"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Radio className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
                    <span className="font-bold text-sm sm:text-base">
                      LIVE NOW
                    </span>
                  </motion.div>
                </div>
              )}
              {onWatch && (status === "LIVE" || status === "COMPLETED") && (
                <div className="absolute inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="lg"
                    onClick={handleWatch}
                    className="gap-2 text-sm sm:text-base shadow-2xl"
                  >
                    <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                    {status === "LIVE" ? "Join Live" : "Watch Recording"}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="relative aspect-video bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 flex items-center justify-center">
              <Youtube className="h-12 w-12 sm:h-16 sm:w-16 text-primary/40 dark:text-primary/50" />
              {status === "LIVE" && (
                <div className="absolute inset-0 bg-red-500/20 dark:bg-red-500/30 flex items-center justify-center">
                  <motion.div
                    className="flex items-center gap-2 bg-red-600 dark:bg-red-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-2xl"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Radio className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
                    <span className="font-bold text-sm sm:text-base">
                      LIVE NOW
                    </span>
                  </motion.div>
                </div>
              )}
            </div>
          )}

          {/* Content Section */}
          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-lg sm:text-xl leading-tight line-clamp-2 flex-1 group-hover:text-primary transition-colors">
                  {schedule.title}
                </h3>
                <Badge
                  variant="secondary"
                  className={cn(
                    "shrink-0 text-xs sm:text-sm",
                    statusConfig.className
                  )}
                >
                  <statusConfig.icon className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">{statusConfig.label}</span>
                  <span className="sm:hidden">
                    {statusConfig.label.slice(0, 4)}
                  </span>
                </Badge>
              </div>
              {schedule.description && (
                <p className="text-sm sm:text-base text-muted-foreground line-clamp-2">
                  {schedule.description}
                </p>
              )}
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span className="truncate">
                  {format(scheduledDate, "MMM dd, yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span className="truncate">
                  {format(scheduledDate, "h:mm a")} •{" "}
                  {formatDuration(schedule.duration)}
                </span>
              </div>
              {schedule.subjectName && (
                <Badge
                  variant="outline"
                  className="text-xs shrink-0 border-border/60 dark:border-border/40"
                >
                  {schedule.subjectName}
                </Badge>
              )}
            </div>

            {/* Time Info */}
            {isUpcoming && status !== "LIVE" && (
              <div className="text-xs sm:text-sm text-muted-foreground bg-muted/50 dark:bg-muted/30 rounded-lg px-3 py-2">
                <span className="font-medium">Starts in: </span>
                {formatDistanceToNow(scheduledDate, { addSuffix: true })}
              </div>
            )}

            {/* Tags */}
            {schedule.tags && schedule.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {schedule.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs py-0.5 px-2 border-border/60 dark:border-border/40"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3 pt-3 border-t border-border/50 dark:border-border/30">
              {onWatch && (status === "LIVE" || status === "COMPLETED") && (
                <Button
                  size="sm"
                  variant={status === "LIVE" ? "default" : "outline"}
                  onClick={handleWatch}
                  className={cn(
                    "flex-1 sm:flex-initial text-xs sm:text-sm",
                    status === "LIVE" &&
                      "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                  )}
                >
                  {status === "LIVE" ? (
                    <>
                      <Radio className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 animate-pulse" />
                      <span className="hidden sm:inline">Join Live Class</span>
                      <span className="sm:hidden">Join Live</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                      <span>Watch Recording</span>
                    </>
                  )}
                </Button>
              )}
              {schedule.youtubeLink && !onWatch && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(schedule.youtubeLink, "_blank")}
                  className="flex-1 sm:flex-initial text-xs sm:text-sm"
                >
                  <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  <span className="hidden sm:inline">Open Link</span>
                  <span className="sm:hidden">Open</span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

