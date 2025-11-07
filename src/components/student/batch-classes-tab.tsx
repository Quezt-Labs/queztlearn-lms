"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetBatchSchedules } from "@/hooks";
import { useParams } from "next/navigation";
import { Calendar, Clock, ExternalLink, Play, Video } from "lucide-react";

interface Schedule {
  id: string;
  title: string;
  description?: string;
  subjectName: string;
  youtubeLink?: string;
  scheduledAt: string;
  duration?: number;
  status: "SCHEDULED" | "LIVE" | "COMPLETED";
}

export function BatchClassesTab() {
  const params = useParams();
  const batchId = params.id as string;

  const { data: schedulesResponse, isLoading } = useGetBatchSchedules(batchId);
  const schedules: Schedule[] = schedulesResponse?.data || [];

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    );
  }

  if (schedules.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-semibold mb-2">No Classes Scheduled</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Class recordings and live sessions will be available here once
              they are scheduled.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {schedules.map((schedule, index) => (
        <motion.div
          key={schedule.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-base sm:text-lg">
                    {schedule.title}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {schedule.subjectName}
                    </Badge>
                    <Badge
                      variant={
                        schedule.status === "COMPLETED"
                          ? "secondary"
                          : schedule.status === "LIVE"
                          ? "destructive"
                          : "default"
                      }
                      className="text-xs"
                    >
                      {schedule.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {schedule.description && (
                <p className="text-sm text-muted-foreground">
                  {schedule.description}
                </p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(schedule.scheduledAt).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>
                    {new Date(schedule.scheduledAt).toLocaleTimeString(
                      "en-IN",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </span>
                </div>
                {schedule.duration && (
                  <div className="flex items-center gap-1.5">
                    <Video className="h-4 w-4" />
                    <span>{schedule.duration} mins</span>
                  </div>
                )}
              </div>
              {schedule.youtubeLink && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  asChild
                >
                  <a
                    href={schedule.youtubeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Watch Recording
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
