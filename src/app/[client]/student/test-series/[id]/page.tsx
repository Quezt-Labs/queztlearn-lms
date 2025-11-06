"use client";

import { useParams, useRouter } from "next/navigation";
import { Suspense, lazy, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  useClientTestSeriesStats,
} from "@/hooks/test-series-client";
import { useTestSeriesRazorpayPayment } from "@/hooks/use-test-series-payment";
import {
  ErrorMessage,
  SuccessMessage,
} from "@/components/common/error-message";
import { toast } from "sonner";
import { DescriptionPageShimmer } from "@/components/common/description-page-shimmer";

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

  // Check if test series is free (either isFree flag or finalPrice is 0)
  const isFree = testSeries?.isFree || finalPrice === 0;

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

    // Prevent checkout for free test series
    if (isFree) {
      handleEnrollFree();
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    toast.loading("Initializing payment...");

    initializePayment(
      testSeries.id,
      testSeries.title,
      finalPrice,
      async (verificationResult) => {
        console.log("Verification Result:", verificationResult);
        toast.dismiss();
        toast.success("Payment successful! 🎉", {
          description: "You have been enrolled in this test series.",
        });
        setSuccessMessage(
          "Payment successful! You have been enrolled in this test series."
        );
        setIsEnrollDialogOpen(false);
        refetchTestSeries();
        setTimeout(() => setSuccessMessage(null), 5000);
        setIsProcessing(false);
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
        setErrorMessage(errorMessage);
        setTimeout(() => setErrorMessage(null), 5000);
        setIsProcessing(false);
      }
    );
  };

  const handleEnroll = () => {
    // Always use free enrollment endpoint for free test series
    if (isFree) {
      handleEnrollFree();
    } else {
      handleCheckout();
    }
  };

  const handleEnrollClick = () => {
    // For free test series, enroll directly without showing dialog
    if (isFree) {
      handleEnrollFree();
    } else {
      // For paid test series, show the payment dialog
      setIsEnrollDialogOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="p-2.5 lg:px-10 lg:py-8">
        <DescriptionPageShimmer />
      </div>
    );
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

  console.log(testSeries, "testSeries");

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
      <div className="hidden lg:block sticky top-0 z-60">
        <TestSeriesStickyTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          testCount={testCount}
        />
      </div>

      {/* Mobile Hero - Sticky on Scroll */}
      <div className="lg:hidden z-60">
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

      {/* Main Content - Optimized spacing for mobile */}
      <div className="px-3 py-4 lg:px-10 lg:py-8">
        <div className="container max-w-7xl mx-auto relative">
          <Suspense fallback={<DescriptionPageShimmer />}>
            {activeTab === "description" ? (
              <TestSeriesDescriptionTab
                testSeries={testSeries}
                testCount={testCount}
                tests={tests}
                finalPrice={finalPrice}
                savings={savings}
                isHotDeal={isHotDeal}
                isEnrolled={isEnrolled}
                onEnroll={handleEnrollClick}
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

      {/* Sticky Bottom CTA (Mobile) - Optimized for thumb reach */}
      {!isEnrolled && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-t shadow-2xl safe-area-bottom">
          <div className="container max-w-7xl mx-auto px-3 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="shrink-0">
                <div className="text-xs text-muted-foreground">Total Price</div>
                <div className="font-bold text-lg sm:text-xl text-primary">
                  {isFree ? "Free" : formatPrice(finalPrice)}
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
                  size="default"
                  className="shrink-0 h-11 px-4"
                  onClick={() => setActiveTab("description")}
                >
                  Details
                </Button>
                <Button
                  size="default"
                  className="shrink-0 h-11 px-6 font-semibold shadow-md"
                  onClick={handleEnrollClick}
                  disabled={isProcessing || isPaymentLoading || testCount === 0}
                >
                  {isProcessing
                    ? "Processing..."
                    : testCount === 0
                    ? "Coming Soon"
                    : isFree
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
                : isFree
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
                : isFree
                ? "Enroll Free"
                : "Proceed to Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
