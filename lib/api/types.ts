/**
 * API Types
 * TypeScript types generated from Swagger/OpenAPI schema
 */

// ============================================================================
// Common Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  statusType: "success" | "fail" | "error";
  statusCode: number;
  message: string;
  data?: T;
  timestamp: string;
  path: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  statusType: "fail" | "error";
  statusCode: number;
  message: string;
  error?: {
    validation?: ValidationError[];
  };
  timestamp: string;
  path: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================================
// Authentication DTOs
// ============================================================================

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dateOfBirth: string; // ISO date format
  agreement: boolean;
}

export interface RegisterResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  agreement: boolean;
  authorId: string;
  readerId: string;
  createdAt: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  access_token: string;
}

export interface VerifyEmailDto {
  email: string;
  otp: string;
}

export interface VerifyEmailResponseDto {
  message: string;
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isEmailVerified: boolean;
  };
}

export interface ResendOtpDto {
  email: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ForgotPasswordResponseDto {
  statusType: string;
  statusCode: number;
  message: string;
  data: {
    email: string;
  };
  timestamp: string;
  path: string;
}

export interface ResetPasswordDto {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ResetPasswordResponseDto {
  statusType: string;
  statusCode: number;
  message: string;
  data: {
    email: string;
  };
  timestamp: string;
  path: string;
}

export interface LogoutResponseDto {
  message: string;
  timestamp: string;
}

// ============================================================================
// User DTOs
// ============================================================================

export interface SetupProfileDto {
  penName?: string;
  profilePicture?: string;
  genres?: string[];
  timeToRead?: string;
  timeToWrite?: string;
  reminder?: string;
}

export interface UserProfileDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  penName?: string;
  profilePicture?: string;
  genres?: string[];
  timeToRead?: string;
  timeToWrite?: string;
  reminder?: string;
  isEmailVerified: boolean;
  authorId: string;
  readerId: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Story DTOs
// ============================================================================

export interface AuthorDto {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface StoryResponseDto {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  author: AuthorDto;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoriesListResponseDto {
  stories: StoryResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateStoryDto {
  title: string;
  content: string;
  tags?: string[];
  authorId: string;
  imageUrl?: string;
}

export interface UpdateStoryDto {
  title?: string;
  content?: string;
  tags?: string[];
  imageUrl?: string;
}

// ============================================================================
// Admin DTOs
// ============================================================================

export type AdminRole =
  | "super_admin"
  | "admin"
  | "marketing"
  | "developer"
  | "designer"
  | "finance";

export interface AdminLoginDto {
  email: string;
  password: string;
}

export interface CreateAdminDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: AdminRole;
}

export interface AdminResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: AdminRole;
  isSuspended: boolean;
  suspendedAt: string | null;
  suspendedBy: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAdminDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: AdminRole;
}
