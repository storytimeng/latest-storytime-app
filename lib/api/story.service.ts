/**
 * Story API Service
 * Handles all story-related API calls
 */

import { apiClient } from "./client";
import { API_ENDPOINTS } from "./config";
import type {
  StoriesListResponseDto,
  StoryResponseDto,
  CreateStoryDto,
  UpdateStoryDto,
  PaginationParams,
} from "./types";

// ============================================================================
// Story Service
// ============================================================================

export const storyService = {
  /**
   * Get all stories with pagination
   * GET /stories
   */
  getStories: async (
    params?: PaginationParams
  ): Promise<StoriesListResponseDto> => {
    return apiClient.get<StoriesListResponseDto>(API_ENDPOINTS.stories.list, {
      params,
    });
  },

  /**
   * Get a story by ID
   * GET /stories/:id
   */
  getStoryById: async (id: string): Promise<StoryResponseDto> => {
    return apiClient.get<StoryResponseDto>(API_ENDPOINTS.stories.byId(id));
  },

  /**
   * Create a new story
   * POST /stories/create
   */
  createStory: async (data: CreateStoryDto): Promise<StoryResponseDto> => {
    return apiClient.post<StoryResponseDto>(API_ENDPOINTS.stories.create, data);
  },

  /**
   * Update a story
   * PUT /stories/:id
   */
  updateStory: async (
    id: string,
    data: UpdateStoryDto
  ): Promise<StoryResponseDto> => {
    return apiClient.put<StoryResponseDto>(
      API_ENDPOINTS.stories.byId(id),
      data
    );
  },

  /**
   * Delete a story
   * DELETE /stories/:id
   */
  deleteStory: async (id: string): Promise<void> => {
    return apiClient.delete<void>(API_ENDPOINTS.stories.byId(id));
  },
};
