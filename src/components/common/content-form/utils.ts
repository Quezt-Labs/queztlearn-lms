import {
  ContentFormData,
  ContentFormFiles,
  ContentData,
  Content,
  VideoType,
  ContentType,
} from "./types";

/**
 * Normalizes videoType from various formats to standard format
 */
export function normalizeVideoType(videoType?: string | null): VideoType {
  if (!videoType) return VideoType.YOUTUBE;

  if (videoType.toUpperCase() === VideoType.HLS) return VideoType.HLS;
  if (videoType.toUpperCase() === VideoType.YOUTUBE) return VideoType.YOUTUBE;

  return VideoType.YOUTUBE;
}

/**
 * Maps content data to form data
 */
export function contentToFormData(content: Content | null): ContentFormData {
  if (!content) {
    return {
      name: "",
      type: ContentType.LECTURE,
      pdfUrl: "",
      videoUrl: "",
      videoType: VideoType.YOUTUBE,
      videoThumbnail: "",
      videoDuration: 0,
    };
  }

  return {
    name: content.name || "",
    type: content.type || ContentType.LECTURE,
    pdfUrl: content.pdfUrl || "",
    videoUrl: content.videoUrl || "",
    videoType: normalizeVideoType(content.videoType),
    videoThumbnail: content.videoThumbnail || "",
    videoDuration: content.videoDuration || 0,
  };
}

/**
 * Transforms form data and files to API payload
 */
export function formDataToContentData(
  formData: ContentFormData,
  files: ContentFormFiles,
  topicId?: string
): ContentData {
  const isPDF = formData.type === ContentType.PDF;

  return {
    name: formData.name,
    ...(topicId && { topicId }),
    type: formData.type,
    pdfUrl: isPDF ? files.pdfFile || formData.pdfUrl || undefined : undefined,
    videoUrl: isPDF
      ? undefined
      : formData.videoType === VideoType.YOUTUBE
      ? formData.videoUrl
      : files.videoFile || formData.videoUrl || undefined,
    videoType: isPDF ? undefined : formData.videoType,
    videoThumbnail: isPDF
      ? undefined
      : files.thumbnailFile || formData.videoThumbnail || undefined,
    ...(isPDF ? {} : { videoDuration: formData.videoDuration }),
  };
}

/**
 * Validates form data
 */
export function validateContentForm(formData: ContentFormData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!formData.name.trim()) {
    errors.push("Content name is required");
  }

  if (formData.type === ContentType.LECTURE) {
    if (!formData.videoDuration || formData.videoDuration <= 0) {
      errors.push("Video duration must be greater than 0");
    }
    if (formData.videoType === VideoType.YOUTUBE && !formData.videoUrl.trim()) {
      errors.push("YouTube URL is required");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
