"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, tokenManager } from "@/lib/api/client";
import apiClient from "@/lib/api/client";
import {
  ApiResponse,
  Organization,
  LoginResponse,
  CreateOrganizationConfigData,
  CreateOrganizationConfigResponse,
} from "@/lib/types/api";
import { useRouter } from "next/navigation";

// Query Keys
export const queryKeys = {
  user: ["user"] as const,
  organization: ["organization"] as const,
  organizationConfig: (slug: string) => ["organizationConfig", slug] as const,
  emailAvailability: (email: string) => ["emailAvailability", email] as const,
  users: ["users"] as const,
  batches: ["batches"] as const,
  batch: (id: string) => ["batch", id] as const,
  teachers: ["teachers"] as const,
};

// Auth Hooks
export const useLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      try {
        const response = await api.login(data);
        const result = response.data;

        // If login failed, throw error with API message
        if (!result.success) {
          const error = new Error(result.message) as Error & {
            response?: { data?: { message?: string } };
          };
          error.response = { data: { message: result.message } };
          throw error;
        }

        return result;
      } catch (error: unknown) {
        // If it's an axios error, preserve the structure
        if (
          error &&
          typeof error === "object" &&
          "response" in error &&
          (error as { response?: { data?: { message?: string } } }).response
            ?.data?.message
        ) {
          throw error; // Already has the correct structure
        }
        // If it's our thrown error, re-throw it
        if (error && typeof error === "object" && "message" in error) {
          throw error;
        }
        // Otherwise, wrap it
        const errorMessage =
          error && typeof error === "object" && "message" in error
            ? String((error as { message: unknown }).message)
            : "Login failed. Please try again.";
        throw new Error(errorMessage);
      }
    },
    onSuccess: (data: ApiResponse<LoginResponse>) => {
      if (data.success && data.data) {
        // Store complete auth data (token + user) in QUEZT_AUTH cookie
        tokenManager.setAuthData(data.data.token, data.data.user);

        // Update user cache
        queryClient.setQueryData(queryKeys.user, data.data.user);

        // Redirect to dashboard
        router.push("/admin/dashboard");
      }
    },
    onError: (error) => {
      console.error("Login failed:", error);
      // Don't throw here, let the component handle it
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      // Clear auth data
      tokenManager.clearAuthData();
      // Clear all cached data
      queryClient.clear();
    },
    onSuccess: () => {
      router.push("/login");
    },
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.user,
    queryFn: async () => {
      if (!tokenManager.isAuthenticated()) {
        throw new Error("Not authenticated");
      }
      // Get user data from cookie
      const user = tokenManager.getUser();
      if (!user) {
        throw new Error("User data not found");
      }
      return user;
    },
    enabled: tokenManager.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Organization Hooks
export const useCreateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; slug: string }) =>
      api.createOrganization(data).then((res) => res.data),
    onSuccess: (data: ApiResponse<Organization>) => {
      if (data.success && data.data) {
        // Cache the organization
        queryClient.setQueryData(queryKeys.organization, data.data);
      }
    },
    onError: (error) => {
      console.error("Failed to create organization:", error);
    },
  });
};

// Organization Configuration Hook (Public endpoint)
export const useOrganizationConfig = (slug: string) => {
  return useQuery({
    queryKey: queryKeys.organizationConfig(slug),
    queryFn: () => api.getOrganizationConfig(slug).then((res) => res.data),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// Organization Configuration Hook (Admin endpoint)
export const useCreateOrganizationConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrganizationConfigData) =>
      api.createOrganizationConfig(data).then((res) => res.data),
    onSuccess: (data: CreateOrganizationConfigResponse) => {
      if (data.success && data.data) {
        // Cache the organization configuration
        queryClient.setQueryData(
          queryKeys.organizationConfig(data.data.slug),
          data
        );
      }
    },
    onError: (error) => {
      console.error("Failed to create organization configuration:", error);
    },
  });
};

