"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { tokenManager } from "@/lib/api/client";
import type {
  Schedule,
  CreateScheduleData,
  UpdateScheduleData,
  UpdateScheduleStatusData,
  ScheduleFilters,
  ScheduleListResponse,
} from "@/lib/types/schedule";

/**
 * Query keys for schedule-related queries
 */
export const scheduleQueryKeys = {
  all: ["schedules"] as const,
  lists: () => [...scheduleQueryKeys.all, "list"] as const,
  list: (filters?: ScheduleFilters) =>
    [...scheduleQueryKeys.lists(), filters] as const,
  details: () => [...scheduleQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...scheduleQueryKeys.details(), id] as const,
  byTopic: (topicId: string) =>
    [...scheduleQueryKeys.all, "topic", topicId] as const,
  byBatch: (batchId: string) =>
    [...scheduleQueryKeys.all, "batch", batchId] as const,
};

/**
 * Create a new schedule
 *
 * @example
 * ```tsx
 * const createSchedule = useCreateSchedule();
 * createSchedule.mutate({
 *   batchId: "...",
 *   subjectId: "...",
 *   title: "Math Class",
 *   scheduledAt: "2025-01-01T10:00:00Z",
 *   duration: 60,
 *   youtubeLink: "https://...",
 *   subjectName: "Mathematics"
 * });
 * ```
 */
export const useCreateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateScheduleData) => {
      const response = await apiClient.post<{ data: Schedule }>(
        "/admin/schedules",
        data
      );
      return response.data.data;
    },
    onSuccess: (newSchedule) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: scheduleQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: scheduleQueryKeys.byBatch(newSchedule.batchId),
      });
      if (newSchedule.topicId) {
        queryClient.invalidateQueries({
          queryKey: scheduleQueryKeys.byTopic(newSchedule.topicId),
        });
      }
    },
  });
};

/**
 * Get all schedules with optional filters
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useGetSchedules({
 *   page: 1,
 *   limit: 10,
 *   status: "SCHEDULED",
 *   upcoming: true
 * });
 * ```
 */
export const useGetSchedules = (filters?: ScheduleFilters) => {
  return useQuery({
    queryKey: scheduleQueryKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.status) params.append("status", filters.status);
      if (filters?.batchId) params.append("batchId", filters.batchId);
      if (filters?.teacherId) params.append("teacherId", filters.teacherId);
      if (filters?.date) params.append("date", filters.date);
      if (filters?.upcoming !== undefined)
        params.append("upcoming", filters.upcoming.toString());

      const response = await apiClient.get<ScheduleListResponse>(
        `/admin/schedules?${params.toString()}`
      );
      return response.data;
    },
    enabled: tokenManager.isAuthenticated(),
  });
};

/**
 * Get all schedules for a specific topic
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useGetSchedulesByTopic(topicId);
 * ```
 */
export const useGetSchedulesByTopic = (topicId: string) => {
  return useQuery({
    queryKey: scheduleQueryKeys.byTopic(topicId),
    queryFn: async () => {
      const response = await apiClient.get<ScheduleListResponse>(
        `/admin/schedules/topic/${topicId}`
      );
      return response.data;
    },
    enabled: !!topicId && tokenManager.isAuthenticated(),
  });
};

/**
 * Get all schedules for a specific batch
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useGetSchedulesByBatch(batchId);
 * ```
 */
export const useGetSchedulesByBatch = (batchId: string) => {
  return useQuery({
    queryKey: scheduleQueryKeys.byBatch(batchId),
    queryFn: async () => {
      const response = await apiClient.get<ScheduleListResponse>(
        `/admin/schedules/batch/${batchId}`
      );
      return response.data;
    },
    enabled: !!batchId && tokenManager.isAuthenticated(),
  });
};

/**
 * Get a single schedule by ID
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useGetSchedule(scheduleId);
 * ```
 */
export const useGetSchedule = (id: string) => {
  return useQuery({
    queryKey: scheduleQueryKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<{ data: Schedule }>(
        `/admin/schedules/${id}`
      );
      return response.data.data;
    },
    enabled: !!id && tokenManager.isAuthenticated(),
  });
};

/**
 * Update a schedule
 *
 * @example
 * ```tsx
 * const updateSchedule = useUpdateSchedule();
 * updateSchedule.mutate({
 *   id: scheduleId,
 *   data: { title: "Updated Title", duration: 90 }
 * });
 * ```
 */
export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateScheduleData;
    }) => {
      const response = await apiClient.patch<{ data: Schedule }>(
        `/admin/schedules/${id}`,
        data
      );
      return response.data.data;
    },
    onSuccess: (updatedSchedule) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: scheduleQueryKeys.detail(updatedSchedule.id),
      });
      queryClient.invalidateQueries({
        queryKey: scheduleQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: scheduleQueryKeys.byBatch(updatedSchedule.batchId),
      });
      if (updatedSchedule.topicId) {
        queryClient.invalidateQueries({
          queryKey: scheduleQueryKeys.byTopic(updatedSchedule.topicId),
        });
      }
    },
  });
};

/**
 * Update schedule status
 *
 * @example
 * ```tsx
 * const updateStatus = useUpdateScheduleStatus();
 * updateStatus.mutate({
 *   id: scheduleId,
 *   status: "COMPLETED"
 * });
 * ```
 */
export const useUpdateScheduleStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: UpdateScheduleStatusData;
    }) => {
      const response = await apiClient.patch<{ data: Schedule }>(
        `/admin/schedules/${id}/status`,
        status
      );
      return response.data.data;
    },
    onSuccess: (updatedSchedule) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: scheduleQueryKeys.detail(updatedSchedule.id),
      });
      queryClient.invalidateQueries({
        queryKey: scheduleQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: scheduleQueryKeys.byBatch(updatedSchedule.batchId),
      });
    },
  });
};

/**
 * Delete a schedule
 *
 * @example
 * ```tsx
 * const deleteSchedule = useDeleteSchedule();
 * deleteSchedule.mutate(scheduleId);
 * ```
 */
export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/schedules/${id}`);
      return id;
    },
    onSuccess: (deletedId) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: scheduleQueryKeys.all,
      });
      // Remove from cache
      queryClient.removeQueries({
        queryKey: scheduleQueryKeys.detail(deletedId),
      });
    },
  });
};
