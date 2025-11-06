"use client";

import { useState, useEffect } from "react";
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
import { useGetSubjectsByBatch } from "@/hooks";
import Image from "next/image";

interface Schedule {
  id: string;
  topicId?: string;
  subjectId: string;
  title: string;
  description?: string;
  subjectName: string;
  youtubeLink: string;
  scheduledAt: Date | string;
  duration: number;
  teacherId?: string;
  thumbnailUrl?: string;
  notifyBeforeMinutes?: number;
}

interface EditScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: Schedule | null;
  batchId: string;
  onSuccess: () => void;
}

interface Subject {
  id: string;
  name: string;
}

export function EditScheduleModal({
  isOpen,
  onClose,
  schedule,
  batchId,
  onSuccess,
}: EditScheduleModalProps) {
  const [formData, setFormData] = useState({
    topicId: "",
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const { data: subjectsData } = useGetSubjectsByBatch(batchId);

  const subjects = (subjectsData?.data as Subject[]) || [];

  useEffect(() => {
    if (schedule) {
      const scheduledDate = new Date(schedule.scheduledAt);
      const timeString = format(scheduledDate, "HH:mm");

      setFormData({
        topicId: schedule.topicId || "",
        subjectId: schedule.subjectId,
        title: schedule.title,
        description: schedule.description || "",
        subjectName: schedule.subjectName,
        youtubeLink: schedule.youtubeLink || "",
        scheduledAt: scheduledDate.toISOString(),
        scheduledTime: timeString,
        duration: schedule.duration,
        teacherId: schedule.teacherId || "",
        thumbnailUrl: schedule.thumbnailUrl || "",
        notifyBeforeMinutes: schedule.notifyBeforeMinutes || 30,
      });
    }
  }, [schedule]);

  useEffect(() => {
    // Auto-fill subject name when subject is selected
    if (formData.subjectId) {
      const selectedSubject = subjects.find((s) => s.id === formData.subjectId);
      if (selectedSubject) {
        setFormData((prev) => ({ ...prev, subjectName: selectedSubject.name }));
      }
    }
  }, [formData.subjectId, subjects]);

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
    if (formData.youtubeLink && !formData.youtubeLink.includes("youtube.com")) {
      newErrors.youtubeLink = "Please enter a valid YouTube link";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !schedule) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Combine date and time
      const scheduledDate = new Date(formData.scheduledAt);
      const [hours, minutes] = formData.scheduledTime.split(":");
      scheduledDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const scheduleData = {
        id: schedule.id,
        topicId: formData.topicId || undefined,
        subjectId: formData.subjectId,
        title: formData.title,
        description: formData.description || undefined,
        subjectName: formData.subjectName,
        youtubeLink: formData.youtubeLink,
        scheduledAt: scheduledDate.toISOString(),
        duration: formData.duration,
        teacherId: formData.teacherId || undefined,
        thumbnailUrl: formData.thumbnailUrl || undefined,
        notifyBeforeMinutes: formData.notifyBeforeMinutes || undefined,
      };

      // TODO: Call API to update schedule
      console.log("Updating schedule:", scheduleData);

      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Failed to update schedule:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      topicId: "",
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
    setIsSubmitting(false);
    onClose();
  };

  if (!schedule) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Schedule</DialogTitle>
          <DialogDescription>
            Update the schedule details for this class or session
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <Label htmlFor="youtube">YouTube Link (Optional)</Label>
              <div className="relative">
                <Youtube className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                <Input
                  id="youtube"
                  value={formData.youtubeLink}
                  onChange={(e) =>
                    handleInputChange("youtubeLink", e.target.value)
                  }
                  placeholder="https://www.youtube.com/watch?v=..."
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

              {/* Duration */}
              <div>
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
              <div>
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
              <div className="md:col-span-2">
                <Label htmlFor="youtube">YouTube Link (Optional)</Label>
                <div className="relative">
                  <Youtube className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                  <Input
                    id="youtube"
                    value={formData.youtubeLink}
                    onChange={(e) =>
                      handleInputChange("youtubeLink", e.target.value)
                    }
                    placeholder="https://www.youtube.com/watch?v=..."
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
              <div className="md:col-span-2">
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
                  onUploadComplete={(fileData) =>
                    handleInputChange("thumbnailUrl", fileData.url)
                  }
                  accept="image/*"
                  maxSize={5}
                />
                {formData.thumbnailUrl && (
                  <p className="text-sm text-muted-foreground">
                    Current thumbnail: {formData.thumbnailUrl}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Recommended: 16:9 aspect ratio, max 5MB
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploadingImage}>
              {isSubmitting ? "Updating..." : "Update Schedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