// Get Organization Configuration (Admin endpoint)
export const useOrganizationConfigAdmin = () => {
  return useQuery({
    queryKey: ["organizationConfig", "admin"],
    queryFn: () => api.getOrganizationConfigAdmin().then((res) => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Update Organization Configuration Hook (Admin endpoint)
export const useUpdateOrganizationConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrganizationConfigData) =>
      api.updateOrganizationConfig(data).then((res) => res.data),
    onSuccess: (data: CreateOrganizationConfigResponse) => {
      if (data.success && data.data) {
        // Invalidate and update cache
        queryClient.invalidateQueries({ queryKey: ["organizationConfig"] });
        queryClient.setQueryData(
          queryKeys.organizationConfig(data.data.slug),
          data
        );
      }
    },
    onError: (error) => {
      console.error("Failed to update organization configuration:", error);
    },
  });
};

// Auth Registration Hooks
export const useRegister = () => {
  return useMutation({
    mutationFn: (data: {
      organizationId: string;
      email: string;
      username: string;
    }) => api.register(data).then((res) => res.data),
    onError: (error) => {
      console.error("Registration failed:", error);
    },
  });
};

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: (data: { token: string }) =>
      api.verifyEmail(data).then((res) => res.data),
    onError: (error) => {
      console.error("Email verification failed:", error);
    },
  });
};

export const useSetPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { userId: string; password: string }) =>
      api.setPassword(data).then((res) => res.data),
    onSuccess: (data: ApiResponse<{ message: string }>) => {
      if (data.success) {
        // Clear any cached auth data
        queryClient.invalidateQueries({ queryKey: queryKeys.user });
      }
    },
    onError: (error) => {
      console.error("Set password failed:", error);
    },
  });
};

export const useResendVerification = () => {
  return useMutation({
    mutationFn: (data: { email: string }) =>
      api.resendVerification(data).then((res) => res.data),
    onError: (error) => {
      console.error("Resend verification failed:", error);
    },
  });
};

// Student Authentication Hooks
export const useStudentRegister = () => {
  return useMutation({
    mutationFn: (data: {
      organizationId: string;
      email: string;
      username: string;
    }) => api.studentRegister(data).then((res) => res.data),
    onError: (error) => {
      console.error("Student registration failed:", error);
    },
  });
};

export const useStudentVerifyEmail = () => {
  return useMutation({
    mutationFn: (data: { token: string }) =>
      api.studentVerifyEmail(data).then((res) => res.data),
    onError: (error) => {
      console.error("Student email verification failed:", error);
    },
  });
};

export const useStudentSetPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { userId: string; password: string }) =>
      api.studentSetPassword(data).then((res) => res.data),
    onSuccess: (data: ApiResponse<{ message: string }>) => {
      if (data.success) {
        // Clear any cached auth data
        queryClient.invalidateQueries({ queryKey: queryKeys.user });
      }
    },
    onError: (error) => {
      console.error("Student set password failed:", error);
    },
  });
};

export const useStudentLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.studentLogin(data).then((res) => res.data),
    onSuccess: (data: ApiResponse<LoginResponse>) => {
      if (data.success && data.data) {
        // Store complete auth data (token + user) in QUEZT_AUTH cookie
        tokenManager.setAuthData(data.data.token, data.data.user);

        // Update user cache
        queryClient.setQueryData(queryKeys.user, data.data.user);

        // Redirect to student dashboard
        router.push("/student/my-learning");
      }
    },
    onError: (error) => {
      console.error("Student login failed:", error);
    },
  });
};

export const useStudentResendVerification = () => {
  return useMutation({
    mutationFn: (data: { email: string }) =>
      api.studentResendVerification(data).then((res) => res.data),
    onError: (error) => {
      console.error("Student resend verification failed:", error);
    },
  });
};

export const useInviteTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { email: string; username: string }) =>
      api.inviteUser(data).then((res) => res.data),
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate users query to refresh the list
        queryClient.invalidateQueries({ queryKey: ["users"] });
        // You could also show a success toast here
        console.log("Teacher invited successfully:", data.data);
      }
    },
    onError: (error) => {
      console.error("Invite user failed:", error);
    },
  });
};

