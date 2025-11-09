"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Calendar, Clock, Radio, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type Player from "video.js/dist/types/player";
import { useGetClientSchedule } from "@/hooks";
import { UnifiedVideoPlayer } from "@/components/common/unified-video-player";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/common/loading-spinner";

export default function SchedulePlayerPage() {
  const params = useParams();
  const router = useRouter();
  const batchId = params.id as string;
  const scheduleId = params.scheduleId as string;

  const [playerInstance, setPlayerInstance] = useState<Player | null>(null);

  const { data: schedule, isLoading } = useGetClientSchedule(scheduleId);

  const handleGoBack = () => {
    router.push(`/student/batches/${batchId}`);
  };

  const getVideoType = ():
    | "video/mp4"
    | "application/x-mpegURL"
    | "video/webm"
    | "video/youtube" => {
    // Schedules always use YouTube links
    return "video/youtube";
  };

  const getStatusConfig = (status?: string) => {
    switch (status) {
      case "LIVE":
        return {
          label: "Live Now",
          icon: Radio,
          className:
            "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
        };
      case "COMPLETED":
        return {
          label: "Completed",
          icon: CheckCircle2,
          className:
            "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
        };
      default:
        return {
          label: "Scheduled",
          icon: Calendar,
          className:
            "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
        };
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (!schedule || !schedule.youtubeLink) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Schedule not found</h2>
            <p className="text-muted-foreground mb-6">
              The schedule you&apos;re looking for doesn&apos;t exist or
              doesn&apos;t have a video link.
            </p>
            <Button onClick={handleGoBack}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusConfig = getStatusConfig(schedule.status);
  const StatusIcon = statusConfig.icon;
  const scheduledDate = new Date(schedule.scheduledAt);
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Normalize YouTube URL for video player
  // UnifiedVideoPlayer can handle embed URLs directly, but we'll normalize to watch URL for consistency
  const normalizeYouTubeUrl = (url: string): string => {
    // If it's already a watch URL or youtu.be, use it as is
    if (url.includes("youtube.com/watch") || url.includes("youtu.be/")) {
      return url;
    }

    // Extract video ID from embed URL
    const embedMatch = url.match(/youtube\.com\/embed\/([^&\n?#]+)/);
    if (embedMatch && embedMatch[1]) {
      return `https://www.youtube.com/watch?v=${embedMatch[1]}`;
    }

    // Fallback to original URL
    return url;
  };

  const youtubeUrl = normalizeYouTubeUrl(schedule.youtubeLink);

  return (
    <div className="container max-w-7xl mx-auto px-4 py-4 lg:py-6">
      {/* Header */}
      <div className="mb-4 lg:mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGoBack}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Batch
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              {schedule.title}
            </h1>
            {schedule.description && (
              <p className="text-muted-foreground text-sm sm:text-base">
                {schedule.description}
              </p>
            )}
          </div>
          <Badge
            variant="outline"
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm",
              statusConfig.className
            )}
          >
            <StatusIcon className="h-3.5 w-3.5" />
            {statusConfig.label}
          </Badge>
        </div>
      </div>

      {/* Video Player */}
      <Card className="mb-6">
        <CardContent className="p-0">
          <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
            {schedule.youtubeLink ? (
              <UnifiedVideoPlayer
                src={youtubeUrl}
                poster={schedule.thumbnailUrl}
                type={getVideoType()}
                className="w-full h-full"
                autoplay={false}
                onReady={(player) => {
                  setPlayerInstance(player);
                  const playerEl = player.el() as HTMLElement;
                  if (playerEl) {
                    playerEl.style.width = "100%";
                    playerEl.style.height = "100%";
                    player.fluid(false);
                    player.dimensions("100%", "100%");
                  }
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-white">
                <p>Video not available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Schedule Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Schedule Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Scheduled Date</p>
                <p className="font-medium">
                  {format(scheduledDate, "PPP 'at' p")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">
                  {formatDuration(schedule.duration)}
                </p>
              </div>
            </div>
            {schedule.subjectName && (
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Subject</p>
                  <p className="font-medium">{schedule.subjectName}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {schedule.description && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {schedule.description}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
