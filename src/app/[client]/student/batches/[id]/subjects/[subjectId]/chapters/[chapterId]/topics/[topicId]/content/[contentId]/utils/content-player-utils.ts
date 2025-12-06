export interface Content {
  id: string;
  name: string;
  topicId: string;
  type: "Lecture" | "PDF";
  pdfUrl?: string;
  videoUrl?: string;
  videoType?: "YOUTUBE" | "HLS";
  videoThumbnail?: string;
  videoDuration?: number;
  isCompleted?: boolean;
  description?: string;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
}

export interface Chapter {
  id: string;
  name: string;
  subjectId: string;
}

export interface Topic {
  id: string;
  name: string;
  chapterId: string;
  description?: string;
}

export type VideoType =
  | "video/mp4"
  | "application/x-mpegURL"
  | "video/webm"
  | "video/youtube";

export function getVideoType(
  videoType?: string
): "video/mp4" | "application/x-mpegURL" | "video/webm" | "video/youtube" {
  if (!videoType) return "video/mp4";
  if (videoType === "HLS") return "application/x-mpegURL";
  if (videoType === "YOUTUBE") return "video/youtube";
  return "video/mp4";
}

export function formatDuration(seconds: number | undefined): string {
  if (!seconds) return "";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function buildContentPath(
  batchId: string,
  subjectId: string,
  chapterId: string,
  topicId: string,
  contentId: string
): string {
  return `/student/batches/${batchId}/subjects/${subjectId}/chapters/${chapterId}/topics/${topicId}/content/${contentId}`;
}

export function buildTopicPath(
  batchId: string,
  subjectId: string,
  chapterId: string,
  topicId: string
): string {
  return `/student/batches/${batchId}/subjects/${subjectId}/chapters/${chapterId}/topics/${topicId}`;
}
