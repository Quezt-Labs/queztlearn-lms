"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, Youtube } from "lucide-react";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TimePicker } from "@/components/ui/time-picker";
import { cn } from "@/lib/utils";
import { FileUpload } from "@/components/common/file-upload";
import {
  useGetSubjectsByBatch,
  useCreateSchedule,
  useGetChaptersBySubject,
  useGetTopicsByChapter,
} from "@/hooks";
import { type CreateScheduleData } from "@/lib/types/schedule";
import Image from "next/image";
import { toast } from "sonner";

interface CreateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchId: string;
  onSuccess: () => void;
}

interface Subject {
  id: string;
  name: string;
}

interface Chapter {
  id: string;
  name: string;
}

interface Topic {
  id: string;
  name: string;
}

export function CreateScheduleModal({
  isOpen,
  onClose,
  batchId,
  onSuccess,
}: CreateScheduleModalProps) {
  const [formData, setFormData] = useState({
    topicId: "",
    chapterId: "",
    subjectId: "",
    title: "",
    description: "",
    subjectName: "",
    youtubeLink: "",
    scheduledAt: "",
    scheduledTime: "",
    duration: 60,
    teacherId: "",
    thumbnailUrl: "",
    notifyBeforeMinutes: 30,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const { data: subjectsData } = useGetSubjectsByBatch(batchId);
  const { data: chaptersData } = useGetChaptersBySubject(formData.subjectId);
  const { data: topicsData } = useGetTopicsByChapter(formData.chapterId);
  const createSchedule = useCreateSchedule();

  const subjects = useMemo(
    () => (subjectsData?.data as Subject[]) || [],
    [subjectsData?.data]
  );

  const chapters = useMemo(
    () => (chaptersData?.data as Chapter[]) || [],
    [chaptersData?.data]
  );

  const topics = useMemo(
    () => (topicsData?.data as Topic[]) || [],
    [topicsData?.data]
  );

  useEffect(() => {
    // Auto-fill subject name when subject is selected
    if (formData.subjectId) {
      const selectedSubject = subjects.find((s) => s.id === formData.subjectId);
      if (selectedSubject) {
        setFormData((prev) => ({ ...prev, subjectName: selectedSubject.name }));
      }
    }
  }, [formData.subjectId, subjects]);

  useEffect(() => {
    // Reset chapterId and topicId when subjectId changes
    if (formData.subjectId) {
      setFormData((prev) => ({ ...prev, chapterId: "", topicId: "" }));
    }
  }, [formData.subjectId]);

  useEffect(() => {
    // Reset topicId when chapterId changes
    if (formData.chapterId) {
      setFormData((prev) => ({ ...prev, topicId: "" }));
    }
  }, [formData.chapterId]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, scheduledAt: date.toISOString() }));
      if (errors.scheduledAt) {
        setErrors((prev) => ({ ...prev, scheduledAt: "" }));
      }
    }
  };

  const handleImageUpload = (fileData: {
    key: string;
    url: string;
    bucket: string;
    originalName: string;
    size: number;
    mimeType: string;
  }) => {
    setIsUploadingImage(true);
    try {
      setFormData((prev) => ({ ...prev, thumbnailUrl: fileData.url }));
    } catch (error) {
      console.error("Failed to update thumbnail URL:", error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.subjectId) {
      newErrors.subjectId = "Subject is required";
    }
    if (!formData.scheduledAt) {
      newErrors.scheduledAt = "Schedule date is required";
    }
    if (!formData.scheduledTime) {
      newErrors.scheduledTime = "Schedule time is required";
    }
    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = "Duration must be greater than 0";
    }
    if (!formData.youtubeLink.trim()) {
      newErrors.youtubeLink = "YouTube link is required";
    } else {
      const youtubeEmbedRegex =
        /^(https?:\/\/)?(www\.)?(youtube\.com\/embed\/|youtu\.be\/)[\w-]{11}(\?.*)?$/;

      if (!youtubeEmbedRegex.test(formData.youtubeLink)) {
        newErrors.youtubeLink = "Please enter a valid YouTube link (embed URL)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Combine date and time
      const scheduledDate = new Date(formData.scheduledAt);
      const [hours, minutes] = formData.scheduledTime.split(":");
      scheduledDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Build schedule data object, only including fields with values
      const scheduleData: CreateScheduleData = {
        batchId: batchId,
        subjectId: formData.subjectId,
        title: formData.title,
        subjectName: formData.subjectName,
        youtubeLink: formData.youtubeLink,
        scheduledAt: scheduledDate.toISOString(),
        duration: formData.duration,
      };

      // Add optional fields only if they have values
      if (formData.topicId && formData.topicId.trim()) {
        scheduleData.topicId = formData.topicId.trim();
      }
      if (formData.description && formData.description.trim()) {
        scheduleData.description = formData.description.trim();
      }
      if (formData.teacherId && formData.teacherId.trim()) {
        scheduleData.teacherId = formData.teacherId.trim();
      }
      if (formData.thumbnailUrl && formData.thumbnailUrl.trim()) {
        scheduleData.thumbnailUrl = formData.thumbnailUrl.trim();
      }
      if (formData.notifyBeforeMinutes) {
        scheduleData.notifyBeforeMinutes = formData.notifyBeforeMinutes;
      }

      await createSchedule.mutateAsync(scheduleData);
      toast.success("Schedule created successfully");
      onSuccess();
      handleClose();
    } catch (error: unknown) {
      console.error("Failed to create schedule:", error);
      const errorMessage =
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
          ? error.response.data.message
          : "Failed to create schedule";
      toast.error(errorMessage);
    }
  };

  const handleClose = () => {
    setFormData({
      topicId: "",
      chapterId: "",
      subjectId: "",
      title: "",
      description: "",
      subjectName: "",
      youtubeLink: "",
      scheduledAt: "",
      scheduledTime: "",
      duration: 60,
      teacherId: "",
      thumbnailUrl: "",
      notifyBeforeMinutes: 30,
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[calc(100%-2rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle>Create Schedule</DialogTitle>
          <DialogDescription>
            Schedule a new class or session for this batch
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Title */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., Introduction to Calculus"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title}</p>
              )}
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">
                Subject <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.subjectId}
                onValueChange={(value) => handleInputChange("subjectId", value)}
              >
                <SelectTrigger
                  className={errors.subjectId ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.subjectId && (
                <p className="text-sm text-red-500 mt-1">{errors.subjectId}</p>
              )}
            </div>

            {/* Chapter */}
            <div className="space-y-2">
              <Label htmlFor="chapter">Chapter</Label>
              <Select
                value={formData.chapterId}
                onValueChange={(value) => handleInputChange("chapterId", value)}
                disabled={!formData.subjectId}
              >
                <SelectTrigger
                  className={errors.chapterId ? "border-red-500" : ""}
                >
                  <SelectValue
                    placeholder={
                      !formData.subjectId
                        ? "Select subject first"
                        : chapters.length === 0
                        ? "No chapters available"
                        : "Select chapter (optional)"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {chapters.map((chapter) => (
                    <SelectItem key={chapter.id} value={chapter.id}>
                      {chapter.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.chapterId && (
                <p className="text-sm text-red-500 mt-1">{errors.chapterId}</p>
              )}
            </div>

            {/* Topic */}
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Select
                value={formData.topicId}
                onValueChange={(value) => handleInputChange("topicId", value)}
                disabled={!formData.chapterId}
              >
                <SelectTrigger
                  className={errors.topicId ? "border-red-500" : ""}
                >
                  <SelectValue
                    placeholder={
                      !formData.chapterId
                        ? "Select chapter first"
                        : topics.length === 0
                        ? "No topics available"
                        : "Select topic (optional)"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id}>
                      {topic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.topicId && (
                <p className="text-sm text-red-500 mt-1">{errors.topicId}</p>
              )}
            </div>

            {/* Scheduled Date */}
            <div className="space-y-2">
              <Label>
                Schedule Date <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.scheduledAt && "text-muted-foreground",
                      errors.scheduledAt && "border-red-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.scheduledAt ? (
                      format(new Date(formData.scheduledAt), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={
                      formData.scheduledAt
                        ? new Date(formData.scheduledAt)
                        : undefined
                    }
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.scheduledAt && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.scheduledAt}
                </p>
              )}
            </div>

            {/* Scheduled Time */}
            <div className="space-y-2">
              <Label htmlFor="time">
                Schedule Time <span className="text-red-500">*</span>
              </Label>
              <TimePicker
                value={formData.scheduledTime}
                onChange={(time) => handleInputChange("scheduledTime", time)}
                error={!!errors.scheduledTime}
                placeholder="Select time"
              />
              {errors.scheduledTime && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.scheduledTime}
                </p>
              )}
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">
                Duration (minutes) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) =>
                  handleInputChange("duration", parseInt(e.target.value))
                }
                placeholder="60"
                className={errors.duration ? "border-red-500" : ""}
              />
              {errors.duration && (
                <p className="text-sm text-red-500 mt-1">{errors.duration}</p>
              )}
            </div>

            {/* Notify Before */}
            <div className="space-y-2">
              <Label htmlFor="notify">Notify Before (minutes)</Label>
              <Input
                id="notify"
                type="number"
                min="0"
                value={formData.notifyBeforeMinutes}
                onChange={(e) =>
                  handleInputChange(
                    "notifyBeforeMinutes",
                    parseInt(e.target.value)
                  )
                }
                placeholder="30"
              />
            </div>

            {/* YouTube Link */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="youtube">
                YouTube Link <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Youtube className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                <Input
                  id="youtube"
                  value={formData.youtubeLink}
                  onChange={(e) =>
                    handleInputChange("youtubeLink", e.target.value)
                  }
                  placeholder="https://www.youtube.com/embed/..."
                  className={cn(
                    "pl-10",
                    errors.youtubeLink && "border-red-500"
                  )}
                />
              </div>
              {errors.youtubeLink && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.youtubeLink}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Add any additional details about this session..."
                rows={4}
              />
            </div>

            {/* Thumbnail Upload */}
            <div className="md:col-span-2 space-y-2">
              <Label>Thumbnail Image (Optional)</Label>
              <FileUpload
                accept="image/*"
                onUploadComplete={handleImageUpload}
                maxSize={5 * 1024 * 1024}
                className="mt-2"
              />
              {formData.thumbnailUrl && (
                <div className="mt-4 relative w-full aspect-video rounded-lg overflow-hidden border">
                  <Image
                    src={formData.thumbnailUrl}
                    alt="Schedule thumbnail"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createSchedule.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createSchedule.isPending || isUploadingImage}
            >
              {createSchedule.isPending ? "Creating..." : "Create Schedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
