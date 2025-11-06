"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  BookOpen,
  Crown,
  Gift,
  ArrowRight,
  Users,
  Clock,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useBatchRazorpayPayment } from "@/hooks/use-batch-payment";
import { useTestSeriesRazorpayPayment } from "@/hooks/use-test-series-payment";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export type CourseType = "batch" | "test-series";

interface BaseCourseCardProps {
  id: string;
  title: string;
  exam: string;
  totalPrice: number;
  discountPercentage: number;
  type: CourseType;
  imageUrl?: string;
  teachers?: Array<{ id: string; name: string; imageUrl?: string }>;
  features?: string[];
  isCombo?: boolean;
  planType?: string;
  index?: number;
  // Batch specific
  class?: "11" | "12" | "12+" | "Grad";
  startDate?: Date | string;
  endDate?: Date | string;
  language?: string;
  // Test series specific
  isFree?: boolean;
  durationDays?: number;
}

export function ExploreCourseCard({
  id,
  title,
  exam,
  totalPrice,
  discountPercentage,
  type,
  imageUrl,
  teachers = [],
  features = ["Live Classes", "DPPs & more"],
  isCombo = false,
  planType,
  index = 0,
  class: className,
  startDate,
  endDate,
  language,
  isFree = false,
  durationDays,
}: BaseCourseCardProps) {
  const router = useRouter();
  const {
    initializePayment: initializeBatchPayment,
    isLoading: isBatchLoading,
  } = useBatchRazorpayPayment();
  const {
    initializePayment: initializeTestSeriesPayment,
    isLoading: isTestSeriesLoading,
  } = useTestSeriesRazorpayPayment();

  const finalPrice =
    type === "test-series" && isFree
      ? 0
      : Math.round(totalPrice * (1 - discountPercentage / 100));
  const savings = totalPrice - finalPrice;

  const isProcessing =
    (type === "batch" && isBatchLoading) ||
    (type === "test-series" && isTestSeriesLoading);

  const formatShortDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  };

  const getBatchStatus = () => {
    if (type !== "batch" || !startDate || !endDate) return null;

    const now = new Date();
    const start =
      typeof startDate === "string" ? new Date(startDate) : startDate;
    const end = typeof endDate === "string" ? new Date(endDate) : endDate;

    if (now < start)
      return {
        label: "Upcoming",
        color: "bg-blue-500",
        text: `Starting ${formatShortDate(startDate)}`,
      };
    if (now > end)
      return {
        label: "Ended",
        color: "bg-gray-500",
        text: `Ended on ${formatShortDate(endDate)}`,
      };
    return {
      label: "Ongoing",
      color: "bg-red-500",
      text: `Started on ${formatShortDate(startDate)}`,
    };
  };

  const status = getBatchStatus();

  // Generate gradient colors based on exam/name
  const gradientColors = [
    "from-yellow-400 via-yellow-300 to-yellow-200",
    "from-blue-400 via-blue-300 to-blue-200",
    "from-purple-400 via-purple-300 to-purple-200",
    "from-pink-400 via-pink-300 to-pink-200",
  ];
  const gradientIndex = index % gradientColors.length;
  const gradientClass = gradientColors[gradientIndex];

  // Extract course name for header - use exam name or first meaningful word
  const courseHeaderName = exam || title.split(" ")[0] || "COURSE";

  // Display teachers if provided (max 6)
  const displayTeachers = teachers.slice(0, 6);

  // Determine detail URL and button text
  const detailUrl =
    type === "batch" ? `/student/batches/${id}` : `/student/test-series/${id}`;
  const buttonText =
    type === "test-series" && isFree ? "Enroll Free" : "Buy Now";

  // Handle payment for batch and test series
  const handlePayment = () => {
    if (type === "batch") {
      toast.loading("Initializing payment...");
      initializeBatchPayment(
        id,
        title,
        finalPrice,
        async (verificationResult) => {
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
          const errorMessage =
            (error && typeof error === "object" && "response" in error
              ? (error.response as { data?: { message?: string } })?.data
                  ?.message
              : null) ||
            (error instanceof Error ? error.message : null) ||
            "Payment failed. Please try again or contact support.";
          toast.error("Payment failed", {
            description: errorMessage,
            duration: 5000,
          });
        }
      );
    } else if (type === "test-series") {
      if (isFree) {
        // For free test series, navigate to detail page to enroll
        router.push(detailUrl);
      } else {
        toast.loading("Initializing payment...");
        initializeTestSeriesPayment(
          id,
          title,
          finalPrice,
          async (verificationResult) => {
            toast.dismiss();
            toast.success("Payment successful! 🎉", {
              description: "Redirecting to your test series...",
            });
            setTimeout(() => {
              router.push(`/student/my-learning`);
            }, 1000);
          },
          (error) => {
            toast.dismiss();
            console.error("Payment failed:", error);
            const errorMessage =
              (error && typeof error === "object" && "response" in error
                ? (error.response as { data?: { message?: string } })?.data
                    ?.message
                : null) ||
              (error instanceof Error ? error.message : null) ||
              "Payment failed. Please try again or contact support.";
            toast.error("Payment failed", {
              description: errorMessage,
              duration: 5000,
            });
          }
        );
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="h-full"
    >
      <Card className="p-0 group h-full flex flex-col overflow-hidden border-2 hover:border-primary/50 hover:shadow-2xl transition-all duration-300 gap-0 rounded-xl">
        {/* Gradient Header Section */}
        <div
          className={cn(
            "relative h-40 sm:h-44 md:h-48 lg:h-52 overflow-hidden",
            imageUrl ? "" : `bg-linear-to-br ${gradientClass}`
          )}
        >
          {/* Background Image if available */}
          {imageUrl && (
            <>
              <div className="absolute inset-0 z-0 h-full w-full">
                <Image
                  src={imageUrl}
                  alt={title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="h-full! w-full! object-cover"
                  priority={index < 3}
                />
              </div>
              <div className="absolute inset-0 bg-linear-to-br from-black/20 to-transparent z-1" />
            </>
          )}

          {/* Top Banner */}
          <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 right-1.5 sm:right-2 flex items-start justify-between z-10">
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-medium text-white shadow-sm">
              {isCombo ? (
                <>
                  <Gift className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />
                  <span className="hidden sm:inline">
                    Combo Pack: Includes multiple courses
                  </span>
                  <span className="sm:hidden">Combo Pack</span>
                </>
              ) : planType ? (
                <>
                  <Crown className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />
                  <span className="hidden sm:inline">
                    Multiple plans inside: {planType}
                  </span>
                  <span className="sm:hidden">Plans: {planType}</span>
                </>
              ) : (
                <>
                  <Crown className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />
                  <span className="hidden sm:inline">Premium Course</span>
                  <span className="sm:hidden">Premium</span>
                </>
              )}
            </div>

            {/* Status Badge */}
            {status && (
              <Badge
                className={cn(
                  "text-white border-0 shadow-lg backdrop-blur-sm text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1",
                  status.color
                )}
              >
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white mr-1 sm:mr-1.5 animate-pulse" />
                {status.label}
              </Badge>
            )}
            {type === "test-series" && isFree && !status && (
              <Badge className="bg-emerald-500 text-white border-0 shadow-lg backdrop-blur-sm text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1">
                Free
              </Badge>
            )}
          </div>

          {/* Instructor Avatars Row */}
          {displayTeachers.length > 0 && (
            <div className="absolute bottom-7 sm:bottom-8 left-0 right-0 px-2 sm:px-3">
              <div className="flex items-center gap-1 sm:gap-1.5">
                {displayTeachers.map((teacher) => (
                  <Avatar
                    key={teacher.id}
                    className="h-7 w-7 sm:h-8 sm:w-8 border-2 border-white shadow-md shrink-0"
                  >
                    <AvatarImage src={teacher.imageUrl} alt={teacher.name} />
                    <AvatarFallback className="text-[10px] sm:text-xs bg-white/90 text-gray-700">
                      {teacher.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </div>
          )}

          {/* Feature Overlay Banner */}
          <div className="absolute bottom-0 left-0 right-0 bg-gray-800/90 backdrop-blur-sm px-2 sm:px-3 py-1.5 rounded-b-xl">
            <div className="flex items-center gap-1.5 sm:gap-2 text-white text-[11px] sm:text-xs font-medium">
              <Users className="h-3 w-3 shrink-0" />
              <span className="truncate">{features.join(", ")}</span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <CardContent className="flex-1 flex flex-col p-3 sm:p-5 space-y-3 sm:space-y-4 bg-white">
          {/* Category & Title Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Badge
                variant="secondary"
                className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 shrink-0 text-[11px] sm:text-xs font-semibold px-2 py-0.5"
              >
                {type === "batch" && className
                  ? `Class ${className} ${exam}`
                  : exam}
              </Badge>
              {language && (
                <Badge
                  variant="outline"
                  className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 text-[11px] sm:text-xs px-2 py-0.5"
                >
                  {language.toUpperCase()}
                </Badge>
              )}
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className="font-bold text-base sm:text-xl leading-snug line-clamp-2 group-hover:text-primary transition-colors cursor-default">
                    {title}
                  </h3>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p>{title}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Exam & Status Info */}
          <div className="space-y-1.5 sm:space-y-2">
            {type === "batch" ? (
              <>
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                  <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary/60 shrink-0" />
                  <span className="font-medium">{exam} 2027</span>
                </div>
                {status && (
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-red-600 dark:text-red-400">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                    <span className="font-medium leading-tight">
                      {status.label} | {status.text}
                    </span>
                  </div>
                )}
              </>
            ) : (
              durationDays && (
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary/60 shrink-0" />
                  <span>Valid for {durationDays} days</span>
                </div>
              )
            )}
          </div>

          {/* Pricing Section */}
          <div className="pt-2 sm:pt-3 mt-auto border-t space-y-2.5 sm:space-y-3">
            <div className="flex flex-col gap-1">
              {type === "test-series" && isFree ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-600">
                    Free
                  </span>
                </div>
              ) : (
                <>
                  {discountPercentage > 0 && (
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm text-muted-foreground line-through">
                        ₹{totalPrice.toLocaleString("en-IN")}
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-[10px] sm:text-xs bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-semibold px-1.5 py-0.5"
                      >
                        Save ₹{savings.toLocaleString("en-IN")}
                      </Badge>
                      <Badge className="bg-green-500 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5">
                        {discountPercentage}% OFF
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                      ₹{finalPrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                className="flex-1 h-10 sm:h-9 font-semibold text-sm bg-black hover:bg-gray-800 text-white min-h-[44px] sm:min-h-0"
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  buttonText
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-10 sm:h-9 w-10 sm:w-9 p-0 min-w-[44px] sm:min-w-[36px] shrink-0"
                asChild
              >
                <Link href={detailUrl}>
                  <ArrowRight className="h-4 w-4 sm:h-4 sm:w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
