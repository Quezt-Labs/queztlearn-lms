"use client";

import { Suspense, lazy } from "react";
import { FileText, Loader2 } from "lucide-react";
import { StudentHeader } from "@/components/student/student-header";
import { PageHeader } from "@/components/common/page-header";
import { useClientMyEnrollments } from "@/hooks/test-series-client";
import { ExploreCardsGridShimmer } from "@/components/common/explore-card-shimmer";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Dynamic import for code splitting
const TestSeriesCardLazy = lazy(() =>
  import("@/components/student/test-series-card").then((mod) => ({
    default: mod.TestSeriesCard,
  }))
);

export default function MyTestSeriesPage() {
  const {
    data: enrollmentsResponse,
    isLoading,
    isFetched,
  } = useClientMyEnrollments({ page: 1, limit: 50 });

  const testSeries = enrollmentsResponse?.data || [];

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/40">
          <div className="flex items-center justify-between px-4 h-14">
            <h1 className="text-xl font-bold text-foreground">
              My Test Series
            </h1>
          </div>
        </header>

        <div className="px-4 py-6">
          {isLoading && !isFetched ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : testSeries.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground/50" />
              <h3 className="text-lg font-semibold">No Test Series Enrolled</h3>
              <p className="text-muted-foreground text-sm">
                Start exploring and enroll in test series to see them here.
              </p>
              <Button asChild>
                <Link href="/student/explore">Explore Test Series</Link>
              </Button>
            </div>
          ) : (
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              }
            >
              <div className="space-y-4">
                {testSeries.map((series, index) => (
                  <TestSeriesCardLazy
                    key={series.id}
                    id={series.id}
                    title={series.title}
                    exam={series.exam}
                    imageUrl={series.imageUrl}
                    totalPrice={series.totalPrice}
                    discountPercentage={series.discountPercentage}
                    finalPrice={series.finalPrice}
                    totalTests={0} // TODO: Get from API if available
                    attemptedTests={0} // TODO: Get from API if available
                    averageScore={series.averageScore || 0}
                    validUntil={
                      new Date(
                        Date.now() +
                          (series.durationDays || 365) * 24 * 60 * 60 * 1000
                      )
                    }
                    index={index}
                  />
                ))}
              </div>
            </Suspense>
          )}
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block min-h-screen bg-background">
        <StudentHeader />

        <div className="container mx-auto px-4 sm:px-6 py-6 max-w-7xl">
          <PageHeader
            title="My Test Series"
            description="View all your enrolled test series and track your progress"
            breadcrumbs={[
              { label: "Student", href: "/student/my-learning" },
              { label: "My Test Series" },
            ]}
          />

          {isLoading && !isFetched ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : testSeries.length === 0 ? (
            <div className="text-center py-20">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Test Series Enrolled
              </h3>
              <p className="text-muted-foreground mb-6">
                Start exploring and enroll in test series to see them here.
              </p>
              <Button asChild>
                <Link href="/student/explore">Explore Test Series</Link>
              </Button>
            </div>
          ) : (
            <Suspense fallback={<ExploreCardsGridShimmer />}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testSeries.map((series, index) => (
                  <TestSeriesCardLazy
                    key={series.id}
                    id={series.id}
                    title={series.title}
                    exam={series.exam}
                    imageUrl={series.imageUrl}
                    totalPrice={series.totalPrice}
                    discountPercentage={series.discountPercentage}
                    finalPrice={series.finalPrice}
                    totalTests={0} // TODO: Get from API if available
                    attemptedTests={0} // TODO: Get from API if available
                    averageScore={series.averageScore || 0}
                    validUntil={
                      new Date(
                        Date.now() +
                          (series.durationDays || 365) * 24 * 60 * 60 * 1000
                      )
                    }
                    index={index}
                  />
                ))}
              </div>
            </Suspense>
          )}
        </div>
      </div>
    </>
  );
}
