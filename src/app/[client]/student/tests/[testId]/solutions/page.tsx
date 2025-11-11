"use client";

import { useSearchParams, useParams } from "next/navigation";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAttemptSolutions } from "@/hooks/test-attempts-client";
import { Loader2, FileText, XCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function TestSolutionsPage() {
  const params = useParams<{ testId: string }>();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attemptId") || undefined;
  const testId = params.testId;

  // Hooks must be called unconditionally - use enabled option to conditionally fetch
  const {
    data: solutionsData,
    isLoading,
    error,
  } = useAttemptSolutions(attemptId);

  // Validate testId after hooks are called
  if (!testId) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Test Solutions"
          description="View solutions and explanations for all questions"
          breadcrumbs={[
            { label: "Student", href: "/student/my-learning" },
            { label: "Tests", href: "/student/tests" },
            { label: "Solutions" },
          ]}
        />
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              Invalid test ID. Please select a test to view solutions.
            </p>
            <Button asChild>
              <Link href="/student/tests">Go to Tests</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!attemptId) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Test Solutions"
          description="View solutions and explanations for all questions"
          breadcrumbs={[
            { label: "Student", href: "/student/my-learning" },
            { label: "Tests", href: "/student/tests" },
            { label: "Solutions" },
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Test Solutions"
          description="View solutions and explanations for all questions"
          breadcrumbs={[
            { label: "Student", href: "/student/my-learning" },
            { label: "Tests", href: "/student/tests" },
            { label: "Solutions" },
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

  if (error || !solutionsData?.data) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Test Solutions"
          description="View solutions and explanations for all questions"
          breadcrumbs={[
            { label: "Student", href: "/student/my-learning" },
            { label: "Tests", href: "/student/tests" },
            { label: "Solutions" },
          ]}
        />
        <Card>
          <CardContent className="py-12 text-center">
            <XCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <p className="text-muted-foreground mb-4">
              {error
                ? "Failed to load solutions. Please try again."
                : "Solutions not available yet. They will be available after the test submission period."}
            </p>
            <Button asChild>
              <Link href="/student/tests">Go to Tests</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Type assertion for solutions data structure
  // The API should return questions with solutions and explanations
  type SolutionQuestion = {
    id?: string;
    text?: string;
    question?: string;
    isCorrect?: boolean;
    explanation?: string;
    correctAnswer?: string;
  };
  const solutions = (solutionsData?.data as SolutionQuestion[]) || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Test Solutions"
        description="View solutions and explanations for all questions"
        breadcrumbs={[
          { label: "Student", href: "/student/my-learning" },
          { label: "Tests", href: "/student/tests" },
          { label: "Solutions" },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Solutions & Explanations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Array.isArray(solutions) && solutions.length > 0 ? (
              solutions.map((question: SolutionQuestion, index: number) => (
                <div
                  key={question.id || index}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-sm">
                          Question {index + 1}
                        </span>
                        {question.isCorrect !== undefined &&
                          (question.isCorrect ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          ))}
                      </div>
                      <p className="text-sm">
                        {question.text || question.question}
                      </p>
                    </div>
                  </div>

                  {question.explanation && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium mb-1">Explanation:</p>
                      <p className="text-sm text-muted-foreground">
                        {question.explanation}
                      </p>
                    </div>
                  )}

                  {question.correctAnswer && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">
                        Correct Answer: {question.correctAnswer}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No solutions available at this time.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button variant="outline" asChild className="flex-1">
          <Link
            href={`/student/tests/${testId}/results?attemptId=${attemptId}`}
          >
            View Results
          </Link>
        </Button>
        <Button variant="outline" asChild className="flex-1">
          <Link href="/student/tests">Back to Tests</Link>
        </Button>
      </div>
    </div>
  );
}
