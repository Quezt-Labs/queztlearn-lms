import React, { useState, useCallback } from "react";
import { Upload, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useChunkedVideoUpload } from "@/hooks/use-chunked-video-upload";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ChunkedVideoUploadProps {
  onUploadComplete: (result: {
    masterUrl: string;
    thumbnail?: string;
    duration?: number;
  }) => void;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  apiUrl?: string;
}

export function ChunkedVideoUpload({
  onUploadComplete,
  maxSizeMB = 500,
  acceptedFormats = ["video/mp4", "video/webm", "video/quicktime"],
  apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
}: ChunkedVideoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { upload, cancel, reset, status, progress, error, result } =
    useChunkedVideoUpload({
      onComplete: (uploadResult) => {
        if (uploadResult.transcodedUrls?.master) {
          onUploadComplete({
            masterUrl: uploadResult.transcodedUrls.master,
            thumbnail: uploadResult.thumbnail,
            duration: uploadResult.duration,
          });
        }
      },
    });

  const handleFileSelect = useCallback(
    (file: File | null) => {
      if (!file) {
        setSelectedFile(null);
        return;
      }

      // Validate file type
      if (!acceptedFormats.includes(file.type)) {
        alert(
          `Invalid file type. Please upload: ${acceptedFormats.join(", ")}`
        );
        return;
      }

      // Validate file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        alert(`File size exceeds maximum limit of ${maxSizeMB}MB`);
        return;
      }

      setSelectedFile(file);
    },
    [acceptedFormats, maxSizeMB]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await upload(selectedFile, apiUrl);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handleCancel = () => {
    cancel();
    setSelectedFile(null);
    reset();
  };

  const handleReset = () => {
    setSelectedFile(null);
    reset();
  };

  const getStatusMessage = () => {
    switch (status) {
      case "initiating":
        return "Preparing upload...";
      case "uploading":
        return `Uploading video... ${Math.round(progress)}%`;
      case "completing":
        return "Finalizing upload...";
      case "transcoding":
        return "Processing video (1080p, 720p, 480p)...";
      case "completed":
        return "Video uploaded and processed successfully!";
      case "failed":
        return "Upload failed";
      case "cancelled":
        return "Upload cancelled";
      default:
        return "";
    }
  };

  const getStatusIcon = () => {
    if (status === "completed") {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
    if (status === "failed") {
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
    if (
      ["initiating", "uploading", "completing", "transcoding"].includes(status)
    ) {
      return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    }
    return null;
  };

  const isUploading = [
    "initiating",
    "uploading",
    "completing",
    "transcoding",
  ].includes(status);

  return (
    <div className="space-y-4">
      {/* Drag and Drop Zone */}
      {!selectedFile && status === "idle" && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-gray-300 hover:border-primary/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 mb-2">
            Drag and drop your video here, or click to browse
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Supports: {acceptedFormats.join(", ")} (Max {maxSizeMB}MB)
          </p>
          <input
            type="file"
            accept={acceptedFormats.join(",")}
            onChange={handleFileInputChange}
            className="hidden"
            id="video-file-input"
          />
          <label htmlFor="video-file-input">
            <Button type="button" variant="outline" asChild>
              <span>Select Video File</span>
            </Button>
          </label>
        </div>
      )}

      {/* Selected File Preview */}
      {selectedFile && status === "idle" && (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <Upload className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-medium text-sm">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFile(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button type="button" onClick={handleUpload} className="flex-1">
              Start Upload
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedFile(null)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div className="flex-1">
              <p className="font-medium text-sm">{getStatusMessage()}</p>
              {selectedFile && (
                <p className="text-xs text-gray-500">{selectedFile.name}</p>
              )}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{Math.round(progress)}% complete</span>
            {status === "transcoding" && (
              <span>This may take several minutes...</span>
            )}
          </div>
          {status === "uploading" && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
            >
              Cancel Upload
            </Button>
          )}
        </div>
      )}

      {/* Success Message */}
      {status === "completed" && result && (
        <Alert className="border-green-500">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription>
            <p className="font-medium mb-1">Video uploaded successfully!</p>
            <p className="text-sm text-gray-600 mb-2">
              Your video has been processed in multiple resolutions (1080p,
              720p, 480p) for adaptive streaming.
            </p>
            {result.duration && (
              <p className="text-xs text-gray-500">
                Duration: {Math.floor(result.duration / 60)}m{" "}
                {result.duration % 60}s
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="mt-2"
            >
              Upload Another Video
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {status === "failed" && error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium mb-1">Upload failed</p>
            <p className="text-sm">{error.message}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="mt-2"
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
