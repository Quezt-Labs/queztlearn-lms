"use client";

import { Suspense, useState, lazy, useEffect } from "react";
import { BookOpen, FileText } from "lucide-react";
import { StudentHeader } from "@/components/student/student-header";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { useGetExploreBatches, useGetExploreTestSeries } from "@/hooks";
import { ExploreCardsGridShimmer } from "@/components/common/explore-card-shimmer";
import { LottieAnimation } from "@/components/common/lottie-animation";
import { LOTTIE_ANIMATIONS } from "@/lib/constants/lottie-animations";

// Dynamic imports for code splitting
const ExploreBatchCard = lazy(() =>
  import("@/components/student/explore-batch-card").then((mod) => ({
    default: mod.ExploreBatchCard,
  }))
);

const ExploreTestSeriesCard = lazy(() =>
  import("@/components/student/explore-test-series-card").then((mod) => ({
    default: mod.ExploreTestSeriesCard,
  }))
);

interface Batch {
  id: string;
  name: string;
  description?: string | null;
  class: "11" | "12" | "12+" | "Grad";
  exam: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  language: string;
  totalPrice: number;
  discountPercentage: number;
}

interface TestSeries {
  id: string;
  exam: string;
  title: string;
  slug: string;
  imageUrl?: string;
  totalPrice: number;
  discountPercentage?: number;
  isFree?: boolean;
  durationDays?: number;
}

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<"batches" | "test-series">(
    "batches"
  );

  const {
    data: batchesResponse,
    isLoading: isBatchesLoading,
    isFetched: isBatchesFetched,
  } = useGetExploreBatches();
  const batches: Batch[] = batchesResponse?.data || [];

  const {
    data: testSeriesResponse,
    isLoading: isTestSeriesLoading,
    isFetched: isTestSeriesFetched,
  } = useGetExploreTestSeries();
  const testSeries: TestSeries[] = testSeriesResponse?.data || [];

  // Check if tabs should be shown (only after data is fetched)
  const hasBatches = isBatchesFetched && batches.length > 0;
  const hasTestSeries = isTestSeriesFetched && testSeries.length > 0;

  // Auto-switch to available tab if current tab has no data
  useEffect(() => {
    if (isBatchesFetched && isTestSeriesFetched) {
      if (activeTab === "batches" && !hasBatches && hasTestSeries) {
        setActiveTab("test-series");
      } else if (activeTab === "test-series" && !hasTestSeries && hasBatches) {
        setActiveTab("batches");
      }
    }
  }, [
    isBatchesFetched,
    isTestSeriesFetched,
    hasBatches,
    hasTestSeries,
    activeTab,
  ]);

  // Don't show tabs section if no data is available
  const showTabs = hasBatches || hasTestSeries;

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden min-h-screen bg-background pb-20">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/40">
          <div className="flex items-center justify-between px-4 h-14">
            <h1 className="text-xl font-bold text-foreground">Explore</h1>
            {/* <Search className="h-5 w-5 text-muted-foreground" /> */}
          </div>
        </header>

        {/* Mobile Tabs */}
        {showTabs && (
          <div className="sticky top-14 z-30 bg-background border-b border-border/40">
            <div className="flex">
              {hasBatches && (
                <button
                  onClick={() => setActiveTab("batches")}
                  className={`flex-1 flex items-center justify-center gap-2 h-12 font-medium text-sm transition-colors ${
                    activeTab === "batches"
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <BookOpen className="h-4 w-4" />
                  Batches
                </button>
              )}
              {hasTestSeries && (
                <button
                  onClick={() => setActiveTab("test-series")}
                  className={`flex-1 flex items-center justify-center gap-2 h-12 font-medium text-sm transition-colors ${
                    activeTab === "test-series"
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  Test Series
                </button>
              )}
            </div>
          </div>
        )}

        {/* Mobile Content */}
        <div className="px-4 py-6 space-y-4">
          {activeTab === "batches" ? (
            <>
              {isBatchesLoading && !isBatchesFetched ? (
                <ExploreCardsGridShimmer count={3} />
              ) : batches.length === 0 ? (
                <div className="text-center py-12">
                  {LOTTIE_ANIMATIONS.emptyState ? (
                    <div className="w-56 h-56 mx-auto mb-6">
                      <LottieAnimation
                        animationUrl={LOTTIE_ANIMATIONS.emptyState}
                        loop={true}
                        autoplay={true}
                        fallbackIcon={
                          <BookOpen className="h-20 w-20 text-muted-foreground/50" />
                        }
                      />
                    </div>
                  ) : (
                    <BookOpen className="h-20 w-20 mx-auto text-muted-foreground/50 mb-6" />
                  )}
                  <h3 className="text-lg font-semibold mb-2 text-foreground">
                    No batches available
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Check back later for new courses
                  </p>
                </div>
              ) : (
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center py-8">
                      <ExploreCardsGridShimmer count={3} />
                    </div>
                  }
                >
                  {batches.map((batch, index) => (
                    <ExploreBatchCard key={batch.id} {...batch} index={index} />
                  ))}
                </Suspense>
              )}
            </>
          ) : (
            <>
              {isTestSeriesLoading && !isTestSeriesFetched ? (
                <ExploreCardsGridShimmer count={3} />
              ) : testSeries.length === 0 ? (
                <div className="text-center py-12">
                  {LOTTIE_ANIMATIONS.emptyState ? (
                    <div className="w-56 h-56 mx-auto mb-6">
                      <LottieAnimation
                        animationUrl={LOTTIE_ANIMATIONS.emptyState}
                        loop={true}
                        autoplay={true}
                        fallbackIcon={
                          <FileText className="h-20 w-20 text-muted-foreground/50" />
                        }
                      />
                    </div>
                  ) : (
                    <FileText className="h-20 w-20 mx-auto text-muted-foreground/50 mb-6" />
                  )}
                  <h3 className="text-lg font-semibold mb-2 text-foreground">
                    No test series available
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Check back later for new test series
                  </p>
                </div>
              ) : (
                <Suspense fallback={<ExploreCardsGridShimmer count={3} />}>
                  {testSeries.map((series, index) => (
                    <ExploreTestSeriesCard
                      key={series.id}
                      {...series}
                      index={index}
                    />
                  ))}
                </Suspense>
              )}
            </>
          )}
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block w-full min-h-[calc(100vh-4rem)] bg-linear-to-br from-background via-background to-muted/20">
        <StudentHeader />

        <div className="container mx-auto px-2 md:px-4 py-4 md:py-6 space-y-6 md:space-y-8 max-w-7xl w-full">
          <PageHeader
            title="Explore Courses"
            description="Find the perfect batch or test series to accelerate your learning"
          />

          {/* Filters & Search */}
          {showTabs && (
            <div className="flex flex-col sm:flex-row gap-4">
              {/* <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search batches and test series..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                />
              </div> */}
              <div className="flex gap-2">
                {hasBatches && (
                  <Button
                    variant={activeTab === "batches" ? "default" : "outline"}
                    onClick={() => setActiveTab("batches")}
                    className="gap-2"
                  >
                    <BookOpen className="h-4 w-4" />
                    Batches
                  </Button>
                )}
                {hasTestSeries && (
                  <Button
                    variant={
                      activeTab === "test-series" ? "default" : "outline"
                    }
                    onClick={() => setActiveTab("test-series")}
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Test Series
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Content Grid */}
          {activeTab === "batches" ? (
            <>
              {isBatchesLoading && !isBatchesFetched ? (
                <ExploreCardsGridShimmer count={6} />
              ) : batches.length === 0 ? (
                <div className="text-center py-20">
                  {LOTTIE_ANIMATIONS.emptyState ? (
                    <div className="w-72 h-72 mx-auto mb-6">
                      <LottieAnimation
                        animationUrl={LOTTIE_ANIMATIONS.emptyState}
                        loop={true}
                        autoplay={true}
                        fallbackIcon={
                          <BookOpen className="h-32 w-32 text-muted-foreground/50" />
                        }
                      />
                    </div>
                  ) : (
                    <BookOpen className="h-32 w-32 mx-auto text-muted-foreground/50 mb-6" />
                  )}
                  <h3 className="text-lg font-semibold mb-2">
                    No Batches Available
                  </h3>
                  <p className="text-muted-foreground">
                    Check back later for new courses
                  </p>
                </div>
              ) : (
                <Suspense fallback={<ExploreCardsGridShimmer count={6} />}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {batches.map((batch, index) => (
                      <ExploreBatchCard
                        key={batch.id}
                        {...batch}
                        index={index}
                      />
                    ))}
                  </div>
                </Suspense>
              )}
            </>
          ) : (
            <>
              {isTestSeriesLoading && !isTestSeriesFetched ? (
                <ExploreCardsGridShimmer count={6} />
              ) : testSeries.length === 0 ? (
                <div className="text-center py-20">
                  {LOTTIE_ANIMATIONS.emptyState ? (
                    <div className="w-72 h-72 mx-auto mb-6">
                      <LottieAnimation
                        animationUrl={LOTTIE_ANIMATIONS.emptyState}
                        loop={true}
                        autoplay={true}
                        fallbackIcon={
                          <FileText className="h-32 w-32 text-muted-foreground/50" />
                        }
                      />
                    </div>
                  ) : (
                    <FileText className="h-32 w-32 mx-auto text-muted-foreground/50 mb-6" />
                  )}
                  <h3 className="text-lg font-semibold mb-2">
                    No Test Series Available
                  </h3>
                  <p className="text-muted-foreground">
                    Check back later for new test series
                  </p>
                </div>
              ) : (
                <Suspense fallback={<ExploreCardsGridShimmer count={6} />}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testSeries.map((series, index) => (
                      <ExploreTestSeriesCard
                        key={series.id}
                        {...series}
                        index={index}
                      />
                    ))}
                  </div>
                </Suspense>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
