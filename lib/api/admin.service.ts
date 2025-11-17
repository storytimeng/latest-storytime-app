/**
 * Admin API Service
 * Handles all admin-related API calls
 */

import { apiClient, tokenManager } from "./client";
import { API_ENDPOINTS } from "./config";
import type {
  AdminLoginDto,
  AuthResponseDto,
  CreateAdminDto,
  AdminResponseDto,
  UpdateAdminDto,
  UserProfileDto,
  StoriesListResponseDto,
  StoryResponseDto,
  UpdateStoryDto,
  PaginationParams,
} from "./types";

// ============================================================================
// Admin Service
// ============================================================================

export const adminService = {
  // ========================================
  // Admin Authentication
  // ========================================

  /**
   * Admin login
   * POST /admin/login
   */
  login: async (data: AdminLoginDto): Promise<AuthResponseDto> => {
    const response = await apiClient.post<AuthResponseDto>(
      API_ENDPOINTS.admin.login,
      data,
      { skipAuth: true }
    );

    // Store token after successful login
    if (response.access_token) {
      tokenManager.setAccessToken(response.access_token);
    }

    return response;
  },

  /**
   * Get current admin profile
   * GET /admin/profile
   */
  getProfile: async (): Promise<AdminResponseDto> => {
    return apiClient.get<AdminResponseDto>(API_ENDPOINTS.admin.profile);
  },

  // ========================================
  // Admin Management
  // ========================================

  /**
   * Create a new admin (Super Admin only)
   * POST /admin
   */
  createAdmin: async (data: CreateAdminDto): Promise<AdminResponseDto> => {
    return apiClient.post<AdminResponseDto>(API_ENDPOINTS.admin.list, data);
  },

  /**
   * Get all admins
   * GET /admin
   */
  getAllAdmins: async (): Promise<AdminResponseDto[]> => {
    return apiClient.get<AdminResponseDto[]>(API_ENDPOINTS.admin.list);
  },

  /**
   * Get an admin by ID
   * GET /admin/:id
   */
  getAdminById: async (id: string): Promise<AdminResponseDto> => {
    return apiClient.get<AdminResponseDto>(API_ENDPOINTS.admin.byId(id));
  },

  /**
   * Update an admin (Super Admin only)
   * PATCH /admin/:id
   */
  updateAdmin: async (
    id: string,
    data: UpdateAdminDto
  ): Promise<AdminResponseDto> => {
    return apiClient.patch<AdminResponseDto>(
      API_ENDPOINTS.admin.byId(id),
      data
    );
  },

  /**
   * Delete an admin (Super Admin only)
   * DELETE /admin/:id
   */
  deleteAdmin: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(API_ENDPOINTS.admin.byId(id));
  },

  /**
   * Suspend an admin (Super Admin only)
   * PATCH /admin/:id/suspend
   */
  suspendAdmin: async (id: string): Promise<{ message: string }> => {
    return apiClient.patch<{ message: string }>(
      API_ENDPOINTS.admin.suspend(id)
    );
  },

  /**
   * Unsuspend an admin (Super Admin only)
   * PATCH /admin/:id/unsuspend
   */
  unsuspendAdmin: async (id: string): Promise<{ message: string }> => {
    return apiClient.patch<{ message: string }>(
      API_ENDPOINTS.admin.unsuspend(id)
    );
  },

  // ========================================
  // User Management (Admin)
  // ========================================

  /**
   * Get all users (Admin only)
   * GET /admin/users
   */
  getAllUsers: async (): Promise<UserProfileDto[]> => {
    return apiClient.get<UserProfileDto[]>(API_ENDPOINTS.admin.users);
  },

  /**
   * Suspend a user account (Admin only)
   * PATCH /admin/users/:id/suspend
   */
  suspendUser: async (id: string): Promise<{ message: string }> => {
    return apiClient.patch<{ message: string }>(
      API_ENDPOINTS.admin.suspendUser(id)
    );
  },

  /**
   * Unsuspend a user account (Admin only)
   * PATCH /admin/users/:id/unsuspend
   */
  unsuspendUser: async (id: string): Promise<{ message: string }> => {
    return apiClient.patch<{ message: string }>(
      API_ENDPOINTS.admin.unsuspendUser(id)
    );
  },

  /**
   * Delete a user account (Admin only)
   * DELETE /admin/users/:id
   */
  deleteUser: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(
      API_ENDPOINTS.admin.deleteUser(id)
    );
  },

  // ========================================
  // Story Management (Admin)
  // ========================================

  /**
   * Get all stories (Admin only)
   * GET /admin/stories
   */
  getAllStories: async (
    params?: PaginationParams
  ): Promise<StoriesListResponseDto> => {
    return apiClient.get<StoriesListResponseDto>(API_ENDPOINTS.admin.stories, {
      params,
    });
  },

  /**
   * Update a story (Admin only)
   * PATCH /admin/stories/:id
   */
  updateStory: async (
    id: string,
    data: UpdateStoryDto
  ): Promise<StoryResponseDto> => {
    return apiClient.patch<StoryResponseDto>(
      API_ENDPOINTS.admin.storyById(id),
      data
    );
  },

  /**
   * Delete a story (Admin only)
   * DELETE /admin/stories/:id
   */
  deleteStory: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(
      API_ENDPOINTS.admin.storyById(id)
    );
  },

  /**
   * Suspend a story (Admin only)
   * PATCH /admin/stories/:id/suspend
   */
  suspendStory: async (id: string): Promise<{ message: string }> => {
    return apiClient.patch<{ message: string }>(
      API_ENDPOINTS.admin.suspendStory(id)
    );
  },

  /**
   * Unsuspend a story (Admin only)
   * PATCH /admin/stories/:id/unsuspend
   */
  unsuspendStory: async (id: string): Promise<{ message: string }> => {
    return apiClient.patch<{ message: string }>(
      API_ENDPOINTS.admin.unsuspendStory(id)
    );
  },
};
