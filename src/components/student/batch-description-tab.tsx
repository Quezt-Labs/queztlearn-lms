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
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useBatchRazorpayPayment } from "@/hooks/use-batch-payment";
import { useVerifyBatchPayment } from "@/hooks/api";
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
  const { initializePayment, isLoading } = useBatchRazorpayPayment();
  const { mutateAsync: verifyPayment } = useVerifyBatchPayment();
  const startDate = new Date(batch.startDate);
  const endDate = new Date(batch.endDate);

  const handleEnrollClick = async () => {
    if (batch.isPurchased) {
      router.push(`/student/my-learning`);
      return;
    }

    initializePayment(
      batch.id,
      batch.name,
      finalPrice,
      async (razorpayResponse, orderId) => {
        try {
          console.log("Razorpay Response:", razorpayResponse);
          console.log("Order ID:", orderId);

          toast.loading("Verifying payment...");

          const verificationResult = await verifyPayment({
            orderId: orderId,
            razorpayPaymentId: razorpayResponse.razorpay_payment_id,
            razorpayOrderId: razorpayResponse.razorpay_order_id,
            razorpaySignature: razorpayResponse.razorpay_signature,
          });

          toast.dismiss();

          console.log("Verification Result:", verificationResult);

          if (verificationResult.success) {
            toast.success("Payment successful! 🎉", {
              description: "Redirecting to your learning dashboard...",
            });
            setTimeout(() => {
              router.push(`/student/my-learning`);
            }, 1000);
          } else {
            throw new Error(
              verificationResult.message || "Payment verification failed"
            );
          }
        } catch (error: unknown) {
          toast.dismiss();
          console.error("Payment verification failed:", error);

          // Show more detailed error message
          const errorMessage =
            (error && typeof error === "object" && "response" in error
              ? (error.response as { data?: { message?: string } })?.data
                  ?.message
              : null) ||
            (error instanceof Error ? error.message : null) ||
            "Payment verification failed";

          toast.error("Payment verification failed", {
            description: `${errorMessage}. Payment ID: ${razorpayResponse.razorpay_payment_id}`,
            duration: 10000, // Show for 10 seconds
          });
        }
      },
      (error) => {
        console.error("Payment failed:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Please try again or contact support.";
        toast.error("Payment failed", {
          description: errorMessage,
        });
      }
    );
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
      {/* Left: Description & Features */}
      <div className="lg:col-span-2 space-y-6">
        {/* Description */}
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
                <div
                  className="prose prose-sm sm:prose-base dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: batch.description }}
                />
              ) : (
                <p className="text-muted-foreground">
                  No description available for this batch.
                </p>
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

      {/* Right: Price Card & Info */}
      <div className="lg:col-span-1 space-y-4">
        {/* Price Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-xl border-2">
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
                  {batch.discountPercentage > 0 && (
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
                  ) : batch.isPurchased ? (
                    <>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Go to My Learning
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