// Utility hook for authentication state
export const useAuth = () => {
  const { data: user, isLoading, error } = useCurrentUser();

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
    error,
  };
};

// User Management Hooks
export const useGetAllUsers = () => {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: () => apiClient.get("/admin/users").then((res) => res.data),
    enabled: !!tokenManager.getToken(),
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      apiClient.delete(`/admin/users/${userId}`).then((res) => res.data),
    onSuccess: () => {
      // Invalidate users query to refetch the list
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
};

export const useInviteAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      organizationId: string;
      email: string;
      username: string;
    }) => apiClient.post("/admin/auth/register", data).then((res) => res.data),
    onSuccess: () => {
      // Invalidate users query to refetch the list
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
};

// Batch Management Hooks
export const useGetAllBatches = () => {
  return useQuery({
    queryKey: queryKeys.batches,
    queryFn: () => apiClient.get("/admin/batches").then((res) => res.data),
    enabled: true,
  });
};

export const useGetBatch = (id: string) => {
  return useQuery({
    queryKey: queryKeys.batch(id),
    queryFn: () =>
      apiClient.get(`/admin/batches/${id}`).then((res) => res.data),
    enabled: !!id,
  });
};

export const useCreateBatch = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: {
      name: string;
      description: string;
      class: string;
      exam: string;
      imageUrl?: string;
      startDate: string;
      endDate: string;
      language: string;
      totalPrice: number;
      discountPercentage: number;
      faq: Array<{
        title: string;
        description: string;
      }>;
    }) => apiClient.post("/admin/batches", data).then((res) => res.data),
    onSuccess: (created) => {
      // Invalidate batches query to refetch the list
      queryClient.invalidateQueries({ queryKey: queryKeys.batches });
      // Redirect to created batch detail when possible
      const extractId = (payload: unknown): string | undefined => {
        if (!payload || typeof payload !== "object") return undefined;
        const maybeWithData = payload as { data?: unknown; id?: unknown };
        if (maybeWithData.data && typeof maybeWithData.data === "object") {
          const inner = maybeWithData.data as { id?: unknown };
          if (typeof inner.id === "string") return inner.id;
        }
        if (typeof maybeWithData.id === "string") return maybeWithData.id;
        return undefined;
      };
      const createdId = extractId(created);
      if (createdId) {
        router.push(`/admin/courses/${createdId}`);
      } else {
        router.push("/admin/courses");
      }
    },
  });
};

export const useUpdateBatch = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        name: string;
        description: string;
        class: string;
        exam: string;
        imageUrl?: string;
        startDate: string;
        endDate: string;
        language: string;
        totalPrice: number;
        discountPercentage: number;
        faq: Array<{
          title: string;
          description: string;
        }>;
        teacherId?: string;
      };
    }) => apiClient.put(`/admin/batches/${id}`, data).then((res) => res.data),
    onSuccess: (data, variables) => {
      // Invalidate both batches list and specific batch
      queryClient.invalidateQueries({ queryKey: queryKeys.batches });
      queryClient.invalidateQueries({
        queryKey: queryKeys.batch(variables.id),
      });
      // Redirect to updated batch detail page
      router.push(`/admin/courses/${variables.id}`);
    },
  });
};

