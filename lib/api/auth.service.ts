/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */

import { apiClient, tokenManager } from "./client";
import { API_ENDPOINTS } from "./config";
import type {
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
} from "./types";

// ============================================================================
// Authentication Service
// ============================================================================

export const authService = {
  /**
   * Register a new user
   * POST /auth/register
   */
  register: async (data: RegisterDto): Promise<RegisterResponseDto> => {
    return apiClient.post<RegisterResponseDto>(
      API_ENDPOINTS.auth.register,
      data,
      {
        skipAuth: true,
      }
    );
  },

  /**
   * Verify email with OTP
   * POST /auth/verify-email
   */
  verifyEmail: async (
    data: VerifyEmailDto
  ): Promise<VerifyEmailResponseDto> => {
    const response = await apiClient.post<VerifyEmailResponseDto>(
      API_ENDPOINTS.auth.verifyEmail,
      data,
      { skipAuth: true }
    );

    // Store token after successful verification
    if (response.access_token) {
      tokenManager.setAccessToken(response.access_token);
    }

    return response;
  },

  /**
   * Resend OTP for email verification
   * POST /auth/resend-otp
   */
  resendOtp: async (data: ResendOtpDto): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>(
      API_ENDPOINTS.auth.resendOtp,
      data,
      { skipAuth: true }
    );
  },

  /**
   * Login user
   * POST /auth/login
   */
  login: async (data: LoginDto): Promise<AuthResponseDto> => {
    const response = await apiClient.post<AuthResponseDto>(
      API_ENDPOINTS.auth.login,
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
   * Request password reset
   * POST /auth/forgot-password
   */
  forgotPassword: async (
    data: ForgotPasswordDto
  ): Promise<ForgotPasswordResponseDto> => {
    return apiClient.post<ForgotPasswordResponseDto>(
      API_ENDPOINTS.auth.forgotPassword,
      data,
      { skipAuth: true }
    );
  },

  /**
   * Reset password with OTP
   * POST /auth/reset-password
   */
  resetPassword: async (
    data: ResetPasswordDto
  ): Promise<ResetPasswordResponseDto> => {
    return apiClient.post<ResetPasswordResponseDto>(
      API_ENDPOINTS.auth.resetPassword,
      data,
      { skipAuth: true }
    );
  },

  /**
   * Logout user
   * POST /auth/logout
   */
  logout: async (): Promise<LogoutResponseDto> => {
    try {
      const response = await apiClient.post<LogoutResponseDto>(
        API_ENDPOINTS.auth.logout
      );
      return response;
    } finally {
      // Always clear tokens, even if the request fails
      tokenManager.clearAll();
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return tokenManager.getAccessToken() !== null;
  },

  /**
   * Get current access token
   */
  getAccessToken: (): string | null => {
    return tokenManager.getAccessToken();
  },
};
