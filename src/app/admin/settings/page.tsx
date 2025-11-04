"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/common/page-header";
import { useCurrentUser } from "@/hooks";
import {
  useOrganizationConfigAdmin,
  useUpdateOrganizationConfig,
} from "@/hooks/api";
import { CreateOrganizationConfigData } from "@/lib/types/api";
import {
  Loader2,
  Save,
  Palette,
  Building2,
  Mail,
  Sparkles,
  X,
  Plus,
  CreditCard,
  Home,
  Eye,
  EyeOff,
} from "lucide-react";
import { THEME_OPTIONS } from "@/lib/constants";
import { FileUpload } from "@/components/common/file-upload";
import Image from "next/image";

export default function AdminSettingsPage() {
  const { data: currentUser } = useCurrentUser();
  const { data: configData, isLoading: configLoading } =
    useOrganizationConfigAdmin();
  const updateMutation = useUpdateOrganizationConfig();
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
  const [bannerUrls, setBannerUrls] = useState<string[]>([]);
  const [features, setFeatures] = useState<
    Array<{ title: string; description: string; icon?: string }>
  >([]);

  const [showRazorpayKeyId, setShowRazorpayKeyId] = useState(false);
  const [showRazorpayKeySecret, setShowRazorpayKeySecret] = useState(false);

  const [formData, setFormData] = useState<CreateOrganizationConfigData>({
    organizationId: currentUser?.organizationId || "",
    name: "",
    slug: "",
    theme: {
      primaryColor: "#6366f1",
      secondaryColor: "#ec4899",
      fontFamily: "Inter, sans-serif",
    },
    maintenanceMode: false,
    currency: "INR",
    supportEmail: "",
    contactEmail: "",
    contactPhone: "",
    description: "",
  });

  // Load config data when available
  useEffect(() => {
    if (configData?.success && configData.data) {
      const config = configData.data;
      setFormData({
        organizationId: config.organizationId,
        name: config.name,
        slug: config.slug,
        domain: config.domain,
        contactEmail: config.contactEmail || "",
        contactPhone: config.contactPhone || "",
        currency: config.currency || "INR",
        description: config.description || "",
        theme: {
          primaryColor: config.theme?.primaryColor || "#6366f1",
          secondaryColor: config.theme?.secondaryColor || "#ec4899",
          fontFamily: config.theme?.fontFamily || "Inter, sans-serif",
        },
        maintenanceMode: config.maintenanceMode || false,
        supportEmail: config.supportEmail || "",
        logoUrl: config.logoUrl,
        faviconUrl: config.faviconUrl,
        heroTitle: config.heroTitle,
        heroSubtitle: config.heroSubtitle,
        motto: config.motto,
        razorpayKeyId: config.razorpayKeyId,
        razorpayKeySecret: config.razorpayKeySecret,
        metaTitle: config.metaTitle,
        metaDescription: config.metaDescription,
        featuresEnabled: config.featuresEnabled,
      });
      setBannerUrls(config.bannerUrls || []);
      setFeatures(config.features || []);
    }
  }, [configData]);

  const handleLogoUpload = (fileData: {
    key: string;
    url: string;
    bucket: string;
    originalName: string;
    size: number;
    mimeType: string;
  }) => {
    setIsUploadingLogo(true);
    setFormData({ ...formData, logoUrl: fileData.url });
    setIsUploadingLogo(false);
  };

  const handleFaviconUpload = (fileData: {
    key: string;
    url: string;
    bucket: string;
    originalName: string;
    size: number;
    mimeType: string;
  }) => {
    setIsUploadingFavicon(true);
    setFormData({ ...formData, faviconUrl: fileData.url });
    setIsUploadingFavicon(false);
  };

  const handleBannerUpload = (fileData: {
    key: string;
    url: string;
    bucket: string;
    originalName: string;
    size: number;
    mimeType: string;
  }) => {
    setBannerUrls((prev) => [...prev, fileData.url]);
  };

  const handleRemoveBanner = (index: number) => {
    setBannerUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddFeature = () => {
    setFeatures([...features, { title: "", description: "", icon: "" }]);
  };

  const handleUpdateFeature = (
    index: number,
    field: "title" | "description" | "icon",
    value: string
  ) => {
    const updatedFeatures = [...features];
    updatedFeatures[index] = { ...updatedFeatures[index], [field]: value };
    setFeatures(updatedFeatures);
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const submitData = {
        ...formData,
        bannerUrls: bannerUrls.length > 0 ? bannerUrls : undefined,
        features: features.length > 0 ? features : undefined,
      };
      const result = await updateMutation.mutateAsync(submitData);
      if (result.success) {
        alert("Settings saved successfully!");
      }
    } catch (error) {
      alert("Failed to update settings. Please try again.");
      console.error("Failed to update settings:", error);
    }
  };

  if (configLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your organization settings, theme, and configuration"
      />

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">
              <Building2 className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="theme">
              <Palette className="h-4 w-4 mr-2" />
              Theme & Branding
            </TabsTrigger>
            <TabsTrigger value="homepage">
              <Home className="h-4 w-4 mr-2" />
              Homepage
            </TabsTrigger>
            <TabsTrigger value="payment">
              <CreditCard className="h-4 w-4 mr-2" />
              Payment
            </TabsTrigger>
            <TabsTrigger value="contact">
              <Mail className="h-4 w-4 mr-2" />
              Contact & Support
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
                <CardDescription>
                  Basic information about your organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/50 border rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    To edit Organization Name, Slug, or Domain, please contact{" "}
                    <a
                      href="mailto:admin@queztlearn.com"
                      className="text-primary hover:underline font-medium"
                    >
                      admin@queztlearn.com
                    </a>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">
                    Organization Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    disabled
                    className="bg-muted cursor-not-allowed"
                    placeholder="Your Organization Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">
                    Slug <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    disabled
                    className="bg-muted cursor-not-allowed"
                    placeholder="your-org-slug"
                  />
                  <p className="text-xs text-muted-foreground">
                    Used in URLs: {formData.slug || "your-org"}.queztlearn.com
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domain">Domain</Label>
                  <Input
                    id="domain"
                    value={formData.domain || ""}
                    disabled
                    className="bg-muted cursor-not-allowed"
                    placeholder="yourdomain.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    placeholder="Brief description of your organization"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motto">Motto</Label>
                  <Input
                    id="motto"
                    value={formData.motto || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, motto: e.target.value })
                    }
                    placeholder="Your organization motto or tagline"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={formData.currency || "INR"}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                    placeholder="INR"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="maintenanceMode"
                    checked={formData.maintenanceMode || false}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, maintenanceMode: checked })
                    }
                  />
                  <Label htmlFor="maintenanceMode">
                    Maintenance Mode
                    <span className="text-xs text-muted-foreground block">
                      Enable to show maintenance page to visitors
                    </span>
                  </Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Theme & Branding */}
          <TabsContent value="theme" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Organization Logo</CardTitle>
                  <CardDescription>
                    Upload your organization logo (recommended size: 200x200px)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Logo Preview */}
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
                          setFormData({ ...formData, logoUrl: undefined })
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {/* Logo Upload */}
                  <FileUpload
                    onUploadComplete={handleLogoUpload}
                    accept="image/*"
                    maxSize={5} // 5MB for logos
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
                    Upload your organization favicon (recommended size: 32x32px
                    or 16x16px)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Favicon Preview */}
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
                          setFormData({ ...formData, faviconUrl: undefined })
                        }
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  {/* Favicon Upload */}
                  <FileUpload
                    onUploadComplete={handleFaviconUpload}
                    accept="image/*"
                    maxSize={1} // 1MB for favicons
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
                  Choose from professionally designed themes optimized for light
                  and dark modes
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
                          setFormData({
                            ...formData,
                            theme: {
                              ...formData.theme,
                              primaryColor: theme.primaryColor,
                              secondaryColor: theme.secondaryColor,
                            },
                          })
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
                          {/* Color Preview */}
                          <div
                            className={`h-16 rounded-md bg-gradient-to-br ${theme.gradient} shadow-sm`}
                          />
                          <div className="text-left">
                            <p className="font-medium text-sm">{theme.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {theme.description}
                            </p>
                          </div>
                          {/* Selected Indicator */}
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

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Theme Preview</CardTitle>
                <CardDescription>
                  Preview of your selected theme colors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      type="button"
                      style={{
                        backgroundColor: formData.theme?.primaryColor,
                      }}
                    >
                      Primary Button
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      style={{
                        borderColor: formData.theme?.secondaryColor,
                        color: formData.theme?.secondaryColor,
                      }}
                    >
                      Secondary Button
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Homepage Settings */}
          <TabsContent value="homepage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>
                  Configure the hero section displayed on your homepage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="heroTitle">Hero Title</Label>
                  <Input
                    id="heroTitle"
                    value={formData.heroTitle || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, heroTitle: e.target.value })
                    }
                    placeholder="Welcome to Our Learning Platform"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                  <Textarea
                    id="heroSubtitle"
                    value={formData.heroSubtitle || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, heroSubtitle: e.target.value })
                    }
                    rows={3}
                    placeholder="Advance your education with our world-class courses"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Banner Images</CardTitle>
                <CardDescription>
                  Upload banner images for your homepage (multiple images
                  supported)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {bannerUrls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {bannerUrls.map((url, index) => (
                      <div
                        key={index}
                        className="relative h-32 rounded-lg border overflow-hidden bg-muted"
                      >
                        <Image
                          src={url}
                          alt={`Banner ${index + 1}`}
                          className="object-cover"
                          fill
                          sizes="(max-width: 768px) 50vw, 33vw"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => handleRemoveBanner(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <FileUpload
                  onUploadComplete={handleBannerUpload}
                  accept="image/*"
                  maxSize={10}
                  folder="organization-banners"
                  className="w-full"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Features</CardTitle>
                    <CardDescription>
                      Showcase key features on your homepage
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddFeature}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Feature
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {features.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No features added yet. Click &quot;Add Feature&quot; to get
                    started.
                  </p>
                )}

                {features.map((feature, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium">Feature {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFeature(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`feature-title-${index}`}>Title</Label>
                      <Input
                        id={`feature-title-${index}`}
                        value={feature.title}
                        onChange={(e) =>
                          handleUpdateFeature(index, "title", e.target.value)
                        }
                        placeholder="Feature title"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`feature-description-${index}`}>
                        Description
                      </Label>
                      <Textarea
                        id={`feature-description-${index}`}
                        value={feature.description}
                        onChange={(e) =>
                          handleUpdateFeature(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        rows={2}
                        placeholder="Feature description"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`feature-icon-${index}`}>
                        Icon (Optional)
                      </Label>
                      <Input
                        id={`feature-icon-${index}`}
                        value={feature.icon || ""}
                        onChange={(e) =>
                          handleUpdateFeature(index, "icon", e.target.value)
                        }
                        placeholder="Icon name or URL"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Settings */}
          <TabsContent value="payment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Razorpay Payment Gateway Configuration</CardTitle>
                <CardDescription>
                  Configure your Razorpay credentials to enable payment
                  processing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Important Information Box */}

                {/* Security Warning */}
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <svg
                        className="h-5 w-5 text-amber-600 dark:text-amber-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                        Security Warning
                      </h4>
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        Your Razorpay Key Secret is sensitive information. Never
                        share it in emails, chat, or any public forums. Only
                        authorized personnel should have access to these
                        credentials.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Configuration Fields */}
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="razorpayKeyId">
                      Razorpay Key ID <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="razorpayKeyId"
                        type={showRazorpayKeyId ? "text" : "password"}
                        value={formData.razorpayKeyId || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            razorpayKeyId: e.target.value,
                          })
                        }
                        onCopy={(e) => e.preventDefault()}
                        onCut={(e) => e.preventDefault()}
                        onPaste={(e) => e.preventDefault()}
                        autoComplete="off"
                        data-lpignore="true"
                        data-form-type="other"
                        spellCheck={false}
                        placeholder="rzp_test_xxxxxxxxxxxxx or rzp_live_xxxxxxxxxxxxx"
                        className="font-mono text-sm pr-24"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowRazorpayKeyId((s) => !s)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8"
                      >
                        {showRazorpayKeyId ? (
                          <span className="flex items-center gap-1">
                            <EyeOff className="h-4 w-4" /> Hide
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" /> Show
                          </span>
                        )}
                      </Button>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Found in: Razorpay Dashboard → Settings → API Keys
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Format: <code className="text-xs">rzp_test_*</code> or{" "}
                        <code className="text-xs">rzp_live_*</code>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="razorpayKeySecret">
                      Razorpay Key Secre jht{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="razorpayKeySecret"
                        type={showRazorpayKeySecret ? "text" : "password"}
                        value={formData.razorpayKeySecret || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            razorpayKeySecret: e.target.value,
                          })
                        }
                        onCopy={(e) => e.preventDefault()}
                        onCut={(e) => e.preventDefault()}
                        onPaste={(e) => e.preventDefault()}
                        autoComplete="off"
                        spellCheck={false}
                        placeholder="Enter your Razorpay key secret"
                        className="font-mono text-sm pr-24"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowRazorpayKeySecret((s) => !s)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8"
                      >
                        {showRazorpayKeySecret ? (
                          <span className="flex items-center gap-1">
                            <EyeOff className="h-4 w-4" /> Hide
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" /> Show
                          </span>
                        )}
                      </Button>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Found in: Razorpay Dashboard → Settings → API Keys
                        (reveal secret)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        This will be hidden for security. Make sure to copy it
                        correctly.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Help Section */}
                <div className="pt-4 border-t">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Need Help?</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>
                        • Get your credentials from{" "}
                        <a
                          href="https://dashboard.razorpay.com/app/keys"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline font-medium"
                        >
                          Razorpay Dashboard
                        </a>
                      </p>
                      <p>
                        • For support, contact{" "}
                        <a
                          href="mailto:admin@queztlearn.com"
                          className="text-primary hover:underline font-medium"
                        >
                          admin@queztlearn.com
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact & Support */}
          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Contact details for your organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, contactEmail: e.target.value })
                    }
                    placeholder="contact@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    value={formData.contactPhone || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, contactPhone: e.target.value })
                    }
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={formData.supportEmail || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, supportEmail: e.target.value })
                    }
                    placeholder="support@example.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email address for customer support inquiries
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-6">
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="min-w-[120px]"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
