"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpdateContent } from "@/hooks";
import {
  useContentForm,
  LectureFields,
  PdfFields,
  ContentTypeSelector,
  formDataToContentData,
  contentToFormData,
  Content,
  ContentType,
} from "@/components/common/content-form";

interface EditContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: Content | null;
  onSuccess?: () => void;
}

export function EditContentModal({
  isOpen,
  onClose,
  content,
  onSuccess,
}: EditContentModalProps) {
  const {
    formData,
    files,
    updateFormDataPartial,
    updateFile,
    resetForm,
    validation,
    setFormData,
  } = useContentForm({ initialContent: content });

  const updateContentMutation = useUpdateContent();

  // Initialize form data when content changes
  useEffect(() => {
    if (content) {
      const initialFormData = contentToFormData(content);
      setFormData(initialFormData);
    }
  }, [content, setFormData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validation.isValid || !content) {
      return;
    }

    try {
      const contentData = formDataToContentData(formData, files);

      await updateContentMutation.mutateAsync({
        id: content.id,
        data: contentData,
      });
      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error("Failed to update content:", error);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isSubmitting = updateContentMutation.isPending;

  if (!content) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Content</DialogTitle>
          <DialogDescription>
            Update content information (Lecture or PDF).
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
              onChange={(e) => updateFormDataPartial({ name: e.target.value })}
              required
            />
          </div>

          {/* Content Type */}
          <ContentTypeSelector
            value={formData.type}
            onChange={(value) => updateFormDataPartial({ type: value })}
          />

          {/* Conditional Fields based on Type */}
          {formData.type === ContentType.LECTURE && (
            <LectureFields
              formData={formData}
              onUpdate={updateFormDataPartial}
              onVideoFileUpload={(url) => updateFile("videoFile", url)}
              onThumbnailFileUpload={(url) => updateFile("thumbnailFile", url)}
            />
          )}

          {formData.type === ContentType.PDF && (
            <PdfFields
              formData={formData}
              onUpdate={updateFormDataPartial}
              onPdfFileUpload={(url) => updateFile("pdfFile", url)}
            />
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !validation.isValid}
            >
              {isSubmitting ? "Updating..." : "Update Content"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
