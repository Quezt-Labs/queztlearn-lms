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
import { FileUpload } from "@/components/common/file-upload";
import { X, Plus } from "lucide-react";
import Image from "next/image";
import { useUpdateBatch } from "@/hooks";

interface Batch {
  id: string;
  name: string;
  description: string;
  class: string;
  exam: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  language: string;
  totalPrice: number;
  discountPercentage: number;
  faq: Array<{
    title: string;
    description: string;
  }>;
  teacherId?: string;
}

interface EditBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: Batch | null;
  onSuccess?: () => void;
}

export function EditBatchModal({
  isOpen,
  onClose,
  batch,
  onSuccess,
}: EditBatchModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    class: "",
    exam: "",
    imageUrl: "",
    startDate: "",
    endDate: "",
    language: "",
    totalPrice: 0,
    discountPercentage: 0,
  });
  const [faqs, setFaqs] = useState<
    Array<{ id: string; title: string; description: string }>
  >([]);
  const [newFaq, setNewFaq] = useState({ title: "", description: "" });
  const [isAddingFaq, setIsAddingFaq] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const updateBatchMutation = useUpdateBatch();

  // Initialize form data when batch changes or modal opens
  useEffect(() => {
    if (batch && isOpen) {
      setFormData({
        name: batch.name || "",
        description: batch.description || "",
        class: batch.class || "",
        exam: batch.exam || "",
        imageUrl: batch.imageUrl || "",
        startDate: batch.startDate
          ? new Date(batch.startDate).toISOString().split("T")[0]
          : "",
        endDate: batch.endDate
          ? new Date(batch.endDate).toISOString().split("T")[0]
          : "",
        language: batch.language || "",
        totalPrice: batch.totalPrice || 0,
        discountPercentage: batch.discountPercentage || 0,
      });
      setFaqs(
        batch.faq?.map((faq, index) => ({
          id: `faq-${index}`,
          title: faq.title,
          description: faq.description,
        })) || []
      );
    }
  }, [batch, isOpen]);

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
      setFormData((prev) => ({ ...prev, imageUrl: fileData.url }));
    } catch (error) {
      console.error("Failed to update image URL:", error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAddFaq = () => {
    if (newFaq.title.trim() && newFaq.description.trim()) {
      setFaqs((prev) => [
        ...prev,
        {
          id: `faq-${Date.now()}`,
          title: newFaq.title,
          description: newFaq.description,
        },
      ]);
      setNewFaq({ title: "", description: "" });
      setIsAddingFaq(false);
    }
  };

  const handleRemoveFaq = (id: string) => {
    setFaqs((prev) => prev.filter((faq) => faq.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !batch) {
      return;
    }

    setIsSubmitting(true);

    try {
      const batchData = {
        name: formData.name,
        description: formData.description,
        class: formData.class,
        exam: formData.exam,
        imageUrl: formData.imageUrl || undefined,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        language: formData.language,
        totalPrice: formData.totalPrice,
        discountPercentage: formData.discountPercentage,
        faq: faqs.map((faq) => ({
          title: faq.title,
          description: faq.description,
        })),
        teacherId: batch.teacherId,
      };

      await updateBatchMutation.mutateAsync({
        id: batch.id,
        data: batchData,
      });
      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error("Failed to update batch:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      class: "",
      exam: "",
      imageUrl: "",
      startDate: "",
      endDate: "",
      language: "",
      totalPrice: 0,
      discountPercentage: 0,
    });
    setFaqs([]);
    setNewFaq({ title: "", description: "" });
    setIsAddingFaq(false);
    setIsUploadingImage(false);
    onClose();
  };

  if (!batch) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Course</DialogTitle>
          <DialogDescription>
            Update course information and details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Course Name *</Label>
            <Input
              id="name"
              placeholder="Enter course name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter course description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
            />
          </div>

          {/* Class and Exam */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="class">Class *</Label>
              <Input
                id="class"
                placeholder="e.g., 11, 12"
                value={formData.class}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, class: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exam">Exam *</Label>
              <Input
                id="exam"
                placeholder="e.g., JEE, NEET"
                value={formData.exam}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, exam: e.target.value }))
                }
                required
              />
            </div>
          </div>

          {/* Course Image */}
          <div className="space-y-2">
            <Label>Course Image (Optional)</Label>
            {formData.imageUrl && (
              <div className="mb-2 h-20 w-20 relative rounded-lg border overflow-hidden">
                <Image
                  src={formData.imageUrl}
                  alt="Current course image"
                  className="object-cover"
                  fill
                  sizes="80px"
                />
              </div>
            )}
            <FileUpload
              onUploadComplete={handleImageUpload}
              accept="image/*"
              maxSize={10} // 10MB for images
              folder="course-images"
              className="w-full"
            />
            {isUploadingImage && (
              <p className="text-sm text-muted-foreground">
                Uploading image...
              </p>
            )}
          </div>

          {/* Start and End Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, endDate: e.target.value }))
                }
                required
              />
            </div>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="language">Language *</Label>
            <Input
              id="language"
              placeholder="e.g., English, Hindi"
              value={formData.language}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, language: e.target.value }))
              }
              required
            />
          </div>

          {/* Price and Discount */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalPrice">Total Price (₹) *</Label>
              <Input
                id="totalPrice"
                type="number"
                placeholder="0"
                value={formData.totalPrice}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    totalPrice: Number(e.target.value),
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discountPercentage">Discount (%)</Label>
              <Input
                id="discountPercentage"
                type="number"
                placeholder="0"
                value={formData.discountPercentage}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    discountPercentage: Number(e.target.value),
                  }))
                }
                min="0"
                max="100"
              />
            </div>
          </div>

          {/* FAQs */}
          <div className="space-y-2">
            <Label>FAQs</Label>
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="flex items-center space-x-2 p-2 border rounded"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">{faq.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {faq.description}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFaq(faq.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {isAddingFaq ? (
              <div className="space-y-2 p-3 border rounded">
                <Input
                  placeholder="FAQ Title"
                  value={newFaq.title}
                  onChange={(e) =>
                    setNewFaq((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
                <Textarea
                  placeholder="FAQ Description"
                  value={newFaq.description}
                  onChange={(e) =>
                    setNewFaq((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={2}
                />
                <div className="flex space-x-2">
                  <Button type="button" onClick={handleAddFaq} size="sm">
                    Add FAQ
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddingFaq(false)}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddingFaq(true)}
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add FAQ
              </Button>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.name.trim()}
            >
              {isSubmitting ? "Updating..." : "Update Course"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
