"use client";

import { useParams, useRouter } from "next/navigation";
import { Suspense, lazy, useState } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  TestSeriesDetailHeader,
  TestSeriesStickyTabs,
} from "@/components/student/test-series-detail-header";
import { MobileTestSeriesHero } from "@/components/student/mobile-test-series-hero";
import {
  useClientTestSeriesDetail,
  useClientTestsInSeries,
  useClientEnrollFreeTestSeries,
  useClientVerifyPayment,
  useClientTestSeriesStats,
} from "@/hooks/test-series-client";
import { useTestSeriesRazorpayPayment } from "@/hooks/use-test-series-payment";
import {
  ErrorMessage,
  SuccessMessage,
} from "@/components/common/error-message";
import { toast } from "sonner";

// Lazy load tab content components
const TestSeriesDescriptionTab = lazy(() =>
  import("@/components/student/test-series-description-tab").then((mod) => ({
    default: mod.TestSeriesDescriptionTab,
  }))
);

const TestSeriesTestsTab = lazy(() =>
  import("@/components/student/test-series-tests-tab").then((mod) => ({
    default: mod.TestSeriesTestsTab,
  }))
);

// Razorpay types
interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: new (options: {
      key?: string;
      amount: number;
      currency: string;
      name: string;
      description: string;
      order_id: string;
      handler: (response: RazorpayResponse) => void | Promise<void>;
      prefill?: Record<string, string>;
      theme?: { color: string };
      modal?: { ondismiss: () => void };
    }) => { open: () => void };
  }
}

