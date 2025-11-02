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
import { Switch } from "@/components/ui/switch";
import { useUpdateTestSeries, TestSeries } from "@/hooks/test-series";
import { FileUpload } from "@/components/common/file-upload";
import Image from "next/image";
import { X, Plus } from "lucide-react";

interface FAQ {
  id: string;
  title: string;
  description: string;
}

interface EditTestSeriesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testSeries: TestSeries;
  onSuccess?: () => void;
}

export function EditTestSeriesModal({
  open,
  onOpenChange,
  testSeries,
  onSuccess,
}: EditTestSeriesModalProps) {
  const [formData, setFormData] = useState({
    exam: testSeries.exam,
    title: testSeries.title,
    description: testSeries.description?.html || "",
    slug: testSeries.slug,
    imageUrl: testSeries.imageUrl || "",
    totalPrice: testSeries.totalPrice,
    discountPercentage: testSeries.discountPercentage,
    isFree: testSeries.isFree,
    durationDays: testSeries.durationDays,
    isActive: testSeries.isActive,
  });

  const updateMutation = useUpdateTestSeries();
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [faqs, setFaqs] = useState<FAQ[]>(
    (testSeries.faq || []).map((faq, index) => ({
      id: `faq-${index}-${Date.now()}`,
      title: faq.title,
      description: faq.description,
    }))
  );
  const [newFaq, setNewFaq] = useState({ title: "", description: "" });
  const [isAddingFaq, setIsAddingFaq] = useState(false);

  useEffect(() => {
    if (testSeries) {
      setFormData({
        exam: testSeries.exam,
        title: testSeries.title,
        description: testSeries.description?.html || "",
        slug: testSeries.slug,
        imageUrl: testSeries.imageUrl || "",
        totalPrice: testSeries.totalPrice,
        discountPercentage: testSeries.discountPercentage,
        isFree: testSeries.isFree,
        durationDays: testSeries.durationDays,
        isActive: testSeries.isActive,
      });
      // Initialize FAQs from testSeries
      setFaqs(
        (testSeries.faq || []).map((faq, index) => ({
          id: `faq-${index}-${Date.now()}`,
          title: faq.title,
          description: faq.description,
        }))
      );
    }
  }, [testSeries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateMutation.mutateAsync({
        id: testSeries.id,
        data: {
          title: formData.title,
          description: {
            html: formData.description,
            features: testSeries.description?.features || [],
          },
          imageUrl: formData.imageUrl || undefined,
          faq: faqs.map((faq) => ({
            title: faq.title,
            description: faq.description,
          })),
          totalPrice: formData.isFree ? 0 : formData.totalPrice,
          discountPercentage: formData.isFree ? 0 : formData.discountPercentage,
        },
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to update test series:", error);
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
    setFormData({ ...formData, imageUrl: fileData.url });
    setIsUploadingImage(false);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setFormData({ ...formData, title, slug });
  };

  const handleAddFaq = () => {
    if (newFaq.title.trim() && newFaq.description.trim()) {
      const faq: FAQ = {
        id: Date.now().toString(),
        title: newFaq.title,
        description: newFaq.description,
      };
      setFaqs((prev) => [...prev, faq]);
      setNewFaq({ title: "", description: "" });
      setIsAddingFaq(false);
    }
  };

  const handleRemoveFaq = (id: string) => {
    setFaqs((prev) => prev.filter((faq) => faq.id !== id));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Test Series</DialogTitle>
          <DialogDescription>
            Update the test series information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          {/* FAQ Section */}
          <div className="space-y-2">
            <Label>Frequently Asked Questions (Optional)</Label>

            {faqs.length > 0 && (
              <div className="space-y-3 mb-4">
                {faqs.map((faq) => (
                  <div key={faq.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{faq.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
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
                  </div>
                ))}
              </div>
            )}

            {isAddingFaq ? (
              <div className="space-y-3 p-3 border rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="faq-title">Question</Label>
                  <Input
                    id="faq-title"
                    placeholder="What is this test series about?"
                    value={newFaq.title}
                    onChange={(e) =>
                      setNewFaq((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="faq-description">Answer</Label>
                  <Textarea
                    id="faq-description"
                    placeholder="This test series covers..."
                    value={newFaq.description}
                    onChange={(e) =>
                      setNewFaq((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddFaq}
                    disabled={
                      !newFaq.title.trim() || !newFaq.description.trim()
                    }
                  >
                    Add FAQ
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsAddingFaq(false);
                      setNewFaq({ title: "", description: "" });
                    }}
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
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add FAQ
              </Button>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Updating..." : "Update Test Series"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
