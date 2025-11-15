"use client";

import { motion } from "framer-motion";
import { StudentHeader } from "@/components/student/student-header";
import { PageHeader } from "@/components/common/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { useProfile, useUpdateProfile } from "@/hooks/api";
import { useIsMobile } from "@/hooks";
import { useProfileForm } from "./hooks/use-profile-form";
import { useProfileImageUpload } from "./hooks/use-profile-image-upload";
import { ProfileFormFields } from "./components/profile-form-fields";
import { ProfileCardSidebar } from "./components/profile-card-sidebar";
import { ProfileImageUpload } from "./components/profile-image-upload";

export default function ProfilePage() {
  const { isMobile, isClient } = useIsMobile();
  const { data: profileResponse, isLoading: isLoadingProfile } = useProfile();
  const updateProfile = useUpdateProfile();
  const profile = profileResponse?.data;

  const {
    formData,
    isEditing,
    hasChanges,
    phoneError,
    setIsEditing,
    handleInputChange,
    handleSubmit: handleFormSubmit,
    handleCancel,
    resetForm,
  } = useProfileForm({
    profile,
    onUpdate: async (data) => {
      await updateProfile.mutateAsync(data);
      toast.success("Profile updated successfully!");
    },
  });

  const { handleImageUpload, isUploading } = useProfileImageUpload();

  const handleImageSelect = async (file: File) => {
    const imageUrl = await handleImageUpload(file);
    if (imageUrl) {
      handleInputChange("profileImg", imageUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges) {
      toast.info("No changes to save");
      return;
    }
    await handleFormSubmit(e);
  };

  // Show nothing during initial render to prevent hydration mismatch
  if (!isClient) {
    return null;
  }

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <StudentHeader />
        <div className="container mx-auto px-4 py-6 space-y-6">
          <PageHeader
            title="My Profile"
            description="Manage your profile information"
          />

          {isLoadingProfile ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <ProfileImageUpload
                    profileImg={formData.profileImg}
                    username={formData.username}
                    isEditing={isEditing}
                    isUploading={isUploading}
                    onFileSelect={handleImageSelect}
                  />
                  <div>
                    <CardTitle>{formData.username || "User"}</CardTitle>
                    <CardDescription>{profile?.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <ProfileFormFields
                    formData={formData}
                    isEditing={isEditing}
                    onInputChange={handleInputChange}
                    phoneError={phoneError}
                    email={profile?.email}
                  />

                  {isEditing ? (
                    <div className="flex gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={updateProfile.isPending || !hasChanges}
                        className="flex-1"
                      >
                        {updateProfile.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="w-full mt-4"
                    >
                      Edit Profile
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Desktop view - premium design
  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-gradient-to-br from-background via-background to-muted/20">
      <StudentHeader />

      <div className="container mx-auto px-2 md:px-4 py-4 md:py-6 space-y-6 md:space-y-8 max-w-7xl w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <PageHeader
            title="My Profile"
            description="Manage your profile information and preferences"
          />
        </motion.div>

        {isLoadingProfile ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Header Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-1"
            >
              <ProfileCardSidebar
                formData={formData}
                profile={profile}
                isEditing={isEditing}
                isUploading={isUploading}
                onImageClick={() => {
                  // Trigger file input click
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) handleImageSelect(file);
                  };
                  input.click();
                }}
              />
            </motion.div>

            {/* Profile Form Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>
                        Update your personal information and preferences
                      </CardDescription>
                    </div>
                    {!isEditing && (
                      <Button
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                      >
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <ProfileFormFields
                      formData={formData}
                      isEditing={isEditing}
                      onInputChange={handleInputChange}
                      phoneError={phoneError}
                      email={profile?.email}
                    />

                    {/* Action Buttons */}
                    {isEditing && (
                      <div className="flex gap-3 pt-6 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancel}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={updateProfile.isPending || !hasChanges}
                          className="flex-1"
                        >
                          {updateProfile.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
