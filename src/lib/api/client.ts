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

// Response interceptor to handle 401 errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      deleteCookie(QUEZT_AUTH_KEY);
      window.location.href = "/login";
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
      email: string;
      username: string;
      role: string;
      organizationId: string;
    }
  ) => {
    const authData = {
      token,
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

  inviteUser: (data: { email: string; username: string }) =>
    apiClient.post<ApiResponse<InviteUserResponse>>(
      "/admin/auth/invite-user",
      data
    ),

  refreshToken: (data: { refreshToken: string }) =>
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
};

export default apiClient;
