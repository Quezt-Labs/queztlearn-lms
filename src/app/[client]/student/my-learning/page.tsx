"use client";

import Link from "next/link";
import { MyLearningMobile } from "@/components/student/mobile/my-learning-mobile";
import { StudentHeader } from "@/components/student/student-header";
import { PageHeader } from "@/components/common/page-header";
import { SectionHeader } from "@/components/student/section-header";
import { VideoCard } from "@/components/student/video-card";
import { TestAttemptCard } from "@/components/student/test-attempt-card";
import { BatchCard } from "@/components/student/batch-card";
import { TestSeriesCard } from "@/components/student/test-series-card";
import { useClientMyEnrollments } from "@/hooks/test-series-client";
import { useGetMyBatches } from "@/hooks";
import { useIsMobile } from "@/hooks";
import { motion } from "framer-motion";
import { Play, FileText, BookOpen, TrendingUp } from "lucide-react";
import { LottieAnimation } from "@/components/common/lottie-animation";
import { LOTTIE_ANIMATIONS } from "@/lib/constants/lottie-animations";

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

const recentTests = [
  {
    id: "1",
    title: "Physics Mock Test 1",
    testSeriesName: "JEE Main Mock Series",
    totalMarks: 300,
    obtainedMarks: 245,
    totalQuestions: 75,
    attemptedQuestions: 73,
    accuracy: 82.5,
    attemptedAt: new Date("2025-10-29T14:00:00"),
    rank: 145,
    percentile: 89.5,
  },
  {
    id: "2",
    title: "Chemistry Full Test",
    testSeriesName: "NEET Practice Tests",
    totalMarks: 180,
    obtainedMarks: 156,
    totalQuestions: 45,
    attemptedQuestions: 45,
    accuracy: 86.7,
    attemptedAt: new Date("2025-10-27T10:00:00"),
    rank: 89,
    percentile: 92.3,
  },
];

export default function MyLearningPage() {
  const { isMobile, isClient } = useIsMobile();

  // Fetch enrolled test series from API - only for desktop, and only after we know if it's mobile
  const { data: enrollmentsResponse, isLoading: isLoadingTestSeries } =
    useClientMyEnrollments(
      { page: 1, limit: 6 },
      { enabled: isClient && isMobile === false }
    );

  // Fetch purchased batches from API - only for desktop
  const { data: batchesResponse, isLoading: isLoadingBatches } =
    useGetMyBatches(1, 6);

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
  // Show nothing during initial render to prevent hydration mismatch
  if (!isClient) {
    return null;
  }

  return (
    <>
      {/* Mobile View */}
      {isMobile ? (
        <MyLearningMobile />
      ) : (
        /* Desktop View */
        <div className="w-full min-h-[calc(100vh-4rem)] bg-linear-to-br from-background via-background to-muted/20">
          <StudentHeader />

          <div className="container mx-auto px-2 md:px-4 py-4 md:py-6 space-y-6 md:space-y-8 max-w-7xl w-full">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <PageHeader
                title="My Learning"
                description="Track your progress and continue your learning journey"
              />
            </motion.div>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <SectionHeader
                title="Continue Watching"
                icon={Play}
                viewAllHref="/student/videos"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {recentVideos.map((video, index) => (
                  <VideoCard key={video.id} {...video} index={index} />
                ))}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <SectionHeader
                title="Recent Test Attempts"
                icon={FileText}
                viewAllHref={undefined}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {recentTests.map((test, index) => (
                  <TestAttemptCard key={test.id} {...test} index={index} />
                ))}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <SectionHeader
                title="My Batches"
                icon={BookOpen}
                viewAllHref={
                  purchasedBatches.length >= 4 ? "/student/batches" : undefined
                }
              />

              {isLoadingBatches ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-64 bg-muted animate-pulse rounded-lg"
                    />
                  ))}
                </div>
              ) : purchasedBatches.length === 0 ? (
                <div className="text-center py-12">
                  {LOTTIE_ANIMATIONS.emptyState ? (
                    <div className="w-64 h-64 mx-auto mb-6">
                      <LottieAnimation
                        animationUrl={LOTTIE_ANIMATIONS.emptyState}
                        loop={true}
                        autoplay={true}
                        fallbackIcon={
                          <BookOpen className="h-24 w-24 text-muted-foreground/50" />
                        }
                      />
                    </div>
                  ) : (
                    <BookOpen className="h-24 w-24 mx-auto text-muted-foreground/50 mb-6" />
                  )}
                  <h3 className="text-lg font-semibold mb-2 text-foreground">
                    No batches enrolled yet
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    <Link
                      href="/student/explore"
                      className="text-primary hover:underline font-medium"
                    >
                      Explore batches
                    </Link>{" "}
                    to get started with your learning journey!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                  {purchasedBatches.map((batch, index) => (
                    <BatchCard key={batch.id} {...batch} index={index} />
                  ))}
                </div>
              )}
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <SectionHeader
                title="My Test Series"
                icon={TrendingUp}
                viewAllHref={
                  purchasedTestSeries.length >= 4
                    ? "/student/test-series"
                    : undefined
                }
              />

              {isLoadingTestSeries ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-64 bg-muted animate-pulse rounded-lg"
                    />
                  ))}
                </div>
              ) : purchasedTestSeries.length === 0 ? (
                <div className="text-center py-12">
                  {LOTTIE_ANIMATIONS.emptyState ? (
                    <div className="w-64 h-64 mx-auto mb-6">
                      <LottieAnimation
                        animationUrl={LOTTIE_ANIMATIONS.emptyState}
                        loop={true}
                        autoplay={true}
                        fallbackIcon={
                          <FileText className="h-24 w-24 text-muted-foreground/50" />
                        }
                      />
                    </div>
                  ) : (
                    <FileText className="h-24 w-24 mx-auto text-muted-foreground/50 mb-6" />
                  )}
                  <h3 className="text-lg font-semibold mb-2 text-foreground">
                    No test series enrolled yet
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    <Link
                      href="/student/explore"
                      className="text-primary hover:underline font-medium"
                    >
                      Explore test series
                    </Link>{" "}
                    to practice and improve your skills!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {purchasedTestSeries.map((series, index) => (
                    <TestSeriesCard key={series.id} {...series} index={index} />
                  ))}
                </div>
              )}
            </motion.section>
          </div>
        </div>
      )}
    </>
  );
}
