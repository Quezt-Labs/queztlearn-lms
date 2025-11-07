import apiClient from "@/lib/api/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type AttemptApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type AttemptSummary = {
  id: string;
  testId: string;
  userId: string;
  attemptNumber?: number;
  startedAt: string;
  submittedAt?: string | null;
  totalScore?: number;
  percentage?: number;
  isCompleted: boolean;
  correctAnswers?: number;
  incorrectAnswers?: number;
  unattemptedQuestions?: number;
};

export type AttemptDetails = AttemptSummary & {
  durationMinutes?: number;
  questions: Array<{
    id: string;
    sectionId?: string;
    text: string;
    imageUrl?: string;
    type: string;
    options?: Array<{ id: string; text: string; isCorrect?: boolean }>;
    marks?: number;
    negativeMarks?: number;
  }>;
  answers?: Record<string, unknown>;
};

export type AnswerPayload = {
  questionId: string;
  selectedOptionId?: string;
  textAnswer?: string;
  timeSpentSeconds?: number;
  isMarkedForReview?: boolean;
};

export type SubmitResult = {
  attemptId: string;
  totalScore: number;
  percentage: number;
  rank?: number;
  percentile?: number;
};

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  username: string;
  score: number;
  percentage: number;
};

const attemptKeys = {
  root: ["client", "attempts"] as const,
  detail: (attemptId: string) => [...attemptKeys.root, attemptId] as const,
  results: (attemptId: string) =>
    [...attemptKeys.root, attemptId, "results"] as const,
  solutions: (attemptId: string) =>
    [...attemptKeys.root, attemptId, "solutions"] as const,
  myAttempts: (testId: string) =>
    [...attemptKeys.root, "test", testId, "my"] as const,
  leaderboard: (testId: string, page: number, limit: number) =>
    [
      ...attemptKeys.root,
      "test",
      testId,
      "leaderboard",
      { page, limit },
    ] as const,
};

export const useStartAttempt = () => {
  return useMutation({
    mutationFn: async (testId: string) => {
      const { data } = await apiClient.post<AttemptApiResponse<AttemptSummary>>(
        `/api/attempts/start/${testId}`
      );
      return data;
    },
  });
};

export const useAttemptDetails = (attemptId?: string) => {
  return useQuery({
    queryKey: attemptKeys.detail(attemptId ?? ""),
    queryFn: async () => {
      const { data } = await apiClient.get<AttemptApiResponse<AttemptDetails>>(
        `/api/attempts/${attemptId}`
      );
      return data;
    },
    enabled: Boolean(attemptId),
  });
};

export const useSaveAnswer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      attemptId,
      payload,
    }: {
      attemptId: string;
      payload: AnswerPayload;
    }) => {
      const { data } = await apiClient.post<
        AttemptApiResponse<{ saved: boolean }>
      >(`/api/attempts/${attemptId}/answer`, payload);
      return data;
    },
    onSuccess: (_res, { attemptId }) => {
      qc.invalidateQueries({ queryKey: attemptKeys.detail(attemptId) });
    },
  });
};

export const useSubmitAttempt = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (attemptId: string) => {
      const { data } = await apiClient.post<AttemptApiResponse<SubmitResult>>(
        `/api/attempts/${attemptId}/submit`
      );
      return data;
    },
    onSuccess: (_res, attemptId) => {
      qc.invalidateQueries({ queryKey: attemptKeys.detail(attemptId) });
      qc.invalidateQueries({ queryKey: attemptKeys.results(attemptId) });
    },
  });
};

export const useAttemptResults = (attemptId?: string) => {
  return useQuery({
    queryKey: attemptKeys.results(attemptId ?? ""),
    queryFn: async () => {
      const { data } = await apiClient.get<AttemptApiResponse<SubmitResult>>(
        `/api/attempts/${attemptId}/results`
      );
      return data;
    },
    enabled: Boolean(attemptId),
  });
};

export const useAttemptSolutions = (attemptId?: string) => {
  return useQuery({
    queryKey: attemptKeys.solutions(attemptId ?? ""),
    queryFn: async () => {
      const { data } = await apiClient.get<AttemptApiResponse<unknown>>(
        `/api/attempts/${attemptId}/solutions`
      );
      return data;
    },
    enabled: Boolean(attemptId),
  });
};

export const useMyAttemptsByTest = (testId?: string) => {
  return useQuery({
    queryKey: attemptKeys.myAttempts(testId ?? ""),
    queryFn: async () => {
      const { data } = await apiClient.get<
        AttemptApiResponse<AttemptSummary[]>
      >(`/api/attempts/test/${testId}/my-attempts`);
      return data;
    },
    enabled: Boolean(testId),
  });
};

export const useLeaderboard = (
  testId?: string,
  page: number = 1,
  limit: number = 10
) => {
  return useQuery({
    queryKey: attemptKeys.leaderboard(testId ?? "", page, limit),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      const { data } = await apiClient.get<
        AttemptApiResponse<{
          leaderboard: LeaderboardEntry[];
          userRank?: { rank: number; percentile: number };
        }>
      >(`/api/attempts/test/${testId}/leaderboard?${params.toString()}`);
      return data;
    },
    enabled: Boolean(testId),
  });
};

export const attemptQueryKeys = attemptKeys;
