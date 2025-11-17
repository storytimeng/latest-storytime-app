/**
 * API Configuration
 * Central configuration for API base URL and common settings
 */

export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001",
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
} as const;

export const API_ENDPOINTS = {
  // Auth endpoints
  auth: {
    register: "/auth/register",
    verifyEmail: "/auth/verify-email",
    resendOtp: "/auth/resend-otp",
    login: "/auth/login",
    logout: "/auth/logout",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
  },
  // User endpoints
  users: {
    profile: "/users/profile",
    setupProfile: "/users/profile/setup",
    list: "/users",
    byId: (id: string) => `/users/${id}`,
    suspend: (id: string) => `/users/${id}/suspend`,
    unsuspend: (id: string) => `/users/${id}/unsuspend`,
  },
  // Story endpoints
  stories: {
    list: "/stories",
    create: "/stories/create",
    byId: (id: string) => `/stories/${id}`,
  },
  // Admin endpoints
  admin: {
    login: "/admin/login",
    profile: "/admin/profile",
    list: "/admin",
    byId: (id: string) => `/admin/${id}`,
    suspend: (id: string) => `/admin/${id}/suspend`,
    unsuspend: (id: string) => `/admin/${id}/unsuspend`,
    users: "/admin/users",
    suspendUser: (id: string) => `/admin/users/${id}/suspend`,
    unsuspendUser: (id: string) => `/admin/users/${id}/unsuspend`,
    deleteUser: (id: string) => `/admin/users/${id}`,
    stories: "/admin/stories",
    storyById: (id: string) => `/admin/stories/${id}`,
    suspendStory: (id: string) => `/admin/stories/${id}/suspend`,
    unsuspendStory: (id: string) => `/admin/stories/${id}/unsuspend`,
  },
} as const;
