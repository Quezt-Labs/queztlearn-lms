"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Switch } from "@/components/ui/switch";
import { useCreateTestSeries, ExamType, TestSeries } from "@/hooks/test-series";
import { FileUpload } from "@/components/common/file-upload";
import Image from "next/image";
import { X } from "lucide-react";

interface CreateTestSeriesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (testSeries: TestSeries) => void;
}

const EXAM_OPTIONS: ExamType[] = [
  "JEE",
  "NEET",
  "UPSC",
  "BANK",
  "SSC",
  "GATE",
  "CAT",
  "NDA",
  "CLAT",
  "OTHER",
];

export function CreateTestSeriesModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateTestSeriesModalProps) {
  const [formData, setFormData] = useState({
    exam: "JEE" as ExamType,
    title: "",
    description: "",
    slug: "",
    imageUrl: "",
    totalPrice: 0,
    discountPercentage: 0,
    isFree: false,
    durationDays: 365,
    isActive: true,
  });

  const createMutation = useCreateTestSeries();
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await createMutation.mutateAsync({
        exam: formData.exam,
        title: formData.title,
        description: {
          html: formData.description,
          features: [],
        },
        slug: formData.slug,
        imageUrl: formData.imageUrl || undefined,
        totalPrice: formData.isFree ? 0 : formData.totalPrice,
        discountPercentage: formData.isFree ? 0 : formData.discountPercentage,
        isFree: formData.isFree,
        durationDays: formData.durationDays,
        isActive: formData.isActive,
      });

      // Reset form
      setFormData({
        exam: "JEE",
        title: "",
        description: "",
        slug: "",
        imageUrl: "",
        totalPrice: 0,
        discountPercentage: 0,
        isFree: false,
        durationDays: 365,
        isActive: true,
      });
      onOpenChange(false);
      onSuccess?.(result.data);
    } catch (error) {
      console.error("Failed to create test series:", error);
    }
  };

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setFormData({ ...formData, title, slug });
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
    setFormData({ ...formData, imageUrl: fileData.url });
    setIsUploadingImage(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Test Series</DialogTitle>
          <DialogDescription>
            Add a new test series for students to enroll in
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Exam Type */}
          <div className="space-y-2">
            <Label htmlFor="exam">
              Exam Category <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.exam}
              onValueChange={(value) =>
                setFormData({ ...formData, exam: value as ExamType })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXAM_OPTIONS.map((exam) => (
                  <SelectItem key={exam} value={exam}>
                    {exam}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="JEE Main 2025 Complete Test Series"
              value={formData.title}
              onChange={handleTitleChange}
              required
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">
              Slug <span className="text-red-500">*</span>
            </Label>
            <Input
              id="slug"
              placeholder="jee-main-2025-complete-test-series"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              required
            />
            <p className="text-xs text-muted-foreground">
              Auto-generated from title. Used in URLs.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Comprehensive test series covering all topics..."
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Test Series Image (Optional)</Label>
            <div className="space-y-4">
              {/* Image Preview */}
              {formData.imageUrl && (
                <div className="relative h-48 w-full rounded-lg border overflow-hidden">
                  <Image
                    src={formData.imageUrl}
                    alt="Test series preview"
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setFormData({ ...formData, imageUrl: "" })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* File Upload */}
              <FileUpload
                onUploadComplete={handleImageUpload}
                accept="image/*"
                maxSize={10} // 10MB for images
                folder="test-series-images"
                className="w-full"
              />

              {isUploadingImage && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span>Uploading image...</span>
                </div>
              )}
            </div>
          </div>

          {/* Free/Paid Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isFree"
              checked={formData.isFree}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isFree: checked })
              }
            />
            <Label htmlFor="isFree">Free Test Series</Label>
          </div>

          {/* Pricing (only if not free) */}
          {!formData.isFree && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalPrice">
                  Price (₹) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="totalPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="2999"
                  value={formData.totalPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      totalPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                  required={!formData.isFree}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountPercentage">Discount (%)</Label>
                <Input
                  id="discountPercentage"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="20"
                  value={formData.discountPercentage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountPercentage: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
          )}

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="durationDays">Duration (Days)</Label>
            <Input
              id="durationDays"
              type="number"
              min="1"
              placeholder="365"
              value={formData.durationDays}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  durationDays: parseInt(e.target.value) || 365,
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              Access validity period for enrolled students
            </p>
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isActive: checked })
              }
            />
            <Label htmlFor="isActive">Active (visible to students)</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Test Series"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
