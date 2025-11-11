"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { tokenManager } from "@/lib/api/client";
import type {
  Schedule,
  ScheduleFilters,
  ScheduleListResponse,
} from "@/lib/types/schedule";

/**
 * Query keys for client schedule-related queries
 */
export const clientScheduleQueryKeys = {
  all: ["client", "schedules"] as const,
  lists: () => [...clientScheduleQueryKeys.all, "list"] as const,
  list: (filters?: ScheduleFilters) =>
    [...clientScheduleQueryKeys.lists(), filters] as const,
  details: () => [...clientScheduleQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...clientScheduleQueryKeys.details(), id] as const,
  byTopic: (topicId: string) =>
    [...clientScheduleQueryKeys.all, "topic", topicId] as const,
  byBatch: (batchId: string) =>
    [...clientScheduleQueryKeys.all, "batch", batchId] as const,
};

/**
 * Get all schedules for purchased batches (STUDENT)
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useGetClientSchedules({
 *   page: 1,
 *   limit: 10,
 *   status: "LIVE",
 *   upcoming: true
 * });
 * ```
 */
export const useGetClientSchedules = (filters?: ScheduleFilters) => {
  return useQuery({
    queryKey: clientScheduleQueryKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.status) params.append("status", filters.status);
      if (filters?.batchId) params.append("batchId", filters.batchId);
      if (filters?.upcoming !== undefined)
        params.append("upcoming", filters.upcoming.toString());

      const response = await apiClient.get<ScheduleListResponse>(
        `/api/schedules?${params.toString()}`
      );
      return response.data;
    },
    enabled: tokenManager.isAuthenticated(),
  });
};

/**
 * Get all schedules for a specific batch (STUDENT)
 * Only accessible if user has purchased the batch
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useGetClientSchedulesByBatch(batchId);
 * ```
 */
export const useGetClientSchedulesByBatch = (batchId: string) => {
  return useQuery({
    queryKey: clientScheduleQueryKeys.byBatch(batchId),
    queryFn: async () => {
      const response = await apiClient.get<ScheduleListResponse>(
        `/api/schedules/batch/${batchId}`
      );
      return response.data;
    },
    enabled: !!batchId && tokenManager.isAuthenticated(),
  });
};

/**
 * Get all schedules for a specific topic (STUDENT)
 * Only accessible if user has purchased the batch
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useGetClientSchedulesByTopic(topicId);
 * ```
 */
export const useGetClientSchedulesByTopic = (topicId: string) => {
  return useQuery({
    queryKey: clientScheduleQueryKeys.byTopic(topicId),
    queryFn: async () => {
      const response = await apiClient.get<ScheduleListResponse>(
        `/api/schedules/topic/${topicId}`
      );
      return response.data;
    },
    enabled: !!topicId && tokenManager.isAuthenticated(),
  });
};

/**
 * Get a single schedule by ID (STUDENT)
 * Only accessible if user has purchased the batch
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useGetClientSchedule(scheduleId);
 * ```
 */
export const useGetClientSchedule = (id: string) => {
  return useQuery({
    queryKey: clientScheduleQueryKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<{ data: Schedule }>(
        `/api/schedules/${id}`
      );
      return response.data.data;
    },
    enabled: !!id && tokenManager.isAuthenticated(),
  });
};
