/**
 * Multipart Upload Utility
 *
 * Handles large video file uploads by splitting into chunks and uploading to S3
 * with progress tracking and error recovery.
 */

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
const MAX_CONCURRENT_UPLOADS = 3; // Upload 3 chunks at a time

export interface UploadProgress {
  uploadedBytes: number;
  totalBytes: number;
  percentage: number;
  uploadedChunks: number;
  totalChunks: number;
  currentChunk?: number;
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
    this.progress = {
      uploadedBytes: 0,
      totalBytes: file.size,
      percentage: 0,
      uploadedChunks: 0,
      totalChunks: Math.ceil(file.size / CHUNK_SIZE),
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
    const response = await fetch("/api/admin/upload/multipart/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: this.config.fileName,
        fileType: this.config.fileType,
        fileSize: this.config.fileSize,
        folder: this.config.folder,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to initiate upload: ${error}`);
    }

    const data: InitiateResponse = await response.json();

    if (!data.success) {
      throw new Error("Failed to initiate upload");
    }

    return {
      uploadId: data.data.uploadId,
      key: data.data.key,
    };
  }

  /**
   * Step 2: Get presigned URLs for all chunks
   */
  private async getSignedUrls(): Promise<
    Array<{ partNumber: number; uploadUrl: string }>
  > {
    const totalParts = this.progress.totalChunks;

    const response = await fetch("/api/admin/upload/multipart/signed-urls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uploadId: this.uploadId,
        key: this.key,
        totalParts,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get signed URLs: ${error}`);
    }

    const data: SignedUrlsResponse = await response.json();

    if (!data.success) {
      throw new Error("Failed to get signed URLs");
    }

    return data.data.urls;
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
   * Upload a single chunk to S3
   */
  private async uploadChunk(
    chunk: Blob,
    uploadUrl: string,
    partNumber: number
  ): Promise<string> {
    this.updateProgress({ currentChunk: partNumber });

    const response = await fetch(uploadUrl, {
      method: "PUT",
      body: chunk,
      headers: {
        "Content-Type": "application/octet-stream",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to upload chunk ${partNumber}: ${response.statusText}`
      );
    }

    const etag = response.headers.get("ETag");
    if (!etag) {
      throw new Error(`No ETag returned for chunk ${partNumber}`);
    }

    // Update progress
    const uploadedBytes = this.progress.uploadedBytes + chunk.size;
    const uploadedChunks = this.progress.uploadedChunks + 1;
    const percentage = Math.round(
      (uploadedBytes / this.progress.totalBytes) * 100
    );

    this.updateProgress({
      uploadedBytes,
      uploadedChunks,
      percentage,
    });

    return etag;
  }

  /**
   * Step 4: Complete the multipart upload
   */
  private async completeUpload(): Promise<string> {
    const response = await fetch("/api/admin/upload/multipart/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uploadId: this.uploadId,
        key: this.key,
        parts: this.uploadedParts,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to complete upload: ${error}`);
    }

    const data: CompleteResponse = await response.json();

    if (!data.success) {
      throw new Error("Failed to complete upload");
    }

    return data.data.cdnUrl;
  }

  /**
   * Abort the upload and cleanup
   */
  private async abortUpload(): Promise<void> {
    if (!this.uploadId || !this.key) return;

    try {
      const response = await fetch("/api/admin/upload/multipart/abort", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uploadId: this.uploadId,
          key: this.key,
        }),
      });

      if (!response.ok) {
        console.error("Failed to abort upload:", await response.text());
      }
    } catch (error) {
      console.error("Error aborting upload:", error);
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
