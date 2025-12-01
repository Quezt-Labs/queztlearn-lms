"use client";

import { Dispatch, SetStateAction } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";
import { CreateOrganizationConfigData } from "@/lib/types/api";
import { FileUpload } from "@/components/common/file-upload";
import { THEME_OPTIONS } from "@/lib/constants";

interface ThemeBrandingTabProps {
  formData: CreateOrganizationConfigData;
  setFormData: Dispatch<SetStateAction<CreateOrganizationConfigData>>;
  isUploadingLogo: boolean;
  isUploadingFavicon: boolean;
  onLogoUpload: (fileData: {
    key: string;
    url: string;
    bucket: string;
    originalName: string;
    size: number;
    mimeType: string;
  }) => void;
  onFaviconUpload: (fileData: {
    key: string;
    url: string;
    bucket: string;
    originalName: string;
    size: number;
    mimeType: string;
  }) => void;
}

export function ThemeBrandingTab({
  formData,
  setFormData,
  isUploadingLogo,
  isUploadingFavicon,
  onLogoUpload,
  onFaviconUpload,
}: ThemeBrandingTabProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Organization Logo</CardTitle>
            <CardDescription>
              Upload your organization logo (recommended size: 200x200px)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.logoUrl && (
              <div className="relative h-32 w-32 rounded-lg border overflow-hidden bg-muted">
                <Image
                  src={formData.logoUrl}
                  alt="Organization logo"
                  className="object-contain"
                  fill
                  sizes="128px"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, logoUrl: undefined }))
                  }
                >
                  <span className="sr-only">Remove logo</span>
                </Button>
              </div>
            )}

            <FileUpload
              onUploadComplete={onLogoUpload}
              accept="image/*"
              maxSize={5}
              folder="organization-logos"
              className="w-full"
            />

            {isUploadingLogo && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Uploading logo...</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Favicon</CardTitle>
            <CardDescription>
              Upload your organization favicon (recommended size: 32x32px or
              16x16px)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.faviconUrl && (
              <div className="relative h-16 w-16 rounded-lg border overflow-hidden bg-muted">
                <Image
                  src={formData.faviconUrl}
                  alt="Organization favicon"
                  className="object-contain"
                  fill
                  sizes="64px"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, faviconUrl: undefined }))
                  }
                >
                  <span className="sr-only">Remove favicon</span>
                </Button>
              </div>
            )}

            <FileUpload
              onUploadComplete={onFaviconUpload}
              accept="image/*"
              maxSize={1}
              folder="organization-favicons"
              className="w-full"
            />

            {isUploadingFavicon && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Uploading favicon...</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <CardTitle>Premium Theme Presets</CardTitle>
          </div>
          <CardDescription>
            Choose from professionally designed themes optimized for light and
            dark modes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
            {THEME_OPTIONS.map((theme) => {
              const isSelected =
                formData.theme?.primaryColor === theme.primaryColor &&
                formData.theme?.secondaryColor === theme.secondaryColor;

              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      theme: {
                        ...prev.theme,
                        primaryColor: theme.primaryColor,
                        secondaryColor: theme.secondaryColor,
                      },
                    }))
                  }
                  className={`
                    relative p-4 rounded-lg border-2 transition-all
                    hover:scale-105 hover:shadow-md
                    ${
                      isSelected
                        ? "border-primary ring-2 ring-primary ring-offset-2"
                        : "border-border hover:border-primary/50"
                    }
                  `}
                >
                  <div className="space-y-2">
                    <div
                      className={`h-16 rounded-md bg-gradient-to-br ${theme.gradient} shadow-sm`}
                    />
                    <div className="text-left">
                      <p className="font-medium text-sm">{theme.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {theme.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                          <svg
                            className="h-3 w-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
