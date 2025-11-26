/**
 * Modern authentication hooks using HeyAPI SDK
 * Provides type-safe wrappers around authentication endpoints
 */

import { useCallback } from "react";
import useSWRMutation from "swr/mutation";
import { useSWRConfig } from "swr";
import Cookies from "js-cookie";

import {
  authControllerLogin,
  authControllerRegister,
  authControllerVerifyEmail,
  authControllerResendOtp,
  authControllerForgotPassword,
  authControllerResetPassword,
  authControllerLogout,
} from "../client/sdk.gen";
import { setAuthToken, useAuthStore } from "../stores/useAuthStore";
import type {
  LoginDto,
  AuthResponseDto,
  RegisterDto,
  RegisterResponseDto,
  VerifyEmailDto,
  ResendOtpDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from "../client/types.gen";

/**
 * Generic auth mutation helper
 * Handles common patterns: error handling, type safety, and response unwrapping
 * 
 * HeyAPI returns: { data?: T, error?: unknown, response: Response }
 */
function useAuthMutation<TRequest, TResponse>(
  mutationFn: (body: TRequest) => Promise<{ data?: TResponse; error?: unknown; response: Response }>,
  options?: {
    onSuccess?: (data: TResponse) => void | Promise<void>;
  }
) {
  const mutation = useSWRMutation(
    // Use a unique key per mutation to avoid conflicts
    `auth-mutation-${mutationFn.name}`,
    async (_key: string, { arg }: { arg: TRequest }) => {
      const response = await mutationFn(arg);
      
      if (response.error) {
        throw response.error;
      }
      
      if (!response.data) {
        throw new Error("No data returned from mutation");
      }

      if (options?.onSuccess) {
        await options.onSuccess(response.data);
      }

      return response.data;
    },
    {
      throwOnError: true,
    }
  );

  return {
    trigger: mutation.trigger,
    isMutating: mutation.isMutating,
    error: mutation.error,
    data: mutation.data,
  };
}

/**
 * Login hook
 * Authenticates user with email/pen name and password
 * Optionally persists session with "remember me" functionality
 */
export function useLogin() {
  const { mutate } = useSWRConfig();

  return useAuthMutation<LoginDto & { remember?: boolean }, AuthResponseDto>(
    async (credentials) => {
      const { remember, ...body } = credentials;
      const response = await authControllerLogin({ body });

      // Handle token persistence
      if (response.data?.access_token) {
        setAuthToken(response.data.access_token);
        
        if (remember) {
          Cookies.set("authToken", response.data.access_token, {
            expires: 30,
            secure: true,
            sameSite: "strict",
          });
        }
      }

      return response;
    },
    {
      onSuccess: () => {
        // Revalidate user profile after successful login
        mutate("profile");
      },
    }
  );
}

/**
 * Register hook
 * Creates a new user account
 * User must verify email before accessing the platform
 */
export function useRegister() {
  return useAuthMutation<RegisterDto, RegisterResponseDto>(
    async (userData) => {
      return await authControllerRegister({ body: userData });
    }
  );
}

/**
 * Verify Email hook
 * Verifies user email with OTP code
 * Returns access token for immediate authentication
 */
export function useVerifyEmail() {
  const { mutate } = useSWRConfig();

  return useAuthMutation<VerifyEmailDto, unknown>(
    async (verificationData) => {
      const response = await authControllerVerifyEmail({ body: verificationData });

      // Auto-authenticate after email verification
      if (response.data?.access_token) {
        setAuthToken(response.data.access_token);
      }

      return response;
    },
    {
      onSuccess: () => {
        mutate("profile");
      },
    }
  );
}

/**
 * Resend OTP hook
 * Requests a new OTP code for email verification
 */
export function useResendOtp() {
  return useAuthMutation<ResendOtpDto, unknown>(
    async (emailData) => {
      return await authControllerResendOtp({ body: emailData });
    }
  );
}

/**
 * Forgot Password hook
 * Initiates password reset flow by sending OTP to user's email
 * Stores email transiently for reset completion
 */
export function useForgotPassword() {
  return useAuthMutation<ForgotPasswordDto, unknown>(
    async (emailData) => {
      // Store email in auth store for reset flow
      useAuthStore.getState().setReset(emailData.email, undefined);
      return await authControllerForgotPassword({ body: emailData });
    }
  );
}

/**
 * Reset Password hook
 * Completes password reset with OTP and new password
 * Clears transient reset data on success
 */
export function useResetPassword() {
  return useAuthMutation<ResetPasswordDto, unknown>(
    async (resetData) => {
      return await authControllerResetPassword({ body: resetData });
    },
    {
      onSuccess: () => {
        // Clear transient reset data
        useAuthStore.getState().clearReset();
      },
    }
  );
}

/**
 * Logout hook
 * Invalidates current session and clears auth state
 */
export function useLogout() {
  const { mutate } = useSWRConfig();

  const logout = useCallback(async () => {
    try {
      await authControllerLogout();
    } finally {
      // Clear auth state even if API call fails
      useAuthStore.getState().clear();
      Cookies.remove("authToken");
      mutate("profile", undefined, { revalidate: false });
    }
  }, [mutate]);

  return { logout };
}
