"use client";

import Link from "next/link";
import { Play, FileText, BookOpen, TrendingUp } from "lucide-react";
import { VideoCard } from "@/components/student/video-card";
import { RecentCompletedTestCard } from "@/components/student/recent-completed-test-card";
import { BatchCard } from "@/components/student/batch-card";
import { TestSeriesCard } from "@/components/student/test-series-card";
import { SectionHeader } from "@/components/student/section-header";
import { useClientMyEnrollments } from "@/hooks/test-series-client";
import { useGetMyBatches } from "@/hooks";
import { useRecentCompletedTests } from "@/hooks/test-attempts-client";

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

interface PurchasedBatch {
  id: string;
  name: string;
  class: string;
  exam: string;
  imageUrl?: string;
  startDate: Date;
  endDate: Date;
  language: string;
  totalPrice: number;
  discountPercentage: number;
  finalPrice: number;
  progress: number;
  totalSubjects: number;
  completedSubjects: number;
}

// Mock data - Replace with actual API calls
const recentVideos = [
  {
    id: "1",
    title: "Introduction to Organic Chemistry",
    subject: "Chemistry",
    thumbnail:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400",
    duration: 3600, // in seconds
    watchedDuration: 2400,
    lastWatchedAt: new Date("2025-10-30T10:30:00"),
    batchName: "JEE Main 2025",
  },
  {
    id: "2",
    title: "Newton's Laws of Motion",
    subject: "Physics",
    thumbnail:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400",
    duration: 2700,
    watchedDuration: 2700,
    lastWatchedAt: new Date("2025-10-29T15:20:00"),
    batchName: "JEE Advanced 2025",
  },
  {
    id: "3",
    title: "Calculus - Differentiation Basics",
    subject: "Mathematics",
    thumbnail:
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400",
    duration: 3000,
    watchedDuration: 1500,
    lastWatchedAt: new Date("2025-10-28T18:45:00"),
    batchName: "JEE Main 2025",
  },
];

