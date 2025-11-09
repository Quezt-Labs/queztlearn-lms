"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetClientSchedulesByBatch } from "@/hooks";
import { type Schedule } from "@/lib/types/schedule";
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

  // Filter schedules based on active tab
  const filteredSchedules = useMemo(() => {
    const now = new Date();
    switch (activeTab) {
      case "upcoming":
        return allSchedules.filter(
          (schedule) =>
            new Date(schedule.scheduledAt) > now &&
            schedule.status !== "COMPLETED" &&
            schedule.status !== "CANCELLED" &&
            schedule.status !== "LIVE"
        );
      case "live":
        return allSchedules.filter((schedule) => schedule.status === "LIVE");
      case "completed":
        return allSchedules.filter(
          (schedule) =>
            schedule.status === "COMPLETED" ||
            (new Date(schedule.scheduledAt) < now &&
              schedule.status !== "CANCELLED" &&
              schedule.status !== "LIVE")
        );
      default:
        return allSchedules.filter(
          (schedule) => schedule.status !== "CANCELLED"
        );
    }
  }, [allSchedules, activeTab]);

  const handleWatch = (schedule: Schedule) => {
    if (schedule.youtubeLink) {
      window.open(schedule.youtubeLink, "_blank");
    }
  };

  const upcomingCount = allSchedules.filter(
    (s) =>
      new Date(s.scheduledAt) > new Date() &&
      s.status !== "COMPLETED" &&
      s.status !== "CANCELLED" &&
      s.status !== "LIVE"
  ).length;

  const liveCount = allSchedules.filter((s) => s.status === "LIVE").length;

  const completedCount = allSchedules.filter(
    (s) =>
      s.status === "COMPLETED" ||
      (new Date(s.scheduledAt) < new Date() &&
        s.status !== "CANCELLED" &&
        s.status !== "LIVE")
  ).length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <SectionHeader
        title="Live Classes"
        subtitle={`${allSchedules.filter((s) => s.status !== "CANCELLED").length} ${allSchedules.filter((s) => s.status !== "CANCELLED").length === 1 ? "class" : "classes"} available`}
        showAccent
      />

      <Tabs
        value={activeTab}
        onValueChange={(v) =>
          setActiveTab(v as "all" | "upcoming" | "live" | "completed")
        }
        className="w-full"
      >
        <TabsList className="mb-4 w-full sm:w-auto grid grid-cols-2 sm:grid-cols-4 sm:inline-flex h-auto bg-muted/50 dark:bg-muted/30 border border-border/60 dark:border-border/40 rounded-lg p-1">
          <TabsTrigger
            value="all"
            className="group relative text-xs sm:text-sm flex-1 sm:flex-initial data-[state=active]:bg-background dark:data-[state=active]:bg-background"
          >
            <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5 transition-transform group-hover:scale-110" />
            <span className="hidden sm:inline">All </span>
            <span className="sm:hidden">All</span>
            <span className="ml-1.5 rounded-full bg-primary/10 dark:bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
              {allSchedules.filter((s) => s.status !== "CANCELLED").length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="upcoming"
            className="group relative text-xs sm:text-sm flex-1 sm:flex-initial data-[state=active]:bg-background dark:data-[state=active]:bg-background"
          >
            <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5 transition-transform group-hover:scale-110" />
            <span className="hidden sm:inline">Upcoming </span>
            <span className="sm:hidden">Upcoming</span>
            <span className="ml-1.5 rounded-full bg-primary/10 dark:bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
              {upcomingCount}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="live"
            className="group relative text-xs sm:text-sm flex-1 sm:flex-initial data-[state=active]:bg-background dark:data-[state=active]:bg-background"
          >
            <Radio className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5 transition-transform group-hover:scale-110" />
            <span className="hidden sm:inline">Live </span>
            <span className="sm:hidden">Live</span>
            <span className="ml-1.5 rounded-full bg-red-500/10 dark:bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400">
              {liveCount}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="group relative text-xs sm:text-sm flex-1 sm:flex-initial data-[state=active]:bg-background dark:data-[state=active]:bg-background"
          >
            <Video className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5 transition-transform group-hover:scale-110" />
            <span className="hidden sm:inline">Completed </span>
            <span className="sm:hidden">Done</span>
            <span className="ml-1.5 rounded-full bg-primary/10 dark:bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
              {completedCount}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <StudentScheduleList
            schedules={filteredSchedules}
            isLoading={isLoading}
            onWatch={handleWatch}
            emptyMessage="No Live Classes Scheduled"
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
