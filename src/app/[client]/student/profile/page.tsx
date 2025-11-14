"use client";

import { useState, useEffect, useRef } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  useProfile,
  useUpdateProfile,
  useClientDirectUpload,
} from "@/hooks/api";
import { useIsMobile } from "@/hooks";
import { User, Mail, Phone, MapPin, Save, Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { isMobile, isClient } = useIsMobile();
  const { data: profileResponse, isLoading: isLoadingProfile } = useProfile();
  const updateProfile = useUpdateProfile();
  const clientUpload = useClientDirectUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profile = profileResponse?.data;

  const [formData, setFormData] = useState({
    username: "",
    profileImg: "",
    gender: "" as "Male" | "Female" | "Other" | "",
    phoneNumber: "",
    address: {
      city: "",
      state: "",
      pincode: "",
    },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      const initialData = {
        username: profile.username || "",
        profileImg: profile.profileImg || "",
        gender: profile.gender
          ? (profile.gender as "Male" | "Female" | "Other")
          : ("" as "Male" | "Female" | "Other" | ""),
        phoneNumber: profile.phoneNumber || "",
        address: {
          city: profile.address?.city || "",
          state: profile.address?.state || "",
          pincode: profile.address?.pincode || "",
        },
      };
      setFormData(initialData);
    }
  }, [profile]);

  // Track changes
  useEffect(() => {
    if (profile) {
      const hasFormChanges =
        formData.username !== (profile.username || "") ||
        formData.profileImg !== (profile.profileImg || "") ||
        formData.gender !== (profile.gender || "") ||
        formData.phoneNumber !== (profile.phoneNumber || "") ||
        formData.address.city !== (profile.address?.city || "") ||
        formData.address.state !== (profile.address?.state || "") ||
        formData.address.pincode !== (profile.address?.pincode || "");

      setHasChanges(hasFormChanges);
    }
  }, [formData, profile]);

  const handleInputChange = (field: string, value: string) => {
    // Validate phone number
    if (field === "phoneNumber") {
      // Only allow digits
      const digitsOnly = value.replace(/\D/g, "");
      // Limit to 10 digits
      const limitedValue = digitsOnly.slice(0, 10);

      if (limitedValue.length > 10) {
        setPhoneError("Phone number must be maximum 10 digits");
      } else if (limitedValue.length > 0 && limitedValue.length < 10) {
        setPhoneError("Phone number must be 10 digits");
      } else {
        setPhoneError("");
      }

      value = limitedValue;
    }

    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, unknown>),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone number before submit (only if provided)
    if (formData.phoneNumber && formData.phoneNumber.trim() !== "") {
      if (formData.phoneNumber.length !== 10) {
        setPhoneError("Phone number must be exactly 10 digits");
        toast.error("Please enter a valid 10-digit phone number");
        return;
      }
    }

    if (!hasChanges) {
      toast.info("No changes to save");
      return;
    }

    try {
      const updateData: {
        username?: string;
        profileImg?: string;
        gender?: "Male" | "Female" | "Other";
        phoneNumber?: string;
        address?: {
          city?: string;
          state?: string;
          pincode?: string;
        };
      } = {};

      if (formData.username !== (profile?.username || "")) {
        updateData.username = formData.username;
      }
      if (formData.profileImg !== (profile?.profileImg || "")) {
        updateData.profileImg = formData.profileImg;
      }
      if (formData.gender !== (profile?.gender || "")) {
        updateData.gender = formData.gender as "Male" | "Female" | "Other";
      }
      if (formData.phoneNumber !== (profile?.phoneNumber || "")) {
        updateData.phoneNumber = formData.phoneNumber;
      }
      if (
        formData.address.city !== (profile?.address?.city || "") ||
        formData.address.state !== (profile?.address?.state || "") ||
        formData.address.pincode !== (profile?.address?.pincode || "")
      ) {
        updateData.address = formData.address;
      }

      await updateProfile.mutateAsync(updateData);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error: unknown) {
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
          : "Failed to update profile";
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        username: profile.username || "",
        profileImg: profile.profileImg || "",
        gender: (profile.gender as "Male" | "Female" | "Other") || "",
        phoneNumber: profile.phoneNumber || "",
        address: {
          city: profile.address?.city || "",
          state: profile.address?.state || "",
          pincode: profile.address?.pincode || "",
        },
      });
    }
    setPhoneError("");
    setIsEditing(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await clientUpload.mutateAsync(formData);

      if (result.success && result.data) {
        const imageUrl = result.data.url;
        setFormData((prev) => ({ ...prev, profileImg: imageUrl }));

        // Automatically update profile with the new image URL
        try {
          await updateProfile.mutateAsync({
            profileImg: imageUrl,
          });
          toast.success("Profile image updated successfully!");
        } catch (updateError) {
          // Image uploaded but profile update failed
          toast.error("Image uploaded but failed to update profile");
        }
      } else {
        toast.error("Failed to upload image");
      }
    } catch (error: unknown) {
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
          : "Failed to upload image";
      toast.error(errorMessage);
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Show nothing during initial render to prevent hydration mismatch
  if (!isClient) {
    return null;
  }

  if (isMobile) {
    // Mobile view - simplified version
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
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage
                        src={formData.profileImg}
                        alt={formData.username}
                      />
                      <AvatarFallback className="text-2xl">
                        {formData.username?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={clientUpload.isPending}
                        >
                          {clientUpload.isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Camera className="h-3 w-3" />
                          )}
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </>
                    )}
                  </div>
                  <div>
                    <CardTitle>{formData.username || "User"}</CardTitle>
                    <CardDescription>{profile?.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) =>
                        handleInputChange("username", e.target.value)
                      }
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      maxLength={10}
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        handleInputChange("phoneNumber", e.target.value)
                      }
                      disabled={!isEditing}
                      placeholder="Enter 10-digit phone number"
                      aria-invalid={!!phoneError}
                    />
                    {phoneError && (
                      <p className="text-sm text-destructive">{phoneError}</p>
                    )}
                    {!phoneError && formData.phoneNumber && (
                      <p className="text-xs text-muted-foreground">
                        {formData.phoneNumber.length}/10 digits
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={formData.gender || undefined}
                      onValueChange={(value) =>
                        handleInputChange("gender", value)
                      }
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.address.city}
                      onChange={(e) =>
                        handleInputChange("address.city", e.target.value)
                      }
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.address.state}
                      onChange={(e) =>
                        handleInputChange("address.state", e.target.value)
                      }
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      value={formData.address.pincode}
                      onChange={(e) =>
                        handleInputChange("address.pincode", e.target.value)
                      }
                      disabled={!isEditing}
                    />
                  </div>

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
            breadcrumbs={[
              { label: "Dashboard", href: "/student/my-learning" },
              { label: "Profile" },
            ]}
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
              <Card className="sticky top-24">
                <CardHeader className="text-center pb-4">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <Avatar className="h-32 w-32 border-4 border-primary/20">
                        <AvatarImage
                          src={formData.profileImg}
                          alt={formData.username}
                        />
                        <AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                          {formData.username?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <>
                          <Button
                            size="icon"
                            variant="secondary"
                            className="absolute bottom-0 right-0 rounded-full h-10 w-10"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={clientUpload.isPending}
                          >
                            {clientUpload.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Camera className="h-4 w-4" />
                            )}
                          </Button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </>
                      )}
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-2xl">
                        {formData.username || "User"}
                      </CardTitle>
                      <CardDescription className="flex items-center justify-center gap-2">
                        <Mail className="h-4 w-4" />
                        {profile?.email}
                      </CardDescription>
                      {profile?.isVerified && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                          <span className="h-2 w-2 rounded-full bg-green-600 dark:bg-green-400" />
                          Verified Account
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    {formData.phoneNumber && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{formData.phoneNumber}</span>
                      </div>
                    )}
                    {(formData.address.city || formData.address.state) && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {[formData.address.city, formData.address.state]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </div>
                    )}
                    {formData.gender && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>{formData.gender}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
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
                    {/* Basic Information Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">
                        Basic Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            value={formData.username}
                            onChange={(e) =>
                              handleInputChange("username", e.target.value)
                            }
                            disabled={!isEditing}
                            placeholder="Enter your username"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            value={profile?.email || ""}
                            disabled
                            className="bg-muted"
                          />
                          <p className="text-xs text-muted-foreground">
                            Email cannot be changed
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phoneNumber">Phone Number</Label>
                          <Input
                            id="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={(e) =>
                              handleInputChange("phoneNumber", e.target.value)
                            }
                            disabled={!isEditing}
                            placeholder="Enter your phone number"
                            type="tel"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="gender">Gender</Label>
                          <Select
                            value={formData.gender}
                            onValueChange={(value) =>
                              handleInputChange("gender", value)
                            }
                            disabled={!isEditing}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Address Information Section */}
                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="text-lg font-semibold">
                        Address Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={formData.address.city}
                            onChange={(e) =>
                              handleInputChange("address.city", e.target.value)
                            }
                            disabled={!isEditing}
                            placeholder="Enter your city"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={formData.address.state}
                            onChange={(e) =>
                              handleInputChange("address.state", e.target.value)
                            }
                            disabled={!isEditing}
                            placeholder="Enter your state"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="pincode">Pincode</Label>
                          <Input
                            id="pincode"
                            value={formData.address.pincode}
                            onChange={(e) =>
                              handleInputChange(
                                "address.pincode",
                                e.target.value
                              )
                            }
                            disabled={!isEditing}
                            placeholder="Enter your pincode"
                            maxLength={6}
                          />
                        </div>
                      </div>
                    </div>

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