export function MyLearningMobile() {
  // Fetch enrolled test series from API
  const { data: enrollmentsResponse, isLoading: isLoadingTestSeries } =
    useClientMyEnrollments({ page: 1, limit: 10 });

  // Fetch purchased batches from API
  const { data: batchesResponse, isLoading: isLoadingBatches } =
    useGetMyBatches(1, 10);

  // Fetch recent completed tests from API
  const { data: recentTestsResponse, isLoading: isLoadingRecentTests } =
    useRecentCompletedTests({
      page: 1,
      limit: 6,
    });

  const purchasedBatches: PurchasedBatch[] = (batchesResponse?.data || []).map(
    (batch: Batch) => ({
      id: batch.id,
      name: batch.name,
      class: batch.class,
      exam: batch.exam,
      imageUrl: batch.imageUrl,
      startDate: new Date(batch.startDate),
      endDate: new Date(batch.endDate),
      language: batch.language,
      totalPrice: batch.totalPrice,
      discountPercentage: batch.discountPercentage,
      finalPrice: Math.round(
        batch.totalPrice * (1 - batch.discountPercentage / 100)
      ),
      progress: 0, // TODO: Need API endpoint for progress tracking
      totalSubjects: 0, // TODO: Need API endpoint for subject count
      completedSubjects: 0, // TODO: Need API endpoint for completed subjects
    })
  );

  const purchasedTestSeries = (enrollmentsResponse?.data || []).map(
    (series) => ({
      id: series.id,
      title: series.title,
      exam: series.exam,
      imageUrl: series.imageUrl,
      totalPrice: series.totalPrice,
      discountPercentage: series.discountPercentage,
      finalPrice: series.discountedPrice || series.finalPrice,
      totalTests: series.testCount || 0,
      attemptedTests: 0, // TODO: Need API endpoint for attempt count
      averageScore: 0, // TODO: Need API endpoint for average score
      validUntil: series.enrollmentDetails?.endDate
        ? new Date(series.enrollmentDetails.endDate)
        : new Date(
            Date.now() + (series.durationDays || 365) * 24 * 60 * 60 * 1000
          ),
    })
  );

  return (
    <div className="min-h-screen bg-background pb-20 md:hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/40">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-xl font-bold text-foreground">My Learning</h1>
        </div>
      </header>

      {/* Content */}
      <div className="py-6 space-y-8">
        {/* Continue Watching */}
        <section>
          <div className="px-4">
            <SectionHeader
              title="Continue Watching"
              icon={Play}
              viewAllHref={
                recentVideos.length >= 4 ? "/student/videos" : undefined
              }
            />
          </div>
          <div className="flex gap-4 overflow-x-auto px-4 mt-4 pb-2 scrollbar-hide snap-x snap-mandatory">
            {recentVideos.map((video, index) => (
              <div
                key={video.id}
                className="shrink-0 w-[85vw] sm:w-[400px] snap-start"
              >
                <VideoCard {...video} index={index} />
              </div>
            ))}
          </div>
        </section>

        {/* Recently Completed Tests */}
        <section>
          <div className="px-4">
            <SectionHeader
              title="Recent Completed Tests"
              icon={FileText}
              viewAllHref={
                recentTestsResponse?.data &&
                recentTestsResponse.data.length >= 6
                  ? "/student/tests"
                  : undefined
              }
            />
          </div>
          {isLoadingRecentTests ? (
            <div className="flex gap-4 overflow-x-auto px-4 mt-4 pb-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="shrink-0 w-[85vw] sm:w-[400px] h-64 bg-muted animate-pulse rounded-lg snap-start"
                />
              ))}
            </div>
          ) : !recentTestsResponse?.data ||
            recentTestsResponse.data.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground">
              <p className="text-sm">No completed tests yet.</p>
              <p className="text-xs mt-2">
                Complete your first test to see results here.
              </p>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto px-4 mt-4 pb-2 scrollbar-hide snap-x snap-mandatory">
              {recentTestsResponse.data.map((attempt, index) => (
                <div
                  key={attempt.id}
                  className="shrink-0 w-[85vw] sm:w-[400px] snap-start"
                >
                  <RecentCompletedTestCard attempt={attempt} index={index} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Purchased Batches */}
        <section>
          <div className="px-4">
            <SectionHeader
              title="My Batches"
              icon={BookOpen}
              viewAllHref={
                purchasedBatches.length >= 4 ? "/student/batches" : undefined
              }
            />
          </div>
          {isLoadingBatches ? (
            <div className="flex gap-4 overflow-x-auto px-4 mt-4 pb-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="shrink-0 w-[85vw] sm:w-[400px] h-64 bg-muted animate-pulse rounded-lg snap-start"
                />
              ))}
            </div>
          ) : purchasedBatches.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground">
              <p className="text-sm">No batches enrolled yet.</p>
              <p className="text-xs mt-2">
                <Link
                  href="/student/explore"
                  className="text-primary hover:underline"
                >
                  Explore batches
                </Link>{" "}
                to get started.
              </p>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto px-4 mt-4 pb-2 scrollbar-hide snap-x snap-mandatory">
              {purchasedBatches.map((batch, index) => (
                <div
                  key={batch.id}
                  className="shrink-0 w-[85vw] sm:w-[400px] snap-start"
                >
                  <BatchCard {...batch} index={index} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Purchased Test Series */}
        <section>
          <div className="px-4">
            <SectionHeader
              title="My Test Series"
              icon={TrendingUp}
              viewAllHref={
                purchasedTestSeries.length >= 4
                  ? "/student/test-series"
                  : undefined
              }
            />
          </div>
          {isLoadingTestSeries ? (
            <div className="flex gap-4 overflow-x-auto px-4 mt-4 pb-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="shrink-0 w-[85vw] sm:w-[350px] h-64 bg-muted animate-pulse rounded-lg snap-start"
                />
              ))}
            </div>
          ) : purchasedTestSeries.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground">
              <p className="text-sm">No test series enrolled yet.</p>
              <p className="text-xs mt-2">
                <Link
                  href="/student/explore"
                  className="text-primary hover:underline"
                >
                  Explore test series
                </Link>{" "}
                to get started.
              </p>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto px-4 mt-4 pb-2 scrollbar-hide snap-x snap-mandatory">
              {purchasedTestSeries.map((series, index) => (
                <div
                  key={series.id}
                  className="shrink-0 w-[85vw] sm:w-[350px] snap-start"
                >
                  <TestSeriesCard {...series} index={index} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
