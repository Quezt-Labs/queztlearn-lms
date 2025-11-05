"use client";

import { useSearchParams, useParams } from "next/navigation";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAttemptResults } from "@/hooks/test-attempts-client";
import {
  Loader2,
  Trophy,
  TrendingUp,
  Award,
  XCircle,
  FileText,
} from "lucide-react";
import Link from "next/link";

export default function TestResultsPage() {
  const params = useParams<{ testId: string }>();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attemptId") || undefined;
  const testId = params.testId;

  const {
    data: resultsData,
    isLoading: isLoadingResults,
    error: resultsError,
  } = useAttemptResults(attemptId);

  const results = resultsData?.data;
  const hasResults = Boolean(results);

  if (!attemptId) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Test Results"
          description="View your test results and performance"
          breadcrumbs={[
            { label: "Student", href: "/student/my-learning" },
            { label: "Tests", href: "/student/tests" },
            { label: "Results" },
          ]}
        />
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No attempt ID provided. Please access this page from a completed
              test.
            </p>
            <Button asChild>
              <Link href="/student/tests">Go to Tests</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoadingResults) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Test Results"
          description="View your test results and performance"
          breadcrumbs={[
            { label: "Student", href: "/student/my-learning" },
            { label: "Tests", href: "/student/tests" },
            { label: "Results" },
          ]}
        />
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (resultsError || !hasResults) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Test Results"
          description="View your test results and performance"
          breadcrumbs={[
            { label: "Student", href: "/student/my-learning" },
            { label: "Tests", href: "/student/tests" },
            { label: "Results" },
          ]}
        />
        <Card>
          <CardContent className="py-12 text-center">
            <XCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <p className="text-muted-foreground mb-4">
              {resultsError
                ? "Failed to load results. Please try again."
                : "Test not yet submitted or results not available."}
            </p>
            <Button asChild>
              <Link href="/student/tests">Go to Tests</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Test Results"
        description="View your test results and performance"
        breadcrumbs={[
          { label: "Student", href: "/student/my-learning" },
          { label: "Tests", href: "/student/tests" },
          { label: "Results" },
        ]}
      />

      {/* Score Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold text-primary mb-1">
                {results?.totalScore?.toFixed(1) || "0"}
              </div>
              <div className="text-sm text-muted-foreground">Total Score</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {results?.percentage?.toFixed(1) || "0"}%
              </div>
              <div className="text-sm text-muted-foreground">Percentage</div>
            </div>
            {results?.rank !== undefined && (
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  #{results.rank}
                </div>
                <div className="text-sm text-muted-foreground">Rank</div>
              </div>
            )}
          </div>

          {results?.percentile !== undefined && (
            <div className="flex items-center justify-center gap-2 p-4 bg-accent/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-accent" />
              <span className="font-medium">
                You scored better than {results.percentile.toFixed(1)}% of test
                takers
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="outline" asChild className="flex-1">
          <Link
            href={`/student/tests/${testId}/solutions?attemptId=${attemptId}`}
          >
            <FileText className="mr-2 h-4 w-4" />
            View Solutions
          </Link>
        </Button>
        <Button variant="outline" asChild className="flex-1">
          <Link href={`/student/tests/${testId}/leaderboard`}>
            <Award className="mr-2 h-4 w-4" />
            View Leaderboard
          </Link>
        </Button>
        <Button variant="outline" asChild className="flex-1">
          <Link href="/student/tests">Back to Tests</Link>
        </Button>
      </div>
    </div>
  );
}
