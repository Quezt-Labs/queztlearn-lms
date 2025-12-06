import axios, { AxiosInstance, AxiosResponse } from "axios";
import { getCookie, setCookie, deleteCookie } from "cookies-next";
import {
  ApiResponse,
  LoginResponse,
  RegisterResponse,
  VerifyEmailResponse,
  SetPasswordResponse,
  InviteUserResponse,
  Organization,
  CreateOrganizationData,
  CreateCourseData,
  OrganizationConfigResponse,
  CreateOrganizationConfigData,
  CreateOrganizationConfigResponse,
  OrderHistoryResponse,
} from "@/lib/types/api";

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Token management
const QUEZT_AUTH_KEY = "QUEZT_AUTH";

export interface User {
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

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors and token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (error?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Only redirect if not already on login/register pages
      // This prevents redirect loops and allows login errors to be displayed
      const currentPath =
        typeof window !== "undefined" ? window.location.pathname : "";
      const isAuthPage =
        currentPath.includes("/login") ||
        currentPath.includes("/register") ||
        currentPath.includes("/set-password") ||
        currentPath.includes("/verify-email");

      // Try to refresh token if we have a refresh token
      const refreshToken = tokenManager.getRefreshToken();
      if (refreshToken && !isAuthPage && !isRefreshing) {
        originalRequest._retry = true;
        isRefreshing = true;

        return new Promise((resolve, reject) => {
          api
            .refreshToken({ refreshToken })
            .then((response) => {
              if (response.data.success && response.data.data) {
                // Update token in auth data
                const authData = tokenManager.getAuthData();
                if (authData && authData.user) {
                  tokenManager.setAuthData(
                    response.data.data.accessToken,
                    authData.user,
                    authData.refreshToken
                  );
                }
                // Update original request with new token
                originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
                processQueue(null, response.data.data.accessToken);
                resolve(apiClient(originalRequest));
              } else {
                processQueue(new Error("Token refresh failed"), null);
                reject(error);
              }
            })
            .catch((refreshError) => {
              processQueue(refreshError, null);
              // Refresh failed, clear auth and redirect
              tokenManager.clearAuthData();
              if (typeof window !== "undefined" && !isAuthPage) {
                window.location.href = "/login";
              }
              reject(refreshError);
            })
            .finally(() => {
              isRefreshing = false;
            });
        });
      } else if (!isAuthPage) {
        // No refresh token or refresh failed, redirect to login
        tokenManager.clearAuthData();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

// Token management functions
export const tokenManager = {
  setAuthData: (
    token: string,
    user: {
      id: string;
      email?: string;
      username: string;
      role: string;
      organizationId: string;
      phoneNumber?: string;
      countryCode?: string;
    },
    refreshToken?: string
  ) => {
    const authData = {
      token,
      refreshToken,
      user,
      timestamp: Date.now(),
    };

    setCookie(QUEZT_AUTH_KEY, JSON.stringify(authData), {
      maxAge: 7 * 24 * 60 * 60, // 7 days (matches JWT expiry)
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  },

  getRefreshToken: () => {
    const authData = getCookie(QUEZT_AUTH_KEY);
    if (authData && typeof authData === "string") {
      try {
        const parsed = JSON.parse(authData);
        return parsed.refreshToken || null;
      } catch {
        return null;
      }
    }
    return null;
  },

  getToken: () => {
    const authData = getCookie(QUEZT_AUTH_KEY);
    if (authData && typeof authData === "string") {
      try {
        const parsed = JSON.parse(authData);
        return parsed.token;
      } catch {
        return null;
      }
    }
    return null;
  },

  getUser: () => {
    // Only get user data on client side
    if (typeof window === "undefined") {
      console.log("TokenManager: Server side - returning null");
      return null;
    }

    const authData = getCookie(QUEZT_AUTH_KEY);
    console.log("TokenManager: Getting user data");
    console.log("TokenManager: Auth data:", authData);
    console.log("TokenManager: Auth data type:", typeof authData);

    if (authData && typeof authData === "string") {
      try {
        const parsed = JSON.parse(authData);
        console.log("TokenManager: Parsed data:", parsed);
        console.log("TokenManager: User from parsed data:", parsed.user);
        return parsed.user;
      } catch (error) {
        console.error("TokenManager: Error parsing auth data:", error);
        return null;
      }
    }
    console.log("TokenManager: No valid auth data found");
    return null;
  },

  getAuthData: () => {
    const authData = getCookie(QUEZT_AUTH_KEY);
    if (authData && typeof authData === "string") {
      try {
        return JSON.parse(authData);
      } catch {
        return null;
      }
    }
    return null;
  },

  clearAuthData: () => {
    deleteCookie(QUEZT_AUTH_KEY);
  },

  isAuthenticated: () => {
    // Only check cookies on client side
    if (typeof window === "undefined") {
      console.log("TokenManager: Server side - returning false");
      return false;
    }

    const cookie = getCookie(QUEZT_AUTH_KEY);
    console.log("TokenManager: Checking authentication");
    console.log("TokenManager: Cookie value:", cookie);
    console.log("TokenManager: Cookie exists:", !!cookie);
    return !!cookie;
  },
};

// API endpoints
export const api = {
  // Organizations
  createOrganization: (data: CreateOrganizationData) =>
    apiClient.post<ApiResponse<Organization>>("/admin/organizations", data),

  // Auth - Admin endpoints
  register: (data: {
    organizationId: string;
    email: string;
    username: string;
  }) =>
    apiClient.post<ApiResponse<RegisterResponse>>("/admin/auth/register", data),

  verifyEmail: (data: { token: string }) =>
    apiClient.post<ApiResponse<VerifyEmailResponse>>(
      "/admin/auth/verify-email",
      data
    ),

  setPassword: (data: { userId: string; password: string }) =>
    apiClient.post<ApiResponse<SetPasswordResponse>>(
      "/admin/auth/set-password",
      data
    ),

  login: (data: { email: string; password: string }) =>
    apiClient.post<ApiResponse<LoginResponse>>("/admin/auth/login", data),

  resendVerification: (data: { email: string }) =>
    apiClient.post<ApiResponse<{ message: string }>>(
      "/admin/auth/resend-verification",
      data
    ),

  // Auth - Student endpoints
  studentRegister: (data: {
    organizationId: string;
    email: string;
    username: string;
  }) =>
    apiClient.post<ApiResponse<RegisterResponse>>("/api/auth/register", data),

  studentVerifyEmail: (data: { token: string }) =>
    apiClient.post<ApiResponse<VerifyEmailResponse>>(
      "/api/auth/verify-email",
      data
    ),

  studentSetPassword: (data: { userId: string; password: string }) =>
    apiClient.post<ApiResponse<SetPasswordResponse>>(
      "/api/auth/set-password",
      data
    ),

  studentLogin: (data: { email: string; password: string }) =>
    apiClient.post<ApiResponse<LoginResponse>>("/api/auth/login", data),

  studentResendVerification: (data: { email: string }) =>
    apiClient.post<ApiResponse<{ message: string }>>(
      "/api/auth/resend-verification",
      data
    ),

  // OTP Auth - Client endpoints
  getOtp: (data: {
    countryCode: string;
    phoneNumber: string;
    organizationId: string;
  }) =>
    apiClient.post<ApiResponse<{ isExistingUser: boolean }>>(
      "/api/auth/get-otp",
      data
    ),

  verifyOtp: (data: {
    countryCode: string;
    phoneNumber: string;
    otp: string;
    organizationId: string;
  }) =>
    apiClient.post<
      ApiResponse<{
        accessToken: string;
        refreshToken: string;
        user: {
          id: string;
          phoneNumber: string;
          countryCode: string;
          username: string;
          role: "STUDENT";
          organizationId: string;
          isVerified: boolean;
        };
      }>
    >("/api/auth/verify-otp", data),

  refreshToken: (data: { refreshToken: string }) =>
    apiClient.post<
      ApiResponse<{
        accessToken: string;
        user: unknown;
      }>
    >("/api/auth/refresh-token", data),

  inviteUser: (data: { email: string; username: string }) =>
    apiClient.post<ApiResponse<InviteUserResponse>>(
      "/admin/auth/invite-user",
      data
    ),

  adminRefreshToken: (data: { refreshToken: string }) =>
    apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      "/admin/auth/refresh",
      data
    ),

  // Course endpoints
  getCourses: (page: number = 1, limit: number = 10) =>
    apiClient.get<ApiResponse<unknown>>(
      `/admin/courses?page=${page}&limit=${limit}`
    ),

  createCourse: (data: CreateCourseData) =>
    apiClient.post<ApiResponse<unknown>>("/admin/courses", data),

  // Organization Configuration (Public endpoint)
  getOrganizationConfig: (slug: string) =>
    apiClient.get<OrganizationConfigResponse>(
      `/api/organization-config/${slug}`
    ),

  // Organization Configuration (Admin endpoint)
  createOrganizationConfig: (data: CreateOrganizationConfigData) =>
    apiClient.post<CreateOrganizationConfigResponse>(
      "/admin/organization-config",
      data
    ),

  updateOrganizationConfig: (data: CreateOrganizationConfigData) =>
    apiClient.put<CreateOrganizationConfigResponse>(
      "/admin/organization-config",
      data
    ),

  getOrganizationConfigAdmin: () =>
    apiClient.get<OrganizationConfigResponse>("/admin/organization-config"),

  // Profile endpoints (Client/Student)
  getProfile: () => apiClient.get<ApiResponse<User>>("/api/profile"),
  updateProfile: (data: {
    username?: string;
    profileImg?: string;
    gender?: "Male" | "Female" | "Other";
    phoneNumber?: string;
    address?: {
      city?: string;
      state?: string;
      pincode?: string;
    };
  }) => apiClient.put<ApiResponse<User>>("/api/profile", data),

  // Upload endpoints (Client/Student)
  generateSignedUrl: (data: {
    fileName: string;
    fileType: string;
    fileSize: number;
    folder: string;
  }) =>
    apiClient.post<
      ApiResponse<{
        signedUrl: string;
        key: string;
        bucket: string;
      }>
    >("/api/upload/signed-url", data),
  directUpload: (formData: FormData) =>
    apiClient.post<
      ApiResponse<{
        key: string;
        url: string;
        bucket: string;
        originalName: string;
        size: number;
        mimeType: string;
      }>
    >("/api/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // Order endpoints (Client/Student)
  getOrderHistory: (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) =>
    apiClient.get<OrderHistoryResponse>("/api/orders/history", {
      params,
    }),
};

export default apiClient;
