"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useGetClientSchedulesByBatch } from "@/hooks";
import { type Schedule } from "@/lib/types/schedule";
import { StudentScheduleList } from "./student-schedule-list";
import { SectionHeader } from "@/components/common/section-header";
import { Video } from "lucide-react";

/**
 * Batch classes tab component for students
 *
 * Displays completed class recordings for a purchased batch
 * Premium UI optimized for viewing recorded sessions
 *
 * @example
 * ```tsx
 * <BatchClassesTab />
 * ```
 */
export function BatchClassesTab() {
  const params = useParams();
  const batchId = params.id as string;

  const { data: schedulesResponse, isLoading } =
    useGetClientSchedulesByBatch(batchId);

  const allSchedules: Schedule[] = useMemo(
    () => schedulesResponse?.data || [],
    [schedulesResponse?.data]
  );

  // Filter only completed classes with recordings (youtubeLink)
  const schedules = useMemo(
    () =>
      allSchedules.filter(
        (schedule) => schedule.status === "COMPLETED" && schedule.youtubeLink
      ),
    [allSchedules]
  );

  const handleWatch = (schedule: Schedule) => {
    if (schedule.youtubeLink) {
      window.open(schedule.youtubeLink, "_blank");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <SectionHeader
        title="Recorded Classes"
        subtitle={`${schedules.length} ${
          schedules.length === 1 ? "recording" : "recordings"
        } available`}
        showAccent
      />

      <StudentScheduleList
        schedules={schedules}
        isLoading={isLoading}
        onWatch={handleWatch}
        emptyMessage="No Recorded Classes Available"
        emptyDescription="Recorded class sessions will be available here once they are completed and uploaded."
      />
    </div>
  );
}
