"use client";

import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, Loader2, FileText } from "lucide-react";
import { useClientMyEnrollments } from "@/hooks/test-series-client";
import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type {
  ClientApiResponse,
  ClientTestInSeries,
} from "@/hooks/test-series-client";

export default function StudentTestsListPage() {
  // Fetch enrolled test series
  const { data: enrollmentsData, isLoading: isLoadingEnrollments } =
    useClientMyEnrollments({ page: 1, limit: 100 });

  const enrolledSeries = enrollmentsData?.data || [];

  // Fetch tests for all enrolled series in parallel
  const testQueries = useQueries({
    queries: enrolledSeries.map((series) => ({
      queryKey: ["client", "test-series", "tests", series.id],
      queryFn: async () => {
        const { data } = await apiClient.get<
          ClientApiResponse<ClientTestInSeries[]>
        >(`/api/test-series/${series.id}/tests`);
        return {
          seriesId: series.id,
          seriesTitle: series.title,
          tests: data.data || [],
        };
      },
      enabled: Boolean(series.id),
    })),
  });

  const isLoadingTests = testQueries.some((q) => q.isLoading);
  const isLoading = isLoadingEnrollments || isLoadingTests;

  // Flatten all tests from all series into a single array
  const allTests = useMemo(() => {
    const tests: Array<{
      id: string;
      title: string;
      durationMinutes: number;
      totalMarks: number;
      isFree: boolean;
      attemptStatus?: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
      seriesTitle: string;
    }> = [];

    testQueries.forEach((query) => {
      if (query.data && Array.isArray(query.data.tests)) {
        query.data.tests.forEach((test) => {
          tests.push({
            id: test.id,
            title: test.title,
            durationMinutes: test.durationMinutes,
            totalMarks: test.totalMarks,
            isFree: test.isFree,
            attemptStatus: test.attemptStatus,
            seriesTitle: query.data.seriesTitle,
          });
        });
      }
    });

    return tests;
  }, [testQueries]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Tests"
        description="Choose a test and start your attempt."
        breadcrumbs={[
          { label: "Student", href: "/student/my-learning" },
          { label: "Tests" },
        ]}
      />

      {isLoading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      ) : allTests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              No tests available. Please enroll in a test series to access
              tests.
            </p>
            <Button asChild>
              <Link href="/student/explore">Explore Test Series</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {allTests.map((test) => (
            <Card key={test.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="line-clamp-1">{test.title}</span>
                  <div className="flex items-center gap-2">
                    {test.isFree && (
                      <Badge variant="secondary" className="text-xs">
                        Free
                      </Badge>
                    )}
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {test.durationMinutes}m
                    </Badge>
                  </div>
                </CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {test.seriesTitle}
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Total Marks: {test.totalMarks}</div>
                  {test.attemptStatus && (
                    <div className="text-xs">
                      Status:{" "}
                      <Badge
                        variant={
                          test.attemptStatus === "COMPLETED"
                            ? "default"
                            : test.attemptStatus === "IN_PROGRESS"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {test.attemptStatus.replace("_", " ")}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button asChild>
                  <Link href={`/student/tests/${test.id}/instructions`}>
                    <Play className="mr-2 h-4 w-4" />
                    {test.attemptStatus === "COMPLETED"
                      ? "Retake Test"
                      : test.attemptStatus === "IN_PROGRESS"
                      ? "Continue Test"
                      : "Start Test"}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
