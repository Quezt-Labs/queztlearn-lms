"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Users,
  TrendingUp,
  CheckCircle2,
  Award,
  Sparkles,
  GraduationCap,
  Calendar,
  Globe,
  Tag,
  Loader2,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AtAGlanceCard } from "@/components/common/at-a-glance-card";
import { CollapsibleDescription } from "@/components/common/collapsible-description";
import { MobilePricingCard } from "@/components/common/mobile-pricing-card";
import { useBatchRazorpayPayment } from "@/hooks/use-batch-payment";
import { useEnrollFreeBatch } from "@/hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface BatchDescriptionTabProps {
  batch: {
    id: string;
    description?: string | null;
    imageUrl?: string;
    totalPrice: number;
    discountPercentage: number;
    name: string;
    language: string;
    class: "11" | "12" | "12+" | "Grad";
    exam: string;
    startDate: Date | string;
    endDate: Date | string;
    isPurchased?: boolean;
  };
  finalPrice: number;
  savings: number;
  isHotDeal: boolean;
}

export function BatchDescriptionTab({
  batch,
  finalPrice,
  savings,
  isHotDeal,
}: BatchDescriptionTabProps) {
  const router = useRouter();
  const { initializePayment, isLoading: isPaymentLoading } =
    useBatchRazorpayPayment();
  const enrollFreeMutation = useEnrollFreeBatch();
  const startDate = new Date(batch.startDate);
  const endDate = new Date(batch.endDate);

  // Check if batch is free (finalPrice is 0)
  const isFree = finalPrice === 0;
  const isLoading = isPaymentLoading || enrollFreeMutation.isPending;

  const handleEnrollFree = async () => {
    if (!batch.id) return;

    toast.loading("Enrolling in batch...");

    enrollFreeMutation.mutate(batch.id, {
      onSuccess: () => {
        toast.dismiss();
        toast.success("Enrolled successfully! 🎉", {
          description: "Redirecting to your learning dashboard...",
        });
        setTimeout(() => {
          router.push(`/student/my-learning`);
        }, 1000);
      },
      onError: (error) => {
        toast.dismiss();
        console.error("Enrollment failed:", error);

        const errorMessage =
          (error && typeof error === "object" && "response" in error
            ? (error.response as { data?: { message?: string } })?.data?.message
            : null) ||
          (error instanceof Error ? error.message : null) ||
          "Enrollment failed. Please try again.";

        toast.error("Enrollment failed", {
          description: errorMessage,
          duration: 5000,
        });
      },
    });
  };

  const handleEnrollClick = async () => {
    if (batch.isPurchased) {
      router.push(`/student/my-learning`);
      return;
    }

    // For free batches, enroll directly
    if (isFree) {
      handleEnrollFree();
      return;
    }

    // For paid batches, initiate payment
    toast.loading("Initializing payment...");

    initializePayment(
      batch.id,
      batch.name,
      finalPrice,
      async (verificationResult) => {
        console.log("Verification Result:", verificationResult);
        toast.dismiss();
        toast.success("Payment successful! 🎉", {
          description: "Redirecting to your learning dashboard...",
        });
        setTimeout(() => {
          router.push(`/student/my-learning`);
        }, 1000);
      },
      (error) => {
        toast.dismiss();
        console.error("Payment failed:", error);

        // Show more detailed error message
        const errorMessage =
          (error && typeof error === "object" && "response" in error
            ? (error.response as { data?: { message?: string } })?.data?.message
            : null) ||
          (error instanceof Error ? error.message : null) ||
          "Payment failed. Please try again or contact support.";

        toast.error("Payment failed", {
          description: errorMessage,
          duration: 5000, // Show for 5 seconds
        });
      }
    );
  };

  // Calculate batch duration in days
  const durationDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Prepare At-a-Glance items for batch
  const atAGlanceItems = [
    {
      icon: Calendar,
      label: "Start Date",
      value: startDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      }),
      highlight: true,
    },
    {
      icon: Clock,
      label: "Duration",
      value: `${durationDays} Days`,
    },
    {
      icon: Globe,
      label: "Language",
      value: batch.language,
    },
    {
      icon: GraduationCap,
      label: "Class",
      value: `Class ${batch.class}`,
    },
  ];

  return (
    <div className="space-y-4 lg:space-y-0">
      {/* MOBILE-FIRST LAYOUT */}

      {/* 1. At-a-Glance Card (Mobile Only) */}
      <AtAGlanceCard items={atAGlanceItems} title="Batch Details" />

      {/* 2. Mobile Pricing Card (Mobile Only) - Hide if purchased */}
      {!batch.isPurchased && (
        <MobilePricingCard
          originalPrice={batch.totalPrice}
          finalPrice={finalPrice}
          savings={savings}
          discountPercentage={batch.discountPercentage}
          isEnrolled={batch.isPurchased}
          isProcessing={isLoading}
          onEnrollClick={handleEnrollClick}
          ctaText="Enroll Now"
          enrolledText="You're enrolled in this batch"
        />
      )}

      {/* 3. Desktop Grid Layout */}
      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left: Description & Features */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description with Collapsible */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  About This Batch
                </CardTitle>
              </CardHeader>
              <CardContent>
                {batch.description ? (
                  <CollapsibleDescription
                    html={batch.description}
                    maxHeight={180}
                  />
                ) : (
                  <CollapsibleDescription
                    plainText="No description available for this batch."
                    maxHeight={100}
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Key Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Key Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      icon: Users,
                      title: "Expert Faculty",
                      description: "Learn from experienced teachers",
                    },
                    {
                      icon: BookOpen,
                      title: "Comprehensive Content",
                      description: "Complete syllabus coverage",
                    },
                    {
                      icon: TrendingUp,
                      title: "Progress Tracking",
                      description: "Monitor your performance",
                    },
                    {
                      icon: CheckCircle2,
                      title: "Practice Tests",
                      description: "Regular assessments & tests",
                    },
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="shrink-0 mt-0.5">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm sm:text-base">
                          {feature.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right: Price Card & Info (Desktop Only) */}
        <div className="lg:col-span-1 space-y-4 hidden lg:block">
          {/* Price Card - Hide if purchased */}
          {!batch.isPurchased && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="shadow-xl border-2" data-slot="card">
                <CardContent className="p-6 space-y-6">
                  {/* Thumbnail Image */}
                  <div className="relative aspect-video rounded-xl overflow-hidden border-2">
                    {batch.imageUrl ? (
                      <img
                        src={batch.imageUrl}
                        alt={batch.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-linear-to-br from-blue-500/10 to-purple-500/10">
                        <GraduationCap className="h-16 w-16 text-muted-foreground/30" />
                      </div>
                    )}

                    {/* Badges on Image */}
                    <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-2">
                      {isHotDeal && (
                        <Badge className="bg-linear-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg text-xs">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Hot Deal
                        </Badge>
                      )}
                      {batch.discountPercentage > 0 && !batch.isPurchased && (
                        <Badge className="bg-red-500 text-white border-0 shadow-lg text-xs ml-auto">
                          {batch.discountPercentage}% OFF
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-3">
                    {batch.discountPercentage > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground line-through">
                          ₹{batch.totalPrice.toLocaleString("en-IN")}
                        </span>
                        <Badge
                          variant="secondary"
                          className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                        >
                          Save ₹{savings.toLocaleString("en-IN")}
                        </Badge>
                      </div>
                    )}
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-bold text-primary">
                        ₹{finalPrice.toLocaleString("en-IN")}
                      </span>
                      <span className="text-sm text-muted-foreground">total</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleEnrollClick}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : isFree ? (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Enroll for Free
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Enroll Now
                        </>
                      )}
                    </Button>
                  </div>

                  <Separator />

                  {/* Quick Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>Full access to all content</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>Lifetime access</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>Certificate of completion</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Batch Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Batch Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <InfoItem
                    icon={Calendar}
                    label="Start Date"
                    value={startDate.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  />
                  <InfoItem
                    icon={Calendar}
                    label="End Date"
                    value={endDate.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  />
                  <InfoItem
                    icon={Globe}
                    label="Language"
                    value={batch.language}
                  />
                  <InfoItem
                    icon={GraduationCap}
                    label="Class"
                    value={batch.class}
                  />
                  <InfoItem icon={Tag} label="Exam" value={batch.exam} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Info Item Component
function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium truncate">{value}</div>
      </div>
    </div>
  );
}
