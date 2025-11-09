/**
 * Schedule types and interfaces
 * 
 * Centralized type definitions for schedule-related functionality
 */

export type ScheduleStatus = "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED";

export interface Schedule {
  id: string;
  topicId?: string;
  batchId: string;
  subjectId: string;
  title: string;
  description?: string;
  subjectName: string;
  youtubeLink: string;
  scheduledAt: string;
  duration: number;
  teacherId?: string;
  thumbnailUrl?: string;
  notifyBeforeMinutes?: number;
  tags?: string[];
  status?: ScheduleStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateScheduleData {
  topicId?: string;
  batchId: string;
  subjectId: string;
  title: string;
  description?: string;
  subjectName: string;
  youtubeLink: string;
  scheduledAt: string;
  duration: number;
  teacherId?: string;
  thumbnailUrl?: string;
  notifyBeforeMinutes?: number;
  tags?: string[];
}

export interface UpdateScheduleData {
  title?: string;
  description?: string;
  subjectName?: string;
  youtubeLink?: string;
  scheduledAt?: string;
  duration?: number;
  teacherId?: string;
  thumbnailUrl?: string;
  notifyBeforeMinutes?: number;
  tags?: string[];
}

export interface UpdateScheduleStatusData {
  status: ScheduleStatus;
}

export interface ScheduleFilters {
  page?: number;
  limit?: number;
  status?: ScheduleStatus;
  batchId?: string;
  teacherId?: string;
  date?: string; // YYYY-MM-DD
  upcoming?: boolean;
}

export interface ScheduleListResponse {
  data: Schedule[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

