/**
 * Re-export HeyAPI types for convenience
 * This file exists only to provide a single import point for auth-related types
 */

export type {
  AuthControllerLoginData,
  AuthControllerLoginResponses,
  AuthControllerRegisterData,
  AuthControllerRegisterResponses,
  AuthControllerVerifyEmailData,
  AuthControllerVerifyEmailResponses,
  AuthControllerResendOtpData,
  AuthControllerResendOtpResponses,
  AuthControllerForgotPasswordData,
  AuthControllerForgotPasswordResponses,
  AuthControllerResetPasswordData,
  AuthControllerResetPasswordResponses,
  AuthControllerLogoutData,
  AuthControllerLogoutResponses,
} from "../client/types.gen";