export default function StudentTestSeriesDetailPage() {
  const params = useParams();
  const router = useRouter();
  const identifier = params.id as string;
  const [activeTab, setActiveTab] = useState<"description" | "tests">(
    "description"
  );
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Data fetching
  const {
    data: testSeriesData,
    isLoading,
    refetch: refetchTestSeries,
  } = useClientTestSeriesDetail(identifier);

  const { data: testsData, isLoading: isLoadingTests } =
    useClientTestsInSeries(identifier);

  // Stats for social proof
  const { data: statsData } = useClientTestSeriesStats(identifier);

  // Mutations and hooks
  const enrollFreeMutation = useClientEnrollFreeTestSeries();
  const verifyPaymentMutation = useClientVerifyPayment();
  const { initializePayment, isLoading: isPaymentLoading } =
    useTestSeriesRazorpayPayment();

  const testSeries = testSeriesData?.data;
  const tests = testsData?.data || [];
  const isEnrolled = testSeries?.isEnrolled || false;
  const testCount = tests.length;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const finalPrice = testSeries?.finalPrice || testSeries?.totalPrice || 0;
  const savings = (testSeries?.totalPrice || 0) - (testSeries?.finalPrice || 0);
  const isHotDeal = (testSeries?.discountPercentage || 0) >= 30;

  const handleEnrollFree = async () => {
    if (!testSeries?.id) return;

    try {
      setIsProcessing(true);
      setErrorMessage(null);
      await enrollFreeMutation.mutateAsync(testSeries.id);
      setSuccessMessage("You have been enrolled in this test series.");
      setIsEnrollDialogOpen(false);
      refetchTestSeries();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to enroll. Please try again.";
      setErrorMessage(errorMessage);
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckout = async () => {
    if (!testSeries?.id || !testSeries?.title) return;

    setIsProcessing(true);
    setErrorMessage(null);

    initializePayment(
      testSeries.id,
      testSeries.title,
      finalPrice,
      async (razorpayResponse, orderId) => {
        try {
          console.log("Razorpay Response:", razorpayResponse);
          console.log("Order ID:", orderId);

          toast.loading("Verifying payment...");

          const verificationResult = await verifyPaymentMutation.mutateAsync({
            orderId: orderId,
            razorpayPaymentId: razorpayResponse.razorpay_payment_id,
            razorpayOrderId: razorpayResponse.razorpay_order_id,
            razorpaySignature: razorpayResponse.razorpay_signature,
          });

          toast.dismiss();

          console.log("Verification Result:", verificationResult);

          if (verificationResult.success) {
            toast.success("Payment successful! 🎉", {
              description: "You have been enrolled in this test series.",
            });
            setSuccessMessage(
              "Payment successful! You have been enrolled in this test series."
            );
            setIsEnrollDialogOpen(false);
            refetchTestSeries();
            setTimeout(() => setSuccessMessage(null), 5000);
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
          setErrorMessage(errorMessage);
          setTimeout(() => setErrorMessage(null), 5000);
        } finally {
          setIsProcessing(false);
        }
      },
      (error) => {
        console.error("Payment failed:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to initiate payment. Please try again.";
        toast.error("Payment failed", {
          description: errorMessage,
        });
        setErrorMessage(errorMessage);
        setTimeout(() => setErrorMessage(null), 5000);
        setIsProcessing(false);
      }
    );
  };

  const handleEnroll = () => {
    if (testSeries?.isFree) {
      handleEnrollFree();
    } else {
      handleCheckout();
    }
  };

  if (isLoading) {
    return <TestSeriesDetailSkeleton />;
  }

  if (!testSeries) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="text-6xl">😕</div>
          <h2 className="text-2xl font-bold">Test Series Not Found</h2>
          <p className="text-muted-foreground">
            The test series you&apos;re looking for doesn&apos;t exist or has
            been removed.
          </p>
          <Button onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Desktop Header - Scrollable */}
      <div className="hidden lg:block">
        <TestSeriesDetailHeader
          testSeries={testSeries}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onBack={() => router.back()}
          testCount={testCount}
        />
      </div>

      {/* Sticky Tabs - Desktop */}
      <div className="hidden lg:block sticky top-0 z-[60]">
        <TestSeriesStickyTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          testCount={testCount}
        />
      </div>

      {/* Mobile Hero - Sticky on Scroll */}
      <div className="lg:hidden sticky top-0 z-[60]">
        <MobileTestSeriesHero
          testSeries={testSeries}
          testCount={testCount}
          isHotDeal={isHotDeal}
          onBack={() => router.back()}
        />
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <SuccessMessage
          message={successMessage}
          onDismiss={() => setSuccessMessage(null)}
        />
      )}
      {errorMessage && (
        <ErrorMessage
          error={errorMessage}
          onDismiss={() => setErrorMessage(null)}
        />
      )}

      {/* Main Content */}
      <div className="p-2.5 lg:px-10 lg:py-8">
        <div className="container max-w-7xl mx-auto relative">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }
          >
            {activeTab === "description" ? (
              <TestSeriesDescriptionTab
                testSeries={testSeries}
                testCount={testCount}
                tests={tests}
                finalPrice={finalPrice}
                savings={savings}
                isHotDeal={isHotDeal}
                isEnrolled={isEnrolled}
                onEnroll={() => setIsEnrollDialogOpen(true)}
                isProcessing={isProcessing}
                enrollmentCount={statsData?.data?.enrollmentCount}
                averageScore={statsData?.data?.averageScore}
                totalAttempts={statsData?.data?.totalAttempts}
              />
            ) : (
              <TestSeriesTestsTab
                tests={tests}
                isEnrolled={isEnrolled}
                isLoading={isLoadingTests}
              />
            )}
          </Suspense>
        </div>
      </div>

      {/* Sticky Bottom CTA (Mobile) */}
      {!isEnrolled && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-t shadow-lg pb-safe">
          <div className="container max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs text-muted-foreground">Total Price</div>
                <div className="font-bold text-lg sm:text-xl text-primary">
                  {testSeries.isFree ? "Free" : formatPrice(finalPrice)}
                </div>
                {testCount === 0 && (
                  <div className="text-xs text-amber-600 dark:text-amber-400">
                    Tests coming soon
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() => setActiveTab("description")}
                >
                  View Details
                </Button>
                <Button
                  size="sm"
                  className="shrink-0"
                  onClick={() => setIsEnrollDialogOpen(true)}
                  disabled={isProcessing || isPaymentLoading || testCount === 0}
                >
                  {isProcessing
                    ? "Processing..."
                    : testCount === 0
                    ? "Coming Soon"
                    : testSeries.isFree
                    ? "Enroll Free"
                    : "Enroll Now"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enrollment Dialog */}
      <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll in Test Series</DialogTitle>
            <DialogDescription>
              {testCount === 0
                ? "This test series is being prepared. You'll be notified when tests are available."
                : testSeries.isFree
                ? "Are you sure you want to enroll in this free test series?"
                : `You will be redirected to payment. Amount: ${formatPrice(
                    finalPrice
                  )}`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEnrollDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEnroll}
              disabled={isProcessing || isPaymentLoading || testCount === 0}
            >
              {isProcessing
                ? "Processing..."
                : testCount === 0
                ? "Get Notified"
                : testSeries.isFree
                ? "Enroll"
                : "Proceed to Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Skeleton Loading Component
function TestSeriesDetailSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Hero Skeleton */}
      <div className="bg-linear-to-br from-blue-600 via-purple-600 to-pink-600">
        <div className="container max-w-7xl mx-auto px-4 py-8 sm:py-12">
          <Skeleton className="h-10 w-32 mb-4 bg-white/20" />
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="aspect-video rounded-2xl bg-white/20" />
              <div className="space-y-3">
                <Skeleton className="h-8 w-48 bg-white/20" />
                <Skeleton className="h-10 w-full bg-white/20" />
                <Skeleton className="h-6 w-64 bg-white/20" />
              </div>
            </div>
            <div className="hidden lg:block">
              <Skeleton className="h-96 rounded-xl bg-white/20" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