export const useDeleteBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/admin/batches/${id}`).then((res) => res.data),
    onSuccess: () => {
      // Invalidate batches query to refetch the list
      queryClient.invalidateQueries({ queryKey: queryKeys.batches });
    },
  });
};

// Teacher Management Hooks
export const useCreateTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      batchIds: string[];
      highlights: Record<string, unknown>;
      imageUrl?: string;
      subjects: string[];
    }) => apiClient.post("/admin/teachers", data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers });
    },
  });
};

export const useGetAllTeachers = () => {
  return useQuery({
    queryKey: ["teachers", "all"],
    queryFn: () => apiClient.get(`/admin/teachers`).then((res) => res.data),
  });
};

export const useGetTeachersByBatch = (batchId: string) => {
  return useQuery({
    queryKey: ["teachers", "batch", batchId],
    queryFn: () =>
      apiClient.get(`/admin/teachers/batch/${batchId}`).then((res) => res.data),
    enabled: !!batchId,
  });
};

export const useUpdateTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        name: string;
        highlights: Record<string, unknown>;
        imageUrl?: string;
        subjects: string[];
        batchId?: string;
      };
    }) => apiClient.put(`/admin/teachers/${id}`, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers });
    },
  });
};

export const useDeleteTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/admin/teachers/${id}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers });
    },
  });
};

export const useAssignTeacherToBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      teacherId,
      batchId,
    }: {
      teacherId: string;
      batchId: string;
    }) =>
      apiClient
        .post(`/admin/teachers/${teacherId}/batches/${batchId}`)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers });
      queryClient.invalidateQueries({ queryKey: queryKeys.batches });
    },
  });
};

export const useRemoveTeacherFromBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      teacherId,
      batchId,
    }: {
      teacherId: string;
      batchId: string;
    }) =>
      apiClient
        .delete(`/admin/teachers/${teacherId}/batches/${batchId}`)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers });
      queryClient.invalidateQueries({ queryKey: queryKeys.batches });
    },
  });
};

// File Upload Hooks (Admin)
export const useGenerateSignedUrl = () => {
  return useMutation({
    mutationFn: (data: {
      fileName: string;
      fileType: string;
      fileSize: number;
      folder: string;
    }) =>
      apiClient.post("/admin/upload/signed-url", data).then((res) => res.data),
  });
};

export const useDirectUpload = () => {
  return useMutation({
    mutationFn: (formData: FormData) =>
      apiClient
        .post("/admin/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => res.data),
  });
};

// File Upload Hooks (Client/Student)
export const useClientGenerateSignedUrl = () => {
  return useMutation({
    mutationFn: (data: {
      fileName: string;
      fileType: string;
      fileSize: number;
      folder: string;
    }) => api.generateSignedUrl(data).then((res) => res.data),
  });
};

export const useClientDirectUpload = () => {
  return useMutation({
    mutationFn: (formData: FormData) =>
      api.directUpload(formData).then((res) => res.data),
  });
};

// ==========================================
// Subjects API Hooks
// ==========================================

// Subject query keys (using inline arrays for now)

// Create Subject
export const useCreateSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      batchId: string;
      thumbnailUrl?: string;
    }) => apiClient.post("/admin/subjects", data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
};

// Get Subjects by Batch
export const useGetSubjectsByBatch = (batchId: string) => {
  return useQuery({
    queryKey: ["subjects", "batch", batchId],
    queryFn: () =>
      apiClient.get(`/admin/subjects/batch/${batchId}`).then((res) => res.data),
  });
};

// Get Subject by ID
export const useGetSubject = (id: string) => {
  return useQuery({
    queryKey: ["subjects", id],
    queryFn: () =>
      apiClient.get(`/admin/subjects/${id}`).then((res) => res.data),
  });
};

// Update Subject
export const useUpdateSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        name: string;
        thumbnailUrl?: string;
      };
    }) => apiClient.put(`/admin/subjects/${id}`, data).then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      queryClient.invalidateQueries({
        queryKey: ["subjects", variables.id],
      });
    },
  });
};

// Delete Subject
export const useDeleteSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/admin/subjects/${id}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
};

// ==========================================
// Chapters API Hooks
// ==========================================

// Create Chapter
export const useCreateChapter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; subjectId: string }) =>
      apiClient.post("/admin/chapters", data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
    },
  });
};

// Get Chapters by Subject
export const useGetChaptersBySubject = (subjectId: string) => {
  return useQuery({
    queryKey: ["chapters", "subject", subjectId],
    queryFn: () =>
      apiClient
        .get(`/admin/chapters/subject/${subjectId}`)
        .then((res) => res.data),
    enabled: !!subjectId && subjectId.trim() !== "",
  });
};

// Get Chapter by ID
export const useGetChapter = (id: string) => {
  return useQuery({
    queryKey: ["chapters", id],
    queryFn: () =>
      apiClient.get(`/admin/chapters/${id}`).then((res) => res.data),
  });
};

// Update Chapter
export const useUpdateChapter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string } }) =>
      apiClient.put(`/admin/chapters/${id}`, data).then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
      queryClient.invalidateQueries({
        queryKey: ["chapters", variables.id],
      });
    },
  });
};

// Delete Chapter
export const useDeleteChapter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/admin/chapters/${id}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
    },
  });
};

// ==========================================
// Topics API Hooks
// ==========================================

// Create Topic
export const useCreateTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; chapterId: string }) =>
      apiClient.post("/admin/topics", data).then((res) => res.data),
    onSuccess: (data, variables) => {
      // Invalidate all topics queries and specifically the chapter topics
      queryClient.invalidateQueries({ queryKey: ["topics"] });
      queryClient.invalidateQueries({
        queryKey: ["topics", "chapter", variables.chapterId],
      });
    },
  });
};

// Get Topics by Chapter
export const useGetTopicsByChapter = (chapterId: string) => {
  return useQuery({
    queryKey: ["topics", "chapter", chapterId],
    queryFn: () =>
      apiClient
        .get(`/admin/topics/chapter/${chapterId}`)
        .then((res) => res.data),
    enabled: !!chapterId && chapterId.trim() !== "",
  });
};

// Get Topic by ID
export const useGetTopic = (id: string) => {
  return useQuery({
    queryKey: ["topics", id],
    queryFn: () => apiClient.get(`/admin/topics/${id}`).then((res) => res.data),
  });
};

// Update Topic
export const useUpdateTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string } }) =>
      apiClient.put(`/admin/topics/${id}`, data).then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
      queryClient.invalidateQueries({
        queryKey: ["topics", variables.id],
      });
    },
  });
};

// Delete Topic
export const useDeleteTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/admin/topics/${id}`).then((res) => res.data),
    onSuccess: () => {
      // Invalidate all topics queries
      queryClient.invalidateQueries({ queryKey: ["topics"] });
    },
  });
};

