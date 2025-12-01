/**
 * Multipart Upload Utility
 *
 * Handles large video file uploads by splitting into chunks and uploading to S3
 * with progress tracking and error recovery.
 */

import apiClient from "@/lib/api/client";

const CHUNK_SIZE = 50 * 1024 * 1024; // 50MB chunks (better for large files)
const MAX_CONCURRENT_UPLOADS = 3; // Upload 3 chunks at a time

export interface ChunkProgress {
  partNumber: number;
  status: "pending" | "uploading" | "completed" | "error";
  uploadedBytes: number;
  totalBytes: number;
  percentage: number;
  error?: string;
}

export interface UploadProgress {
  uploadedBytes: number;
  totalBytes: number;
  percentage: number;
  uploadedChunks: number;
  totalChunks: number;
  currentChunk?: number;
  chunks: ChunkProgress[];
  status:
    | "idle"
    | "initiating"
    | "uploading"
    | "completing"
    | "completed"
    | "error"
    | "aborted";
  error?: string;
}

export interface MultipartUploadConfig {
  fileName: string;
  fileType: string;
  fileSize: number;
  folder?: string;
  onProgress?: (progress: UploadProgress) => void;
  onComplete?: (cdnUrl: string) => void;
  onError?: (error: Error) => void;
}

interface InitiateResponse {
  success: boolean;
  data: {
    uploadId: string;
    key: string;
    bucket: string;
  };
}

interface SignedUrlsResponse {
  success: boolean;
  data: {
    urls: Array<{
      partNumber: number;
      uploadUrl: string;
    }>;
    expiresIn: number;
  };
}

interface CompleteResponse {
  success: boolean;
  data: {
    key: string;
    publicUrl: string;
    cdnUrl: string;
    bucket: string;
  };
}

interface UploadPart {
  partNumber: number;
  ETag: string;
}

export class MultipartUploader {
  private file: File;
  private config: MultipartUploadConfig;
  private uploadId?: string;
  private key?: string;
  private aborted = false;
  private uploadedParts: UploadPart[] = [];
  private progress: UploadProgress;

  constructor(file: File, config: MultipartUploadConfig) {
    this.file = file;
    this.config = {
      ...config,
      folder: config.folder || "course-videos",
    };
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    this.progress = {
      uploadedBytes: 0,
      totalBytes: file.size,
      percentage: 0,
      uploadedChunks: 0,
      totalChunks,
      chunks: Array.from({ length: totalChunks }, (_, i) => ({
        partNumber: i + 1,
        status: "pending" as const,
        uploadedBytes: 0,
        totalBytes: Math.min(CHUNK_SIZE, file.size - i * CHUNK_SIZE),
        percentage: 0,
      })),
      status: "idle",
    };
  }

  /**
   * Start the multipart upload process
   */
  async upload(): Promise<string> {
    try {
      this.updateProgress({ status: "initiating" });

      // Step 1: Initiate multipart upload
      const { uploadId, key } = await this.initiateUpload();
      this.uploadId = uploadId;
      this.key = key;

      if (this.aborted) {
        await this.abortUpload();
        throw new Error("Upload aborted by user");
      }

      // Step 2: Get presigned URLs for all chunks
      const urls = await this.getSignedUrls();

      if (this.aborted) {
        await this.abortUpload();
        throw new Error("Upload aborted by user");
      }

      this.updateProgress({ status: "uploading" });

      // Step 3: Upload chunks in parallel (limited concurrency)
      await this.uploadChunks(urls);

      if (this.aborted) {
        await this.abortUpload();
        throw new Error("Upload aborted by user");
      }

      this.updateProgress({ status: "completing" });

      // Step 4: Complete the multipart upload
      const cdnUrl = await this.completeUpload();

      this.updateProgress({ status: "completed", percentage: 100 });
      this.config.onComplete?.(cdnUrl);

      return cdnUrl;
    } catch (error) {
      this.updateProgress({
        status: "error",
        error: error instanceof Error ? error.message : "Upload failed",
      });
      this.config.onError?.(error as Error);

      // Try to cleanup
      if (this.uploadId && this.key && !this.aborted) {
        await this.abortUpload().catch(console.error);
      }

      throw error;
    }
  }

  /**
   * Abort the upload and cleanup
   */
  async abort(): Promise<void> {
    this.aborted = true;
    this.updateProgress({ status: "aborted" });

    if (this.uploadId && this.key) {
      await this.abortUpload();
    }
  }

