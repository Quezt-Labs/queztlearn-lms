"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetClientSchedulesByBatch } from "@/hooks";
import { type Schedule, type ScheduleStatus } from "@/lib/types/schedule";
import { StudentScheduleList } from "./student-schedule-list";
import { SectionHeader } from "@/components/common/section-header";
import { Calendar, Radio, Video } from "lucide-react";

/**
 * Batch schedule tab component for students
 *
 * Displays schedules for a purchased batch with filtering by status
 * Premium UI with tabs for All, Upcoming, Live, and Completed schedules
 *
 * @example
 * ```tsx
 * <BatchScheduleTab />
 * ```
 */
export function BatchScheduleTab() {
  const params = useParams();
  const router = useRouter();
  const batchId = params.id as string;
  const [activeTab, setActiveTab] = useState<
    "all" | "upcoming" | "live" | "completed"
  >("all");

  const { data: schedulesResponse, isLoading } =
    useGetClientSchedulesByBatch(batchId);

  const allSchedules: Schedule[] = useMemo(
    () => schedulesResponse?.data || [],
    [schedulesResponse?.data]
  );

  // Helper function to calculate schedule status (matches StudentScheduleCard logic)
  const calculateScheduleStatus = (schedule: Schedule): ScheduleStatus => {
    const scheduledDate = new Date(schedule.scheduledAt);
    const now = new Date();
    const isPastSchedule = scheduledDate < now;

    // Calculate if schedule is currently live (within scheduled time window)
    const scheduledEndTime = new Date(scheduledDate);
    scheduledEndTime.setMinutes(
      scheduledEndTime.getMinutes() + schedule.duration
    );

    const nowTime = now.getTime();
    const startTime = scheduledDate.getTime();
    const endTime = scheduledEndTime.getTime();

    const bufferMs = 5 * 60 * 1000; // 5 minutes
    const isCurrentlyLive =
      nowTime >= startTime - bufferMs &&
      nowTime <= endTime &&
      schedule.status !== "COMPLETED" &&
      schedule.status !== "CANCELLED";

    if (isCurrentlyLive) {
      return "LIVE";
    } else if (schedule.status === "LIVE") {
      return "LIVE";
    } else if (schedule.status) {
      return schedule.status;
    } else {
      return isPastSchedule ? "COMPLETED" : "SCHEDULED";
    }
  };

  // Filter schedules based on active tab
  const filteredSchedules = useMemo(() => {
    switch (activeTab) {
      case "upcoming":
        return allSchedules.filter((schedule) => {
          const status = calculateScheduleStatus(schedule);
          return status === "SCHEDULED";
        });
      case "live":
        return allSchedules.filter((schedule) => {
          const status = calculateScheduleStatus(schedule);
          return status === "LIVE";
        });
      case "completed":
        return allSchedules.filter((schedule) => {
          const status = calculateScheduleStatus(schedule);
          return status === "COMPLETED";
        });
      default:
        return allSchedules.filter(
          (schedule) => schedule.status !== "CANCELLED"
        );
    }
  }, [allSchedules, activeTab]);

  const handleWatch = (schedule: Schedule) => {
    if (schedule.youtubeLink) {
      router.push(`/student/batches/${batchId}/schedule/${schedule.id}`);
    }
  };

  // Calculate counts using the same status calculation logic
  const counts = useMemo(() => {
    const upcoming = allSchedules.filter(
      (s) => calculateScheduleStatus(s) === "SCHEDULED"
    ).length;
    const live = allSchedules.filter(
      (s) => calculateScheduleStatus(s) === "LIVE"
    ).length;
    const completed = allSchedules.filter(
      (s) => calculateScheduleStatus(s) === "COMPLETED"
    ).length;
    const all = allSchedules.filter((s) => s.status !== "CANCELLED").length;

    return { all, upcoming, live, completed };
  }, [allSchedules]);

  return (
    <div className="space-y-6 lg:space-y-8">
      <SectionHeader
        title="Live Classes"
        subtitle={`${counts.all} ${
          counts.all === 1 ? "class" : "classes"
        } available`}
        showAccent
      />

      <Tabs
        value={activeTab}
        onValueChange={(v) =>
          setActiveTab(v as "all" | "upcoming" | "live" | "completed")
        }
        className="w-full"
      >
        <TabsList className="mb-6 inline-flex h-11 items-center justify-start gap-2 rounded-lg bg-transparent p-0 w-full max-w-2xl border-b border-border/60 shrink-0">
          <TabsTrigger
            value="all"
            className="group relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-t-lg px-4 sm:px-5 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/50"
          >
            <Calendar className="h-4 w-4 transition-transform group-hover:scale-110" />
            <span className="hidden sm:inline">All</span>
            <span className="sm:hidden">All</span>
            <span className="ml-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary transition-colors group-hover:bg-primary/20 data-[state=active]:bg-primary/20">
              {counts.all}
            </span>
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full scale-x-0 data-[state=active]:scale-x-100 transition-transform duration-200 origin-center" />
          </TabsTrigger>
          <TabsTrigger
            value="upcoming"
            className="group relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-t-lg px-4 sm:px-5 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/50"
          >
            <Calendar className="h-4 w-4 transition-transform group-hover:scale-110" />
            <span className="hidden sm:inline">Upcoming</span>
            <span className="sm:hidden">Upcoming</span>
            <span className="ml-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary transition-colors group-hover:bg-primary/20 data-[state=active]:bg-primary/20">
              {counts.upcoming}
            </span>
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full scale-x-0 data-[state=active]:scale-x-100 transition-transform duration-200 origin-center" />
          </TabsTrigger>
          <TabsTrigger
            value="live"
            className="group relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-t-lg px-4 sm:px-5 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/50"
          >
            <Radio className="h-4 w-4 transition-transform group-hover:scale-110" />
            <span className="hidden sm:inline">Live</span>
            <span className="sm:hidden">Live</span>
            <span className="ml-1.5 rounded-full bg-red-500/10 dark:bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400 transition-colors group-hover:bg-red-500/20 data-[state=active]:bg-red-500/20">
              {counts.live}
            </span>
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 dark:bg-red-500 rounded-t-full scale-x-0 data-[state=active]:scale-x-100 transition-transform duration-200 origin-center" />
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="group relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-t-lg px-4 sm:px-5 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/50"
          >
            <Video className="h-4 w-4 transition-transform group-hover:scale-110" />
            <span className="hidden sm:inline">Completed</span>
            <span className="sm:hidden">Done</span>
            <span className="ml-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary transition-colors group-hover:bg-primary/20 data-[state=active]:bg-primary/20">
              {counts.completed}
            </span>
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full scale-x-0 data-[state=active]:scale-x-100 transition-transform duration-200 origin-center" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <StudentScheduleList
            schedules={filteredSchedules}
            isLoading={isLoading}
            onWatch={handleWatch}
            emptyMessage="No Classes Scheduled"
            emptyDescription="Upcoming and live class sessions will be displayed here. Check back soon for scheduled classes."
          />
        </TabsContent>

        <TabsContent value="upcoming" className="mt-0">
          <StudentScheduleList
            schedules={filteredSchedules}
            isLoading={isLoading}
            onWatch={handleWatch}
            emptyMessage="No Upcoming Classes"
            emptyDescription="Upcoming class sessions will appear here once they are scheduled."
          />
        </TabsContent>

        <TabsContent value="live" className="mt-0">
          <StudentScheduleList
            schedules={filteredSchedules}
            isLoading={isLoading}
            onWatch={handleWatch}
            emptyMessage="No Live Classes"
            emptyDescription="Live class sessions will appear here when they start."
          />
        </TabsContent>

        <TabsContent value="completed" className="mt-0">
          <StudentScheduleList
            schedules={filteredSchedules}
            isLoading={isLoading}
            onWatch={handleWatch}
            emptyMessage="No Completed Classes"
            emptyDescription="Completed class recordings will appear here once they are available."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
