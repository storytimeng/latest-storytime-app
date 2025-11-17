/**
 * User API Service
 * Handles all user-related API calls
 */

import { apiClient } from "./client";
import { API_ENDPOINTS } from "./config";
import type { SetupProfileDto, UserProfileDto } from "./types";

// ============================================================================
// User Service
// ============================================================================

export const userService = {
  /**
   * Get current user profile
   * GET /users/profile
   */
  getProfile: async (): Promise<UserProfileDto> => {
    return apiClient.get<UserProfileDto>(API_ENDPOINTS.users.profile);
  },

  /**
   * Setup user profile (onboarding)
   * POST /users/profile/setup
   */
  setupProfile: async (data: SetupProfileDto): Promise<UserProfileDto> => {
    return apiClient.post<UserProfileDto>(
      API_ENDPOINTS.users.setupProfile,
      data
    );
  },

  /**
   * Get all users (for testing/verification)
   * GET /users
   */
  getAllUsers: async (): Promise<UserProfileDto[]> => {
    return apiClient.get<UserProfileDto[]>(API_ENDPOINTS.users.list);
  },

  /**
   * Get a user by ID
   * GET /users/:id
   */
  getUserById: async (id: string): Promise<UserProfileDto> => {
    return apiClient.get<UserProfileDto>(API_ENDPOINTS.users.byId(id));
  },

  /**
   * Delete a user account (soft delete)
   * DELETE /users/:id
   */
  deleteUser: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(API_ENDPOINTS.users.byId(id));
  },

  /**
   * Suspend a user account
   * PATCH /users/:id/suspend
   */
  suspendUser: async (id: string): Promise<{ message: string }> => {
    return apiClient.patch<{ message: string }>(
      API_ENDPOINTS.users.suspend(id)
    );
  },

  /**
   * Unsuspend a user account
   * PATCH /users/:id/unsuspend
   */
  unsuspendUser: async (id: string): Promise<{ message: string }> => {
    return apiClient.patch<{ message: string }>(
      API_ENDPOINTS.users.unsuspend(id)
    );
  },
};
