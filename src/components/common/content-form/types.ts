export enum ContentType {
  LECTURE = "Lecture",
  PDF = "PDF",
}

export enum VideoType {
  YOUTUBE = "YOUTUBE",
  HLS = "HLS",
}

export interface ContentFormData {
  name: string;
  type: ContentType;
  pdfUrl: string;
  videoUrl: string;
  videoType: VideoType;
  videoThumbnail: string;
  videoDuration: number;
}

export interface ContentFormFiles {
  pdfFile: string;
  videoFile: string;
  thumbnailFile: string;
}

export interface ContentData {
  name: string;
  topicId?: string;
  type: ContentType;
  pdfUrl?: string;
  videoUrl?: string;
  videoType?: VideoType;
  videoThumbnail?: string;
  videoDuration?: number;
}

export interface Content {
  id: string;
  name: string;
  topicId: string;
  type: ContentType;
  pdfUrl?: string;
  videoUrl?: string;
  videoType?: VideoType;
  videoThumbnail?: string;
  videoDuration?: number;
  isCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const DEFAULT_FORM_DATA: ContentFormData = {
  name: "",
  type: ContentType.LECTURE,
  pdfUrl: "",
  videoUrl: "",
  videoType: VideoType.YOUTUBE,
  videoThumbnail: "",
  videoDuration: 0,
};

export const DEFAULT_FORM_FILES: ContentFormFiles = {
  pdfFile: "",
  videoFile: "",
  thumbnailFile: "",
};