  /**
   * Step 1: Initiate multipart upload
   */
  private async initiateUpload(): Promise<{ uploadId: string; key: string }> {
    try {
      const response = await apiClient.post<InitiateResponse>(
        "/admin/upload/multipart/initiate",
        {
          fileName: this.config.fileName,
          fileType: this.config.fileType,
          fileSize: this.config.fileSize,
          folder: this.config.folder,
        }
      );

      const data = response.data;

      if (!data.success) {
        throw new Error("Failed to initiate upload");
      }

      return {
        uploadId: data.data.uploadId,
        key: data.data.key,
      };
    } catch (error: unknown) {
      let message = "Failed to initiate upload";
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response
      ) {
        const responseData = (
          error as { response?: { data?: { message?: string } } }
        ).response?.data;
        if (responseData && typeof responseData.message === "string") {
          message = `Failed to initiate upload: ${responseData.message}`;
        }
      } else if (error instanceof Error) {
        message = `Failed to initiate upload: ${error.message}`;
      }
      throw new Error(message);
    }
  }

  /**
   * Step 2: Get presigned URLs for all chunks
   */
  private async getSignedUrls(): Promise<
    Array<{ partNumber: number; uploadUrl: string }>
  > {
    const totalParts = this.progress.totalChunks;

    try {
      const response = await apiClient.post<SignedUrlsResponse>(
        "/admin/upload/multipart/signed-urls",
        {
          uploadId: this.uploadId,
          key: this.key,
          totalParts,
        }
      );

      const data = response.data;

      if (!data.success) {
        throw new Error("Failed to get signed URLs");
      }

      return data.data.urls;
    } catch (error: unknown) {
      let message = "Failed to get signed URLs";
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response
      ) {
        const responseData = (
          error as { response?: { data?: { message?: string } } }
        ).response?.data;
        if (responseData && typeof responseData.message === "string") {
          message = `Failed to get signed URLs: ${responseData.message}`;
        }
      } else if (error instanceof Error) {
        message = `Failed to get signed URLs: ${error.message}`;
      }
      throw new Error(message);
    }
  }

  /**
   * Step 3: Upload chunks in parallel with limited concurrency
   */
  private async uploadChunks(
    urls: Array<{ partNumber: number; uploadUrl: string }>
  ): Promise<void> {
    const chunks = this.splitFileIntoChunks();
    const queue = [...urls];
    const activeUploads = new Set<Promise<void>>();

    while (queue.length > 0 || activeUploads.size > 0) {
      if (this.aborted) {
        throw new Error("Upload aborted");
      }

      // Start new uploads up to max concurrency
      while (activeUploads.size < MAX_CONCURRENT_UPLOADS && queue.length > 0) {
        const urlInfo = queue.shift()!;
        const chunk = chunks[urlInfo.partNumber - 1];

        const uploadPromise = this.uploadChunk(
          chunk,
          urlInfo.uploadUrl,
          urlInfo.partNumber
        )
          .then((etag) => {
            this.uploadedParts.push({
              partNumber: urlInfo.partNumber,
              ETag: etag,
            });
            activeUploads.delete(uploadPromise);
          })
          .catch((error) => {
            activeUploads.delete(uploadPromise);
            throw error;
          });

        activeUploads.add(uploadPromise);
      }

      // Wait for at least one upload to complete
      if (activeUploads.size > 0) {
        await Promise.race(activeUploads);
      }
    }

    // Sort parts by part number for completion
    this.uploadedParts.sort((a, b) => a.partNumber - b.partNumber);
  }

  /**
   * Upload a single chunk to S3 with progress tracking
   */
  private async uploadChunk(
    chunk: Blob,
    uploadUrl: string,
    partNumber: number
  ): Promise<string> {
    const chunkIndex = partNumber - 1;

    // Update chunk status to uploading
    this.updateChunkProgress(partNumber, {
      status: "uploading",
      uploadedBytes: 0,
      percentage: 0,
    });

    this.updateProgress({ currentChunk: partNumber });

    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress for this chunk
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const chunkPercentage = Math.round((e.loaded / e.total) * 100);

          this.updateChunkProgress(partNumber, {
            uploadedBytes: e.loaded,
            percentage: chunkPercentage,
          });

          // Calculate total progress
          const totalUploadedBytes = this.progress.chunks.reduce(
            (sum, c) => sum + c.uploadedBytes,
            0
          );
          const totalPercentage = Math.round(
            (totalUploadedBytes / this.progress.totalBytes) * 100
          );

          this.updateProgress({
            uploadedBytes: totalUploadedBytes,
            percentage: totalPercentage,
          });
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const etag = xhr.getResponseHeader("ETag");
          if (!etag) {
            this.updateChunkProgress(partNumber, {
              status: "error",
              error: "No ETag returned",
            });
            reject(new Error(`No ETag returned for chunk ${partNumber}`));
            return;
          }

          // Mark chunk as completed
          this.updateChunkProgress(partNumber, {
            status: "completed",
            uploadedBytes: chunk.size,
            percentage: 100,
          });

          // Update total uploaded chunks count
          const uploadedChunks = this.progress.chunks.filter(
            (c) => c.status === "completed"
          ).length;

          this.updateProgress({
            uploadedChunks,
          });

          resolve(etag);
        } else {
          this.updateChunkProgress(partNumber, {
            status: "error",
            error: `Upload failed: ${xhr.statusText}`,
          });
          reject(
            new Error(`Failed to upload chunk ${partNumber}: ${xhr.statusText}`)
          );
        }
      });

      xhr.addEventListener("error", () => {
        this.updateChunkProgress(partNumber, {
          status: "error",
          error: "Network error",
        });
        reject(new Error(`Network error uploading chunk ${partNumber}`));
      });

      xhr.addEventListener("abort", () => {
        this.updateChunkProgress(partNumber, {
          status: "error",
          error: "Upload aborted",
        });
        reject(new Error(`Upload aborted for chunk ${partNumber}`));
      });

      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", "application/octet-stream");
      xhr.send(chunk);
    });
  }

  /**
   * Update progress for a specific chunk
   */
  private updateChunkProgress(
    partNumber: number,
    updates: Partial<ChunkProgress>
  ): void {
    const chunkIndex = partNumber - 1;
    if (chunkIndex >= 0 && chunkIndex < this.progress.chunks.length) {
      this.progress.chunks[chunkIndex] = {
        ...this.progress.chunks[chunkIndex],
        ...updates,
      };
      // Notify progress listener
      this.config.onProgress?.(this.progress);
    }
  }

  /**
   * Step 4: Complete the multipart upload
   */
  private async completeUpload(): Promise<string> {
    try {
      const response = await apiClient.post<CompleteResponse>(
        "/admin/upload/multipart/complete",
        {
          uploadId: this.uploadId,
          key: this.key,
          parts: this.uploadedParts,
        }
      );

      const data = response.data;

      if (!data.success) {
        throw new Error("Failed to complete upload");
      }

      return data.data.cdnUrl;
    } catch (error: unknown) {
      let message = "Failed to complete upload";
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response
      ) {
        const responseData = (
          error as { response?: { data?: { message?: string } } }
        ).response?.data;
        if (responseData && typeof responseData.message === "string") {
          message = `Failed to complete upload: ${responseData.message}`;
        }
      } else if (error instanceof Error) {
        message = `Failed to complete upload: ${error.message}`;
      }
      throw new Error(message);
    }
  }

  /**
   * Abort the upload and cleanup
   */
  private async abortUpload(): Promise<void> {
    if (!this.uploadId || !this.key) return;

    try {
      await apiClient.post("/admin/upload/multipart/abort", {
        uploadId: this.uploadId,
        key: this.key,
      });
    } catch (error: unknown) {
      let message = "Unknown error";
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response
      ) {
        const responseData = (
          error as { response?: { data?: { message?: string } } }
        ).response?.data;
        if (responseData && typeof responseData.message === "string") {
          message = responseData.message;
        }
      } else if (error instanceof Error) {
        message = error.message;
      }
      console.error("Error aborting upload:", message);
    }
  }

  /**
   * Split file into chunks
   */
  private splitFileIntoChunks(): Blob[] {
    const chunks: Blob[] = [];
    let offset = 0;

    while (offset < this.file.size) {
      const end = Math.min(offset + CHUNK_SIZE, this.file.size);
      chunks.push(this.file.slice(offset, end));
      offset = end;
    }

    return chunks;
  }

  /**
   * Update progress and notify listener
   */
  private updateProgress(updates: Partial<UploadProgress>): void {
    this.progress = { ...this.progress, ...updates };
    this.config.onProgress?.(this.progress);
  }

  /**
   * Get current progress
   */
  getProgress(): UploadProgress {
    return { ...this.progress };
  }
}

/**
 * Helper function to format bytes to human-readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Helper function to format time remaining
 */
export function formatTimeRemaining(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "Calculating...";

  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes}m ${secs}s`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
}