// ==========================================
// Contents API Hooks
// ==========================================

interface ContentData {
  name: string;
  topicId?: string;
  type: "Lecture" | "PDF";
  pdfUrl?: string;
  videoUrl?: string;
  videoType?: "YOUTUBE" | "HLS";
  videoThumbnail?: string;
  videoDuration?: number;
}

// Create Content
export const useCreateContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ContentData) =>
      apiClient.post("/admin/contents", data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contents"] });
    },
  });
};

// Get Contents by Topic
// Note: Both admin and teacher use the same /admin/ endpoint
export const useGetContentsByTopic = (topicId: string) => {
  return useQuery({
    queryKey: ["contents", "topic", topicId],
    queryFn: () =>
      apiClient.get(`/admin/contents/topic/${topicId}`).then((res) => res.data),
    enabled: !!topicId, // Only fetch if topicId is provided
  });
};

// Get Content by ID
export const useGetContent = (id: string) => {
  return useQuery({
    queryKey: ["contents", id],
    queryFn: () =>
      apiClient.get(`/admin/contents/${id}`).then((res) => res.data),
  });
};

// Update Content
export const useUpdateContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ContentData> }) =>
      apiClient.put(`/admin/contents/${id}`, data).then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["contents"] });
      queryClient.invalidateQueries({
        queryKey: ["contents", variables.id],
      });
    },
  });
};

// Delete Content
export const useDeleteContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/admin/contents/${id}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contents"] });
    },
  });
};

// ==========================================
// Admin Utilities
// ==========================================

