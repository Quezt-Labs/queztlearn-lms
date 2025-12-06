"use client";

import Link from "next/link";
import { MyLearningMobile } from "@/components/student/mobile/my-learning-mobile";
import { StudentHeader } from "@/components/student/student-header";
import { PageHeader } from "@/components/common/page-header";
import { SectionHeader } from "@/components/student/section-header";
import { VideoCard } from "@/components/student/video-card";
import { BatchCard } from "@/components/student/batch-card";
import { TestSeriesCard } from "@/components/student/test-series-card";
import { useClientMyEnrollments } from "@/hooks/test-series-client";
import { useGetMyBatches } from "@/hooks";
import { useIsMobile } from "@/hooks";
import { useRecentlyWatched, useWatchStats } from "@/hooks/api";
import {
  useRecentCompletedTests,
  useTestAttemptStats,
} from "@/hooks/test-attempts-client";
import { motion } from "framer-motion";
import {
  Play,
  FileText,
  BookOpen,
  TrendingUp,
  Award,
  Clock,
} from "lucide-react";
import { RecentCompletedTestCard } from "@/components/student/recent-completed-test-card";
import { LottieAnimation } from "@/components/common/lottie-animation";
import { LOTTIE_ANIMATIONS } from "@/lib/constants/lottie-animations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export default function MyLearningPage() {
  const { isMobile, isClient } = useIsMobile();

  // Fetch recently watched videos from API
  const { data: recentlyWatchedResponse, isLoading: isLoadingRecentVideos } =
    useRecentlyWatched({
      page: 1,
      limit: 6,
    });

  // Fetch watch statistics
  const { data: watchStats } = useWatchStats();

  // Fetch recent completed tests
  const { data: recentTestsResponse, isLoading: isLoadingRecentTests } =
    useRecentCompletedTests({
      page: 1,
      limit: 6,
    });

  // Fetch test attempt statistics
  const { data: testStatsResponse } = useTestAttemptStats();

  // Transform API response to match VideoCard props
  // Note: The API response should include nested path data (batchId, subjectId, chapterId, topicId)
  // If not available, href will be undefined and VideoCard will use fallback route
  const recentVideos =
    recentlyWatchedResponse?.data?.videos?.map((video) => {
      const content = video.content as {
        id: string;
        name: string;
        topicId?: string;
        subject?: { name: string; id?: string };
        videoThumbnail?: string;
        batch?: { name: string; id?: string };
        topic?: {
          id?: string;
          chapterId?: string;
          chapter?: {
            id?: string;
            subjectId?: string;
            subject?: {
              id?: string;
              batchId?: string;
            };
          };
        };
      };

      // Construct navigation href if we have all required IDs from API response
      // The API should return nested data: content.topic.chapter.subject.batch
      let href: string | undefined;
      const contentId = content.id;
      const topicId = content.topicId || content.topic?.id;
      const chapterId = content.topic?.chapterId || content.topic?.chapter?.id;
      const subjectId =
        content.subject?.id ||
        content.topic?.chapter?.subjectId ||
        content.topic?.chapter?.subject?.id;
      const batchId =
        content.batch?.id || content.topic?.chapter?.subject?.batchId;

      if (batchId && subjectId && chapterId && topicId && contentId) {
        href = `/student/batches/${batchId}/subjects/${subjectId}/chapters/${chapterId}/topics/${topicId}/content/${contentId}`;
      }

      return {
        id: content.id,
        title: content.name || "Untitled Video",
        subject: content.subject?.name || "General",
        thumbnail: content.videoThumbnail || "",
        duration: video.progress.totalDuration || 0,
        watchedDuration: video.progress.watchedSeconds || 0,
        lastWatchedAt: video.progress.lastWatchedAt
          ? new Date(video.progress.lastWatchedAt)
          : new Date(),
        batchName: content.batch?.name || "Batch",
        href,
      };
    }) || [];

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

              {isLoadingRecentVideos ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-32 bg-muted animate-pulse rounded-lg"
                    />
                  ))}
                </div>
              ) : recentVideos.length === 0 ? (
                <div className="text-center py-12">
                  {LOTTIE_ANIMATIONS.emptyState ? (
                    <div className="w-64 h-64 mx-auto mb-6">
                      <LottieAnimation
                        animationUrl={LOTTIE_ANIMATIONS.emptyState}
                        loop={true}
                        autoplay={true}
                        fallbackIcon={
                          <Play className="h-24 w-24 text-muted-foreground/50" />
                        }
                      />
                    </div>
                  ) : (
                    <Play className="h-24 w-24 mx-auto text-muted-foreground/50 mb-6" />
                  )}
                  <h3 className="text-lg font-semibold mb-2 text-foreground">
                    No videos watched yet
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start watching videos to see your progress here!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {recentVideos.map((video, index) => (
                    <VideoCard key={video.id} {...video} index={index} />
                  ))}
                </div>
              )}
            </motion.section>

            {/* Watch Statistics Section */}
            {watchStats?.data && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Your Learning Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Videos Watched
                        </p>
                        <p className="text-2xl font-bold">
                          {watchStats.data.totalVideosWatched}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Completed
                        </p>
                        <p className="text-2xl font-bold">
                          {watchStats.data.completedVideosCount}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Watch Time
                        </p>
                        <p className="text-2xl font-bold">
                          {watchStats.data.totalWatchTimeFormatted}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Completion Rate
                        </p>
                        <p className="text-2xl font-bold">
                          {watchStats.data.averageCompletionRate.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.section>
            )}

            {/* Test Statistics Section */}
            {testStatsResponse?.data && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Test Performance Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Tests Completed
                        </p>
                        <p className="text-2xl font-bold">
                          {testStatsResponse.data.totalTestsCompleted}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {testStatsResponse.data.totalTestsAttempted} attempted
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Pass Rate
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          {testStatsResponse.data.passRate.toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {testStatsResponse.data.totalTestsPassed} passed
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Average Score
                        </p>
                        <p className="text-2xl font-bold">
                          {testStatsResponse.data.averageScore.toFixed(1)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {testStatsResponse.data.averagePercentage.toFixed(1)}%
                          avg
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Best Score
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          {testStatsResponse.data.bestScore}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {testStatsResponse.data.bestPercentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Total Study Time
                          </p>
                          <p className="text-lg font-semibold">
                            {testStatsResponse.data.totalTimeSpentHours.toFixed(
                              1
                            )}{" "}
                            hours
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp
                          className={`h-4 w-4 ${
                            testStatsResponse.data.recentTrend === "improving"
                              ? "text-green-600"
                              : testStatsResponse.data.recentTrend ===
                                "declining"
                              ? "text-red-600"
                              : "text-muted-foreground"
                          }`}
                        />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Recent Trend
                          </p>
                          <p className="text-lg font-semibold capitalize">
                            {testStatsResponse.data.recentTrend}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.section>
            )}

            {/* Recent Completed Tests Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <SectionHeader
                title="Recent Completed Tests"
                icon={Award}
                viewAllHref={
                  recentTestsResponse?.data &&
                  recentTestsResponse.data.length >= 6
                    ? "/student/tests"
                    : undefined
                }
              />

              {isLoadingRecentTests ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-64 bg-muted animate-pulse rounded-lg"
                    />
                  ))}
                </div>
              ) : !recentTestsResponse?.data ||
                recentTestsResponse.data.length === 0 ? (
                <div className="text-center py-12">
                  {LOTTIE_ANIMATIONS.emptyState ? (
                    <div className="w-64 h-64 mx-auto mb-6">
                      <LottieAnimation
                        animationUrl={LOTTIE_ANIMATIONS.emptyState}
                        loop={true}
                        autoplay={true}
                        fallbackIcon={
                          <Award className="h-24 w-24 text-muted-foreground/50" />
                        }
                      />
                    </div>
                  ) : (
                    <Award className="h-24 w-24 mx-auto text-muted-foreground/50 mb-6" />
                  )}
                  <h3 className="text-lg font-semibold mb-2 text-foreground">
                    No completed tests yet
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Complete your first test to see your results here!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentTestsResponse.data.map((attempt, index) => (
                    <RecentCompletedTestCard
                      key={attempt.id}
                      attempt={attempt}
                      index={index}
                    />
                  ))}
                </div>
              )}
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
