/**
 * API Index
 * Central export for all API services and utilities
 */

// ============================================================================
// Export Services
// ============================================================================

export { authService } from "./auth.service";
export { userService } from "./user.service";
export { storyService } from "./story.service";
export { adminService } from "./admin.service";

// ============================================================================
// Export Client & Configuration
// ============================================================================

export { apiClient, tokenManager } from "./client";
export { API_CONFIG, API_ENDPOINTS } from "./config";

// ============================================================================
// Export Error Classes
// ============================================================================

export {
  ApiClientError,
  UnauthorizedError,
  ValidationError,
  NotFoundError,
} from "./client";

// ============================================================================
// Export Types
// ============================================================================

export type {
  // Common types
  ApiResponse,
  ApiError,
  ValidationError as ValidationErrorType,
  PaginationParams,
  PaginatedResponse,
  // Auth types
  RegisterDto,
  RegisterResponseDto,
  LoginDto,
  AuthResponseDto,
  VerifyEmailDto,
  VerifyEmailResponseDto,
  ResendOtpDto,
  ForgotPasswordDto,
  ForgotPasswordResponseDto,
  ResetPasswordDto,
  ResetPasswordResponseDto,
  LogoutResponseDto,
  // User types
  SetupProfileDto,
  UserProfileDto,
  // Story types
  AuthorDto,
  StoryResponseDto,
  StoriesListResponseDto,
  CreateStoryDto,
  UpdateStoryDto,
  // Admin types
  AdminRole,
  AdminLoginDto,
  CreateAdminDto,
  AdminResponseDto,
  UpdateAdminDto,
} from "./types";
