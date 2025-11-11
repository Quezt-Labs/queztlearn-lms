import { useState, useCallback, useRef } from "react";
import axios from "axios";

const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunks
const MAX_PARALLEL_UPLOADS = 3; // Upload 3 chunks in parallel
const MAX_RETRIES = 3;

interface ChunkedUploadOptions {
  onProgress?: (progress: number) => void;
  onStatusChange?: (status: UploadStatus) => void;
  onComplete?: (result: UploadResult) => void;
  onError?: (error: Error) => void;
}

type UploadStatus =
  | "idle"
  | "initiating"
  | "uploading"
  | "completing"
  | "transcoding"
  | "completed"
  | "failed"
  | "cancelled";

interface UploadResult {
  uploadId: string;
  status: string;
  transcodedUrls?: {
    "1080p"?: string;
    "720p"?: string;
    "480p"?: string;
    master?: string;
  };
  duration?: number;
  thumbnail?: string;
}

export function useChunkedVideoUpload(options: ChunkedUploadOptions = {}) {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const uploadedChunksRef = useRef<Set<number>>(new Set());

  const updateStatus = useCallback(
    (newStatus: UploadStatus) => {
      setStatus(newStatus);
      options.onStatusChange?.(newStatus);
    },
    [options]
  );

  const updateProgress = useCallback(
    (newProgress: number) => {
      setProgress(newProgress);
      options.onProgress?.(newProgress);
    },
    [options]
  );

  /**
   * Upload a single chunk with retry logic
   */
  const uploadChunk = async (
    uploadUrl: string,
    chunk: Blob,
    chunkNumber: number,
    retryCount = 0
  ): Promise<string> => {
    try {
      const response = await axios.put(uploadUrl, chunk, {
        headers: {
          "Content-Type": "video/mp4",
        },
        signal: abortControllerRef.current?.signal,
      });

      // Capture ETag from S3 response
      const etag = response.headers.etag || response.headers["etag"];
      if (!etag) {
        throw new Error(`ETag not found in response for chunk ${chunkNumber}`);
      }

      uploadedChunksRef.current.add(chunkNumber);
      return etag;
    } catch (error: any) {
      if (retryCount < MAX_RETRIES && !axios.isCancel(error)) {
        console.log(`Retrying chunk ${chunkNumber}, attempt ${retryCount + 1}`);
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (retryCount + 1))
        );
        return uploadChunk(uploadUrl, chunk, chunkNumber, retryCount + 1);
      }
      throw error;
    }
  };

  /**
   * Upload chunks in parallel batches
   */
  const uploadChunksInParallel = async (
    file: File,
    totalChunks: number,
    uploadIdValue: string,
    apiUrl: string
  ) => {
    const chunks = Array.from({ length: totalChunks }, (_, i) => i + 1);
    const pendingChunks = chunks.filter(
      (num) => !uploadedChunksRef.current.has(num)
    );

    for (let i = 0; i < pendingChunks.length; i += MAX_PARALLEL_UPLOADS) {
      const batch = pendingChunks.slice(i, i + MAX_PARALLEL_UPLOADS);

      // Get signed URLs for this batch
      const { data } = await axios.post(
        `${apiUrl}/admin/upload/chunked/chunk-urls`,
        {
          uploadId: uploadIdValue,
          chunkNumbers: batch,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Upload chunks in parallel and capture ETags
      const uploadPromises = data.data.chunkUrls.map(async (chunkUrl: any) => {
        const chunkNumber = chunkUrl.chunkNumber;
        const start = (chunkNumber - 1) * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        const etag = await uploadChunk(chunkUrl.uploadUrl, chunk, chunkNumber);

        // Update progress
        const uploadedCount = uploadedChunksRef.current.size;
        const progressValue = (uploadedCount / totalChunks) * 90; // Reserve 10% for completion
        updateProgress(progressValue);

        return { PartNumber: chunkNumber, ETag: etag };
      });

      const parts = await Promise.all(uploadPromises);

      // Notify backend about uploaded chunks with ETags
      await axios.post(
        `${apiUrl}/admin/upload/chunked/mark-uploaded`,
        {
          uploadId: uploadIdValue,
          parts: parts,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    }
  };

  /**
   * Poll upload status for transcoding progress
   */
  const pollUploadStatus = async (
    uploadIdValue: string,
    apiUrl: string
  ): Promise<UploadResult> => {
    return new Promise((resolve, reject) => {
      const pollInterval = setInterval(async () => {
        try {
          const { data } = await axios.get(
            `${apiUrl}/admin/upload/chunked/status/${uploadIdValue}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          const uploadStatus = data.data.status;

          if (uploadStatus === "COMPLETED") {
            clearInterval(pollInterval);
            updateProgress(100);
            resolve(data.data);
          } else if (uploadStatus === "FAILED") {
            clearInterval(pollInterval);
            reject(new Error(data.data.errorMessage || "Transcoding failed"));
          } else if (uploadStatus === "TRANSCODING") {
            updateStatus("transcoding");
            updateProgress(95); // Show near completion during transcoding
          }
        } catch (error) {
          clearInterval(pollInterval);
          reject(error);
        }
      }, 3000); // Poll every 3 seconds

      // Timeout after 30 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        reject(new Error("Transcoding timeout"));
      }, 30 * 60 * 1000);
    });
  };

  /**
   * Main upload function
   */
  const upload = async (file: File, apiUrl: string = "/api") => {
    try {
      abortControllerRef.current = new AbortController();
      uploadedChunksRef.current.clear();
      setError(null);
      setResult(null);

      // Step 1: Initiate upload
      updateStatus("initiating");
      updateProgress(0);

      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

      const { data: initiateData } = await axios.post(
        `${apiUrl}/admin/upload/chunked/initiate`,
        {
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          totalChunks,
          chunkSize: CHUNK_SIZE,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const uploadIdValue = initiateData.data.uploadId;
      setUploadId(uploadIdValue);

      // Step 2: Upload chunks
      updateStatus("uploading");
      await uploadChunksInParallel(file, totalChunks, uploadIdValue, apiUrl);

      // Step 3: Complete upload
      updateStatus("completing");
      updateProgress(92);

      await axios.post(
        `${apiUrl}/admin/upload/chunked/complete`,
        {
          uploadId: uploadIdValue,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Step 4: Poll for transcoding completion
      updateStatus("transcoding");
      updateProgress(95);

      const finalResult = await pollUploadStatus(uploadIdValue, apiUrl);

      setResult(finalResult);
      updateStatus("completed");
      updateProgress(100);

      options.onComplete?.(finalResult);

      return finalResult;
    } catch (error: any) {
      console.error("Upload error:", error);
      const uploadError = new Error(
        error.response?.data?.message || error.message || "Upload failed"
      );
      setError(uploadError);
      updateStatus("failed");
      options.onError?.(uploadError);
      throw uploadError;
    }
  };

  /**
   * Cancel upload
   */
  const cancel = useCallback(async () => {
    if (!uploadId) return;

    abortControllerRef.current?.abort();
    updateStatus("cancelled");

    try {
      await axios.post(
        `/api/admin/upload/chunked/cancel`,
        {
          uploadId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    } catch (error) {
      console.error("Cancel error:", error);
    }
  }, [uploadId, updateStatus]);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setStatus("idle");
    setProgress(0);
    setUploadId(null);
    setError(null);
    setResult(null);
    uploadedChunksRef.current.clear();
    abortControllerRef.current = null;
  }, []);

  return {
    upload,
    cancel,
    reset,
    status,
    progress,
    uploadId,
    error,
    result,
  };
}
