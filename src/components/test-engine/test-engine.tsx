"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QuestionRenderer } from "./question-renderer";
import { useExamSecurity } from "@/hooks/use-exam-security";
import { useRouter } from "next/navigation";
import { useAttemptTimer } from "@/hooks/use-attempt-timer";
import { useProctoringOnAttempt } from "@/hooks/use-proctoring-on-attempt";
import { generateMockTest } from "@/lib/utils/test-mock";
import { getAnsweredCount } from "@/lib/utils/test-engine";
import { TestHeaderBar } from "@/components/test-engine/test-header-bar";
import { QuestionPalette } from "@/components/test-engine/question-palette";
import { ProctoringPanel } from "@/components/test-engine/proctoring-panel";
import {
  useAttemptDetails,
  useSaveAnswer,
  useSubmitAttempt,
  useAttemptResults,
} from "@/hooks/test-attempts-client";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { ErrorMessage } from "@/components/common/error-message";
import type { EngineQuestion } from "@/lib/types/test-engine";

export function TestEngine({
  testId,
  attemptId,
  enableMock = false,
}: {
  testId: string;
  attemptId?: string;
  enableMock?: boolean;
}) {
  const [markedForReview, setMarkedForReview] = useState<
    Record<string, boolean>
  >({});
  const [localAnswers, setLocalAnswers] = useState<Record<string, unknown>>({});
  const [answerTimeSpent, setAnswerTimeSpent] = useState<
    Record<string, number>
  >({});
  const router = useRouter();

  // Backend API hooks
  const {
    data: attemptData,
    isLoading: isLoadingAttempt,
    error: attemptError,
  } = useAttemptDetails(attemptId && !enableMock ? attemptId : undefined);

  const saveAnswerMutation = useSaveAnswer();
  const submitMutation = useSubmitAttempt();
  const { data: resultsData, isLoading: isLoadingResults } = useAttemptResults(
    attemptId && !enableMock && submitMutation.isSuccess ? attemptId : undefined
  );

  const security = useExamSecurity({
    maxViolations: 3, // Enable violations for both mock and real tests
    requireFullscreen:
      typeof document !== "undefined" && document.fullscreenEnabled,
    requireWebcamMic: true, // Require camera for both mock and real tests
    onViolation: (_reason, count) => {
      if (count >= 3 && attemptId) {
        handleSubmit();
      }
    },
  });

  // Use mock or real data
  const data = useMemo(() => {
    if (enableMock) return generateMockTest();
    if (!attemptData?.data) return null;

    // Define types for API response structure
    type ApiQuestion = {
      id: string;
      text: string;
      imageUrl?: string | null;
      type: string;
      options?: Array<{
        id: string;
        text: string;
        imageUrl?: string | null;
        isCorrect?: boolean;
      }>;
      marks?: number;
      negativeMarks?: number;
      sectionId?: string;
    };

    type ApiSection = {
      id: string;
      name: string;
      questions?: ApiQuestion[];
    };

    type ApiTest = {
      durationMinutes?: number;
      sections?: ApiSection[];
    };

    type ApiAttempt = {
      durationMinutes?: number;
      questions?: ApiQuestion[];
      test?: ApiTest;
    };

    const attempt = attemptData.data as ApiAttempt;
    const test = attempt.test;

    // Check if we have test.sections structure (new API format)
    if (test?.sections && Array.isArray(test.sections)) {
      return {
        durationMinutes: test.durationMinutes || attempt.durationMinutes || 60,
        sections: test.sections.map((section: ApiSection) => ({
          id: section.id,
          name: section.name || "Questions",
          questions: (section.questions || []).map((q: ApiQuestion) => ({
            id: q.id,
            text: q.text,
            imageUrl: q.imageUrl || undefined,
            type: q.type as EngineQuestion["type"],
            options: (q.options || []).map(
              (opt: {
                id: string;
                text: string;
                imageUrl?: string | null;
                isCorrect?: boolean;
              }) => ({
                id: opt.id,
                text: opt.text,
                imageUrl:
                  opt.imageUrl && typeof opt.imageUrl === "string"
                    ? opt.imageUrl
                    : undefined,
                isCorrect: opt.isCorrect,
              })
            ),
            marks: q.marks || 1,
            negativeMarks: q.negativeMarks || 0,
          })),
        })),
      };
    }

    // Fallback to old format (attempt.questions) if sections structure doesn't exist
    if (attempt.questions && Array.isArray(attempt.questions)) {
      type SectionAccumulator = Array<{
        id: string;
        name: string;
        questions: EngineQuestion[];
      }>;

      return {
        durationMinutes: attempt.durationMinutes || 60,
        sections: attempt.questions.reduce(
          (acc: SectionAccumulator, q: ApiQuestion) => {
            const sectionId = q.sectionId || "default";
            let section = acc.find((s) => s.id === sectionId);
            if (!section) {
              section = { id: sectionId, name: "Questions", questions: [] };
              acc.push(section);
            }
            section.questions.push({
              id: q.id,
              text: q.text,
              imageUrl: q.imageUrl || undefined,
              type: q.type as EngineQuestion["type"],
              options: (q.options || []).map(
                (opt: {
                  id: string;
                  text: string;
                  imageUrl?: string | null;
                  isCorrect?: boolean;
                }) => ({
                  id: opt.id,
                  text: opt.text,
                  imageUrl:
                    opt.imageUrl && typeof opt.imageUrl === "string"
                      ? opt.imageUrl
                      : undefined,
                  isCorrect: opt.isCorrect,
                })
              ),
              marks: q.marks || 1,
              negativeMarks: q.negativeMarks || 0,
            });
            return acc;
          },
          [] as SectionAccumulator
        ),
      };
    }

    // If neither structure exists, return null
    return null;
  }, [enableMock, attemptData]);

  const flatQuestions = useMemo(
    () =>
      (data?.sections && Array.isArray(data.sections)
        ? data.sections.flatMap(
            (s: { questions: EngineQuestion[] }) => s.questions || []
          )
        : []) as EngineQuestion[],
    [data?.sections]
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentQuestion = flatQuestions[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === flatQuestions.length - 1;

  // Initialize mock start time for mock tests
  const [mockStartTime] = useState(() => (enableMock ? Date.now() : null));

  // Get attempt state from backend or local
  const attemptStartedAt = enableMock
    ? mockStartTime
    : attemptData?.data?.startedAt
    ? new Date(attemptData.data.startedAt).getTime()
    : undefined;
  const attemptSubmittedAt = attemptData?.data?.submittedAt
    ? new Date(attemptData.data.submittedAt).getTime()
    : undefined;
  const isActive = attemptStartedAt && !attemptSubmittedAt;
  const durationMinutes = data?.durationMinutes || 0;

  // Debug timer inputs
  useEffect(() => {
    console.log("[TEST ENGINE DEBUG] Timer inputs:", {
      enableMock,
      mockStartTime,
      attemptStartedAt,
      durationMinutes,
      hasData: !!data,
      dataDurationMinutes: data?.durationMinutes,
      isActive,
    });
  }, [
    enableMock,
    mockStartTime,
    attemptStartedAt,
    durationMinutes,
    data,
    isActive,
  ]);

  // Initialize answers from backend if available
  useEffect(() => {
    if (attemptData?.data?.answers) {
      setLocalAnswers(attemptData.data.answers as Record<string, unknown>);
    }
  }, [attemptData]);

  // Track time spent on current question
  const [questionStartTime] = useState(() => Date.now());
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      const currentQ = flatQuestions[currentIndex];
      if (currentQ) {
        setAnswerTimeSpent((prev) => ({
          ...prev,
          [currentQ.id]: (prev[currentQ.id] || 0) + 1,
        }));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, currentIndex, flatQuestions]);

  useProctoringOnAttempt(
    security.enterFullscreen,
    security.startMedia,
    security.stopMedia,
    security.exitFullscreen
  );

  // Drive countdown from a small timer hook
  const tickCallback = useCallback(() => {
    // Touch function - can be empty for backend-driven
  }, []);

  const {
    remainingMs,
    minutes: remainingMinutes,
    seconds: remainingSeconds,
  } = useAttemptTimer(
    attemptStartedAt ?? undefined,
    durationMinutes,
    tickCallback
  );

  // Auto-submit on timer expiry once
  useEffect(() => {
    if (isActive && remainingMs <= 0 && attemptId && !enableMock) {
      security.stopMedia();
      security.exitFullscreen();
      handleSubmit();
    }
  }, [remainingMs, isActive, attemptId, enableMock, security]);

  // Note: Camera start/stop is handled by useProctoringOnAttempt hook based on route
  // Only stop if attempt is explicitly submitted/ended
  const { stopMedia, exitFullscreen } = security;
  useEffect(() => {
    // Only stop if attempt is explicitly ended (submitted)
    // Route-based cleanup is handled by useProctoringOnAttempt
    if (submitMutation.isSuccess) {
      stopMedia();
      exitFullscreen();
    }
  }, [submitMutation.isSuccess, stopMedia, exitFullscreen]);

  // Save answer to backend (with debouncing could be added)
  const handleAnswer = useCallback(
    (answer: unknown) => {
      if (!currentQuestion) return;

      if (!attemptId || enableMock) {
        // Fallback to local state for mock
        setLocalAnswers((prev) => ({
          ...prev,
          [currentQuestion.id]: answer,
        }));
        return;
      }

      // Update local state immediately
      setLocalAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: answer,
      }));

      // Determine answer payload based on question type
      const question = currentQuestion;
      const timeSpent = answerTimeSpent[currentQuestion.id] || 0;

      const payload: {
        questionId: string;
        selectedOptionId?: string;
        textAnswer?: string;
        timeSpentSeconds: number;
        isMarkedForReview?: boolean;
      } = {
        questionId: currentQuestion.id,
        timeSpentSeconds: timeSpent,
        isMarkedForReview: markedForReview[currentQuestion.id] || false,
      };

      if (question.type === "MCQ" || question.type === "TRUE_FALSE") {
        if (typeof answer === "string") {
          payload.selectedOptionId = answer;
        } else if (
          answer &&
          typeof answer === "object" &&
          "optionId" in answer
        ) {
          payload.selectedOptionId = answer.optionId as string;
        }
      } else if (
        question.type === "FILL_BLANK" ||
        question.type === "NUMERICAL"
      ) {
        payload.textAnswer = String(answer || "");
      }

      // Save to backend
      saveAnswerMutation.mutate(
        { attemptId, payload },
        {
          onError: (error) => {
            console.error("Failed to save answer:", error);
            // Optionally show error notification
          },
        }
      );
    },
    [
      attemptId,
      enableMock,
      currentQuestion,
      answerTimeSpent,
      markedForReview,
      saveAnswerMutation,
    ]
  );

  const toggleReview = useCallback(() => {
    const newMarked = !markedForReview[currentQuestion.id];
    setMarkedForReview((m) => ({
      ...m,
      [currentQuestion.id]: newMarked,
    }));

    // If backend-driven, update the answer with review flag
    if (attemptId && !enableMock && currentQuestion) {
      const timeSpent = answerTimeSpent[currentQuestion.id] || 0;
      const currentAnswer = localAnswers[currentQuestion.id];

      const payload: {
        questionId: string;
        selectedOptionId?: string;
        textAnswer?: string;
        timeSpentSeconds: number;
        isMarkedForReview: boolean;
      } = {
        questionId: currentQuestion.id,
        timeSpentSeconds: timeSpent,
        isMarkedForReview: newMarked,
      };

      if (currentAnswer) {
        if (
          currentQuestion.type === "MCQ" ||
          currentQuestion.type === "TRUE_FALSE"
        ) {
          if (typeof currentAnswer === "string") {
            payload.selectedOptionId = currentAnswer;
          }
        } else {
          payload.textAnswer = String(currentAnswer);
        }
      }

      saveAnswerMutation.mutate({ attemptId, payload });
    }
  }, [
    markedForReview,
    currentQuestion,
    attemptId,
    enableMock,
    answerTimeSpent,
    localAnswers,
    saveAnswerMutation,
  ]);

  const handleSubmit = useCallback(async () => {
    if (enableMock) {
      // Mock submission
      if (
        typeof window !== "undefined" &&
        window.confirm(
          "Submit your test? You cannot change answers after submit."
        )
      ) {
        security.stopMedia();
        security.exitFullscreen();
        // For mock, just update local state
        return;
      }
      return;
    }

    if (!attemptId) {
      console.error("No attemptId available");
      return;
    }

    const ok =
      typeof window !== "undefined"
        ? window.confirm(
            "Submit your test? You cannot change answers after submit."
          )
        : true;
    if (!ok) return;

    // Stop proctoring immediately when ending attempt
    security.stopMedia();
    security.exitFullscreen();

    try {
      await submitMutation.mutateAsync(attemptId);
    } catch (error) {
      console.error("Failed to submit attempt:", error);
      // Show error message
    }
  }, [attemptId, enableMock, submitMutation, security]);

  // Loading state
  if (!enableMock && attemptId && isLoadingAttempt) {
    return <LoadingSkeleton />;
  }

  // Error state
  if (!enableMock && attemptId && attemptError) {
    return (
      <Card className="mx-auto my-10 max-w-3xl p-8">
        <ErrorMessage
          error={
            (attemptError as { message?: string })?.message ||
            "Failed to load attempt details. Please try again."
          }
        />
        <div className="mt-4 flex justify-center">
          <Button onClick={() => router.push("/student/my-learning")}>
            Back to My Learning
          </Button>
        </div>
      </Card>
    );
  }

  // No data state
  if (!data || flatQuestions.length === 0) {
    return (
      <Card className="mx-auto my-10 max-w-3xl p-8 text-center">
        <div className="text-lg font-semibold mb-2">No questions available</div>
        <Button onClick={() => router.push("/student/my-learning")}>
          Back to My Learning
        </Button>
      </Card>
    );
  }

  // Show submission summary screen when not active and submitted
  if (!isActive && attemptSubmittedAt) {
    const submittedDate = new Date(attemptSubmittedAt).toLocaleString();
    const answeredCount = getAnsweredCount(localAnswers);
    const results = resultsData?.data;

    return (
      <Card className="mx-auto my-10 max-w-3xl p-8 text-center space-y-4">
        {isLoadingResults ? (
          <>
            <div className="text-2xl font-semibold">Submitting...</div>
            <div className="text-muted-foreground">
              Please wait while we evaluate your test
            </div>
          </>
        ) : results ? (
          <>
            <div className="text-2xl font-semibold">
              Test Submitted Successfully!
            </div>
            <div className="text-muted-foreground">
              Submitted on {submittedDate}
            </div>
            <div className="space-y-2 pt-4">
              <div className="text-lg">
                <span className="font-semibold">Score: </span>
                {results.totalScore} /{" "}
                {flatQuestions.reduce((sum, q) => sum + (q?.marks || 1), 0)}
              </div>
              <div className="text-lg">
                <span className="font-semibold">Percentage: </span>
                {results.percentage.toFixed(2)}%
              </div>
              {results.rank && (
                <div className="text-lg">
                  <span className="font-semibold">Rank: </span>#{results.rank}
                  {results.percentile &&
                    ` (${results.percentile.toFixed(1)} percentile)`}
                </div>
              )}
              <div className="text-sm text-muted-foreground pt-2">
                Answered {answeredCount} out of {flatQuestions.length} questions
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="text-2xl font-semibold">Submission complete</div>
            <div className="text-muted-foreground">
              Submitted on {submittedDate}
            </div>
            <div className="text-sm">Answered {answeredCount} questions</div>
          </>
        )}
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button onClick={() => router.push("/student/my-learning")}>
            Back to My Learning
          </Button>
          {results && attemptId && (
            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  `/student/tests/${testId}/results?attemptId=${attemptId}`
                )
              }
            >
              View Detailed Results
            </Button>
          )}
        </div>
      </Card>
    );
  }

  const progressPercentage =
    flatQuestions.length > 0
      ? ((currentIndex + 1) / flatQuestions.length) * 100
      : 0;

  const answeredCount = flatQuestions.filter(
    (q) =>
      q &&
      localAnswers[q.id] !== undefined &&
      localAnswers[q.id] !== null &&
      localAnswers[q.id] !== ""
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Card className="p-0 overflow-hidden shadow-2xl border-2">
        <TestHeaderBar
          remainingMinutes={remainingMinutes}
          remainingSeconds={remainingSeconds}
          currentIndex={currentIndex}
          totalQuestions={flatQuestions.length}
          violations={security.violations}
          maxViolations={security.maxViolations}
          markedForReview={
            currentQuestion
              ? Boolean(markedForReview[currentQuestion.id])
              : false
          }
          onToggleReview={toggleReview}
          onSubmit={handleSubmit}
        />

        {/* Progress Bar */}
        <div className="px-4 pt-3 pb-2 bg-muted/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>
              Progress: {answeredCount}/{flatQuestions.length} answered
            </span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3 sm:gap-4 p-3 sm:p-4 pb-[max(theme(spacing.4),env(safe-area-inset-bottom))]">
          <div className="min-h-[50vh] sm:min-h-[60vh]">
            {currentQuestion && (
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <QuestionRenderer
                  question={currentQuestion}
                  value={localAnswers[currentQuestion.id]}
                  onChange={handleAnswer}
                />
              </motion.div>
            )}

            <div className="mt-6 flex items-center justify-between gap-2">
              <Button
                variant="outline"
                disabled={isFirst}
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                className="min-w-[100px]"
              >
                ← Previous
              </Button>

              <div className="flex-1 flex items-center justify-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {answeredCount} answered
                </Badge>
                {Object.values(markedForReview).filter(Boolean).length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {Object.values(markedForReview).filter(Boolean).length}{" "}
                    marked
                  </Badge>
                )}
              </div>

              <Button
                disabled={isLast}
                onClick={() =>
                  setCurrentIndex((i) =>
                    Math.min(flatQuestions.length - 1, i + 1)
                  )
                }
                className="min-w-[100px]"
              >
                Next →
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <QuestionPalette
              total={flatQuestions.length}
              currentIndex={currentIndex}
              answeredMap={flatQuestions.reduce<Record<number, boolean>>(
                (acc, q, idx) => {
                  if (!q) return acc;
                  acc[idx] =
                    localAnswers[q.id] !== undefined &&
                    localAnswers[q.id] !== null &&
                    localAnswers[q.id] !== "";
                  return acc;
                },
                {}
              )}
              reviewMap={flatQuestions.reduce<Record<number, boolean>>(
                (acc, q, idx) => {
                  if (!q) return acc;
                  acc[idx] = Boolean(markedForReview[q.id]);
                  return acc;
                },
                {}
              )}
              onSelect={(idx) => setCurrentIndex(idx)}
            />

            {/* Always show proctoring panel - camera required for both mock and real tests */}
            <ProctoringPanel
              mediaStream={security.mediaStream}
              isRequestingMedia={security.isRequestingMedia}
              startMedia={security.startMedia}
              mediaError={security.mediaError}
              videoRef={security.videoRef}
              isFullscreen={security.isFullscreen}
              enterFullscreen={security.enterFullscreen}
              autoStart={true} // Auto-start camera for both mock and real tests
            />

            {/* Summary Card */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Answered:</span>
                    <span className="font-semibold text-primary">
                      {answeredCount}/{flatQuestions.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Remaining:</span>
                    <span className="font-semibold">
                      {flatQuestions.length - answeredCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Time Left:</span>
                    <span
                      className={`font-semibold ${
                        remainingMinutes < 5 ? "text-destructive" : ""
                      }`}
                    >
                      {remainingMinutes}m {remainingSeconds}s
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
}
