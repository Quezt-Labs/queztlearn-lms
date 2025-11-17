"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateContent } from "@/hooks";
import { Video, FileText, BookOpen } from "lucide-react";
import { FileUpload } from "@/components/common/file-upload";
import { HLSVideoUpload } from "@/components/common/hls-video-upload";
import { ContentType, VideoType } from "@/components/common/content-form";

interface CreateContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicId: string;
  onSuccess?: () => void;
}

export function CreateContentModal({
  isOpen,
  onClose,
  topicId,
  onSuccess,
}: CreateContentModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: ContentType.LECTURE,
    pdfUrl: "",
    videoUrl: "",
    videoType: VideoType.YOUTUBE,
    videoThumbnail: "",
    videoDuration: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfFile, setPdfFile] = useState<string>("");
  const [videoFile, setVideoFile] = useState<string>("");
  const [thumbnailFile, setThumbnailFile] = useState<string>("");

  const createContentMutation = useCreateContent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return;
    }

    // Validate videoDuration for Lecture type
    if (
      formData.type === ContentType.LECTURE &&
      (!formData.videoDuration || formData.videoDuration <= 0)
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      const contentData = {
        name: formData.name,
        topicId: topicId,
        type: formData.type,
        pdfUrl: pdfFile || formData.pdfUrl || undefined,
        videoUrl:
          formData.type === ContentType.PDF
            ? undefined
            : formData.videoType === VideoType.YOUTUBE
            ? formData.videoUrl
            : videoFile || formData.videoUrl || undefined,
        videoType:
          formData.type === ContentType.PDF ? undefined : formData.videoType,
        videoThumbnail:
          formData.type === ContentType.PDF
            ? undefined
            : thumbnailFile || formData.videoThumbnail || undefined,
        ...(formData.type === ContentType.PDF
          ? {}
          : { videoDuration: formData.videoDuration }),
      };

      await createContentMutation.mutateAsync(contentData);
      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error("Failed to create content:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      type: ContentType.LECTURE,
      pdfUrl: "",
      videoUrl: "",
      videoType: VideoType.YOUTUBE,
      videoThumbnail: "",
      videoDuration: 0,
    });
    setPdfFile("");
    setVideoFile("");
    setThumbnailFile("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Content</DialogTitle>
          <DialogDescription>
            Add content to this topic (Lecture or PDF).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Content Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Content Name *</Label>
            <Input
              id="name"
              placeholder="Enter content name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>

          {/* Content Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Content Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  type: value as typeof formData.type,
                }))
              }
            >
              <SelectTrigger id="type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ContentType.LECTURE}>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4" />
                    <span>Lecture</span>
                  </div>
                </SelectItem>
                <SelectItem value={ContentType.PDF}>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>PDF</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditional Fields based on Type */}
          {formData.type === ContentType.LECTURE && (
            <>
              <div className="space-y-2">
                <Label htmlFor="videoType">Video Type *</Label>
                <Select
                  value={formData.videoType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      videoType: value as typeof formData.videoType,
                      videoUrl: "", // Reset URL when changing type
                      videoDuration: 0, // Reset duration when changing type
                    }))
                  }
                >
                  <SelectTrigger id="videoType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={VideoType.YOUTUBE}>
                      <div className="flex items-center space-x-2">
                        <Video className="h-4 w-4" />
                        <span>YouTube</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={VideoType.HLS}>HLS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* YouTube URL Input */}
              {formData.videoType === VideoType.YOUTUBE && (
                <div className="space-y-2">
                  <Label htmlFor="videoUrl">YouTube URL *</Label>
                  <Input
                    id="videoUrl"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={formData.videoUrl}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        videoUrl: e.target.value,
                      }))
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the full YouTube video URL or video ID
                  </p>
                </div>
              )}

              {/* Video Upload for HLS */}
              {formData.videoType === VideoType.HLS && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="videoUpload">Upload Video *</Label>
                    <p className="text-xs text-muted-foreground">
                      Large videos will be split into chunks and uploaded in
                      parallel
                    </p>
                    <HLSVideoUpload
                      onUploadComplete={(cdnUrl) => {
                        setVideoFile(cdnUrl);
                        setFormData((prev) => ({
                          ...prev,
                          videoUrl: cdnUrl,
                        }));
                      }}
                      folder="course-videos"
                      maxSize={2000} // 2GB max
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="videoUrl">Enter Video URL (Optional)</Label>
                    <Input
                      id="videoUrl"
                      placeholder="https://cdn.example.com/video.mp4 or .m3u8"
                      value={formData.videoUrl}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          videoUrl: e.target.value,
                        }))
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter a direct video URL or HLS manifest URL (.m3u8)
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="videoThumbnail">Video Thumbnail</Label>
                <FileUpload
                  accept="image/*"
                  maxSize={10}
                  onUploadComplete={(fileData) => {
                    setThumbnailFile(fileData.url);
                  }}
                />
                <div className="space-y-2">
                  <Label htmlFor="videoThumbnailUrl">
                    Or Enter Thumbnail URL
                  </Label>
                  <Input
                    id="videoThumbnailUrl"
                    placeholder="Enter thumbnail URL (optional)"
                    value={formData.videoThumbnail}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        videoThumbnail: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="videoDuration">Duration (seconds) *</Label>
                <Input
                  id="videoDuration"
                  type="number"
                  placeholder="Enter duration in seconds"
                  value={formData.videoDuration || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      videoDuration: Number(e.target.value) || 0,
                    }))
                  }
                  required
                  min="1"
                />
              </div>
            </>
          )}

          {formData.type === ContentType.PDF && (
            <>
              <div className="space-y-2">
                <Label htmlFor="pdfFile">Upload PDF</Label>
                <FileUpload
                  accept=".pdf"
                  onUploadComplete={(fileData) => {
                    setPdfFile(fileData.url);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pdfUrl">Or Enter PDF URL</Label>
                <Input
                  id="pdfUrl"
                  placeholder="Or enter PDF URL"
                  value={formData.pdfUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, pdfUrl: e.target.value }))
                  }
                />
              </div>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !formData.name.trim() ||
                (formData.type === ContentType.LECTURE &&
                  (!formData.videoDuration || formData.videoDuration <= 0))
              }
            >
              {isSubmitting ? "Creating..." : "Create Content"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