// Clear all cached data for the organization (ADMIN only)
export const useClearOrganizationCache = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await apiClient.post("/admin/cache/clear");
      return res.data as {
        success: boolean;
        message?: string;
        data?: { clearedKeys?: number };
      };
    },
    onSuccess: () => {
      // Invalidate all client-side caches so fresh data is fetched
      queryClient.invalidateQueries();
      // Optionally also clear mutations cache if needed in the future
    },
    onError: (error) => {
      console.error("Failed to clear organization cache:", error);
    },
  });
};

// ==========================================
// Student/Client API Hooks
// ==========================================

// Get all batches for students/clients (explore page)
export const useGetExploreBatches = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["explore", "batches", page, limit],
    queryFn: () =>
      apiClient
        .get("/api/batches", {
          params: { page, limit },
        })
        .then((res) => res.data),
    enabled: true,
  });
};

// Get all purchased batches for student
export const useGetMyBatches = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["myBatches", page, limit],
    queryFn: () =>
      apiClient
        .get("/api/batches/my-batches", {
          params: { page, limit },
        })
        .then((res) => res.data),
    enabled: tokenManager.isAuthenticated(),
  });
};

// Get single batch details for students/clients
export const useGetExploreBatch = (id: string) => {
  return useQuery({
    queryKey: ["explore", "batch", id],
    queryFn: () => apiClient.get(`/api/batches/${id}`).then((res) => res.data),
    enabled: !!id,
  });
};

// Get all schedules for a purchased batch (STUDENT)
// @deprecated Use useGetClientSchedulesByBatch from schedules-client.ts instead
export const useGetBatchSchedules = (batchId: string) => {
  return useQuery({
    queryKey: ["batch", "schedules", batchId],
    queryFn: () =>
      apiClient.get(`/api/schedules/batch/${batchId}`).then((res) => res.data),
    enabled: !!batchId && tokenManager.isAuthenticated(),
  });
};

// Get all test series for students/clients (explore page)
export const useGetExploreTestSeries = () => {
  return useQuery({
    queryKey: ["explore", "testSeries"],
    queryFn: () => apiClient.get("/api/test-series").then((res) => res.data),
    enabled: true,
  });
};

// Get single test series details for students/clients
export const useGetExploreTestSeriesById = (id: string) => {
  return useQuery({
    queryKey: ["explore", "testSeries", id],
    queryFn: () =>
      apiClient.get(`/api/test-series/${id}`).then((res) => res.data),
    enabled: !!id,
  });
};

// Create batch checkout order for payment
export const useCreateBatchCheckout = () => {
  return useMutation({
    mutationFn: (batchId: string) =>
      apiClient
        .post(`/api/batches/${batchId}/checkout`)
        .then((res) => res.data),
  });
};

export const useVerifyBatchPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      orderId: string;
      razorpayPaymentId: string;
      razorpayOrderId: string;
      razorpaySignature: string;
    }) =>
      apiClient
        .post(`/api/batches/verify-payment`, data)
        .then((res) => res.data),
    onSuccess: () => {
      // Invalidate my batches query to refetch purchased batches
      queryClient.invalidateQueries({ queryKey: ["myBatches"] });
      queryClient.invalidateQueries({ queryKey: ["explore", "batches"] });
    },
  });
};

// Enroll in free batch
export const useEnrollFreeBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (batchId: string) =>
      apiClient
        .post(`/api/batches/${batchId}/enroll-free`)
        .then((res) => res.data),
    onSuccess: () => {
      // Invalidate my batches query to refetch purchased batches
      queryClient.invalidateQueries({ queryKey: ["myBatches"] });
      queryClient.invalidateQueries({ queryKey: ["explore", "batches"] });
    },
  });
};

// ==========================================
// Client Subjects API Hooks (for purchased batches)
// ==========================================

// Get all subjects for a purchased batch (CLIENT)
export const useGetClientSubjectsByBatch = (batchId: string) => {
  return useQuery({
    queryKey: ["client", "subjects", "batch", batchId],
    queryFn: () =>
      apiClient.get(`/api/subjects/batch/${batchId}`).then((res) => res.data),
    enabled: !!batchId && tokenManager.isAuthenticated(),
  });
};

// Get subject by ID (CLIENT)
export const useGetClientSubject = (id: string) => {
  return useQuery({
    queryKey: ["client", "subjects", id],
    queryFn: () => apiClient.get(`/api/subjects/${id}`).then((res) => res.data),
    enabled: !!id && tokenManager.isAuthenticated(),
  });
};

// ==========================================
// Client Chapters API Hooks (for purchased batches)
// ==========================================

// Get all chapters for a subject (CLIENT)
export const useGetClientChaptersBySubject = (subjectId: string) => {
  return useQuery({
    queryKey: ["client", "chapters", "subject", subjectId],
    queryFn: () =>
      apiClient
        .get(`/api/chapters/subject/${subjectId}`)
        .then((res) => res.data),
    enabled: !!subjectId && tokenManager.isAuthenticated(),
  });
};

// Get chapter by ID (CLIENT)
export const useGetClientChapter = (id: string) => {
  return useQuery({
    queryKey: ["client", "chapters", id],
    queryFn: () => apiClient.get(`/api/chapters/${id}`).then((res) => res.data),
    enabled: !!id && tokenManager.isAuthenticated(),
  });
};

// ==========================================
// Client Topics API Hooks (for purchased batches)
// ==========================================

// Get all topics for a chapter (CLIENT)
export const useGetClientTopicsByChapter = (chapterId: string) => {
  return useQuery({
    queryKey: ["client", "topics", "chapter", chapterId],
    queryFn: () =>
      apiClient.get(`/api/topics/chapter/${chapterId}`).then((res) => res.data),
    enabled: !!chapterId && tokenManager.isAuthenticated(),
  });
};

// Get topic by ID (CLIENT)
export const useGetClientTopic = (id: string) => {
  return useQuery({
    queryKey: ["client", "topics", id],
    queryFn: () => apiClient.get(`/api/topics/${id}`).then((res) => res.data),
    enabled: !!id && tokenManager.isAuthenticated(),
  });
};

// ==========================================
// Client Contents API Hooks (for purchased batches)
// ==========================================

// Get all contents for a topic (CLIENT)
export const useGetClientContentsByTopic = (topicId: string) => {
  return useQuery({
    queryKey: ["client", "contents", "topic", topicId],
    queryFn: () =>
      apiClient.get(`/api/contents/topic/${topicId}`).then((res) => res.data),
    enabled: !!topicId && tokenManager.isAuthenticated(),
  });
};

// Get content by ID (CLIENT)
export const useGetClientContent = (id: string) => {
  return useQuery({
    queryKey: ["client", "contents", id],
    queryFn: () => apiClient.get(`/api/contents/${id}`).then((res) => res.data),
    enabled: !!id && tokenManager.isAuthenticated(),
  });
};

// ==========================================
// Profile API Hooks (Client/Student)
// ==========================================

// Profile type with all fields
export interface Profile {
  id: string;
  organizationId: string;
  email: string;
  username: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  isVerified: boolean;
  createdAt: string;
  profileImg?: string;
  gender?: "Male" | "Female" | "Other";
  phoneNumber?: string;
  address?: {
    city?: string;
    state?: string;
    pincode?: string;
  };
}

// Get user profile
export const useProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => api.getProfile().then((res) => res.data),
    enabled: tokenManager.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Update user profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      username?: string;
      profileImg?: string;
      gender?: "Male" | "Female" | "Other";
      phoneNumber?: string;
      address?: {
        city?: string;
        state?: string;
        pincode?: string;
      };
    }) => api.updateProfile(data).then((res) => res.data),
    onSuccess: (data) => {
      if (data.success && data.data) {
        // Update profile cache
        queryClient.setQueryData(["profile"], data);
        // Invalidate to refetch fresh data
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        // Also update user cache if it exists
        queryClient.setQueryData(queryKeys.user, data.data);
        queryClient.invalidateQueries({ queryKey: queryKeys.user });
      }
    },
    onError: (error) => {
      console.error("Failed to update profile:", error);
    },
  });
};
