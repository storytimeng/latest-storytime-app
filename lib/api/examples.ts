/**
 * Example Usage of Storytime API
 * Demonstrates how to use the API services in various scenarios
 */

import {
  authService,
  userService,
  storyService,
  adminService,
  UnauthorizedError,
  ValidationError,
  NotFoundError,
  ApiClientError,
} from "@/lib/api";

import type {
  RegisterDto,
  LoginDto,
  CreateStoryDto,
  SetupProfileDto,
} from "@/lib/api";

// ============================================================================
// Authentication Examples
// ============================================================================

export async function registerExample() {
  try {
    const registerData: RegisterDto = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "SecurePass123!",
      dateOfBirth: "1990-01-01",
      agreement: true,
    };

    const user = await authService.register(registerData);
    console.log("User registered:", user);
    // Next step: Verify email with OTP
    return user;
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error("Validation errors:", error.apiError?.error?.validation);
    } else if (error instanceof ApiClientError) {
      console.error("Registration failed:", error.message);
    }
    throw error;
  }
}

export async function verifyEmailExample(email: string, otp: string) {
  try {
    const response = await authService.verifyEmail({ email, otp });
    console.log("Email verified, token stored:", response.access_token);
    // Token is automatically stored, proceed to profile setup
    return response;
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error("Verification failed:", error.message);
    }
    throw error;
  }
}

export async function loginExample() {
  try {
    const loginData: LoginDto = {
      email: "john@example.com",
      password: "SecurePass123!",
    };

    const response = await authService.login(loginData);
    console.log("Login successful, token stored automatically");
    return response;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      console.error("Invalid credentials");
    } else if (error instanceof ApiClientError) {
      console.error("Login failed:", error.message);
    }
    throw error;
  }
}

export async function forgotPasswordExample(email: string) {
  try {
    const response = await authService.forgotPassword({ email });
    console.log("Password reset OTP sent:", response.message);
    return response;
  } catch (error) {
    if (error instanceof NotFoundError) {
      console.error("Email not found");
    }
    throw error;
  }
}

export async function resetPasswordExample(
  email: string,
  otp: string,
  newPassword: string
) {
  try {
    const response = await authService.resetPassword({
      email,
      otp,
      newPassword,
    });
    console.log("Password reset successful:", response.message);
    return response;
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error("Password reset failed:", error.message);
    }
    throw error;
  }
}

// ============================================================================
// User Profile Examples
// ============================================================================

export async function setupProfileExample() {
  try {
    const profileData: SetupProfileDto = {
      penName: "John Writer",
      profilePicture: "https://example.com/avatar.jpg",
      genres: ["Romance", "Thriller", "Mystery"],
      timeToRead: "12:00 pm",
      timeToWrite: "8:00 pm",
      reminder: "daily",
    };

    const profile = await userService.setupProfile(profileData);
    console.log("Profile setup complete:", profile);
    return profile;
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error("Invalid profile data:", error.apiError?.error?.validation);
    }
    throw error;
  }
}

export async function getProfileExample() {
  try {
    const profile = await userService.getProfile();
    console.log("User profile:", profile);
    return profile;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      console.error("Not authenticated");
      // Redirect to login
    }
    throw error;
  }
}

// ============================================================================
// Story Examples
// ============================================================================

export async function createStoryExample(authorId: string) {
  try {
    const storyData: CreateStoryDto = {
      title: "The Enchanted Forest",
      content: "Once upon a time, in a mystical forest filled with wonder...",
      tags: ["fantasy", "adventure", "magic"],
      authorId: authorId,
      imageUrl: "https://example.com/story-cover.jpg",
    };

    const story = await storyService.createStory(storyData);
    console.log("Story created:", story);
    return story;
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error("Invalid story data:", error.apiError?.error?.validation);
    } else if (error instanceof NotFoundError) {
      console.error("Author not found");
    }
    throw error;
  }
}

export async function getStoriesExample(page = 1, limit = 10) {
  try {
    const response = await storyService.getStories({ page, limit });
    console.log("Stories:", response.stories);
    console.log("Total pages:", response.totalPages);
    return response;
  } catch (error) {
    console.error("Failed to fetch stories:", error);
    throw error;
  }
}

export async function getStoryByIdExample(storyId: string) {
  try {
    const story = await storyService.getStoryById(storyId);
    console.log("Story details:", story);
    return story;
  } catch (error) {
    if (error instanceof NotFoundError) {
      console.error("Story not found");
    }
    throw error;
  }
}

export async function updateStoryExample(storyId: string) {
  try {
    const updates = {
      title: "The Enchanted Forest - Updated",
      tags: ["fantasy", "adventure", "magic", "mystery"],
    };

    const story = await storyService.updateStory(storyId, updates);
    console.log("Story updated:", story);
    return story;
  } catch (error) {
    if (error instanceof NotFoundError) {
      console.error("Story not found");
    }
    throw error;
  }
}

export async function deleteStoryExample(storyId: string) {
  try {
    await storyService.deleteStory(storyId);
    console.log("Story deleted successfully");
  } catch (error) {
    if (error instanceof NotFoundError) {
      console.error("Story not found");
    }
    throw error;
  }
}

// ============================================================================
// Admin Examples
// ============================================================================

export async function adminLoginExample() {
  try {
    const response = await adminService.login({
      email: "admin@storytime.ng",
      password: "AdminPass123!",
    });
    console.log("Admin logged in, token stored");
    return response;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      console.error("Invalid admin credentials");
    }
    throw error;
  }
}

export async function adminGetAllUsersExample() {
  try {
    const users = await adminService.getAllUsers();
    console.log("All users:", users);
    return users;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      console.error("Admin authentication required");
    }
    throw error;
  }
}

export async function adminSuspendUserExample(userId: string) {
  try {
    const response = await adminService.suspendUser(userId);
    console.log("User suspended:", response.message);
    return response;
  } catch (error) {
    if (error instanceof NotFoundError) {
      console.error("User not found");
    }
    throw error;
  }
}

export async function adminGetAllStoriesExample(page = 1, limit = 20) {
  try {
    const response = await adminService.getAllStories({ page, limit });
    console.log("All stories:", response.stories);
    return response;
  } catch (error) {
    console.error("Failed to fetch stories:", error);
    throw error;
  }
}

export async function adminSuspendStoryExample(storyId: string) {
  try {
    const response = await adminService.suspendStory(storyId);
    console.log("Story suspended:", response.message);
    return response;
  } catch (error) {
    if (error instanceof NotFoundError) {
      console.error("Story not found");
    }
    throw error;
  }
}

// ============================================================================
// Authentication State Check
// ============================================================================

export function checkAuthenticationExample() {
  const isAuthenticated = authService.isAuthenticated();
  console.log("User authenticated:", isAuthenticated);

  if (isAuthenticated) {
    const token = authService.getAccessToken();
    console.log("Access token available:", !!token);
  }

  return isAuthenticated;
}

// ============================================================================
// Complete User Journey Example
// ============================================================================

export async function completeUserJourneyExample() {
  try {
    // 1. Register
    console.log("Step 1: Registering user...");
    const user = await registerExample();

    // 2. Verify email (in real app, OTP comes from email)
    console.log("Step 2: Verifying email...");
    await verifyEmailExample(user.email, "123456");

    // 3. Setup profile
    console.log("Step 3: Setting up profile...");
    await setupProfileExample();

    // 4. Get profile
    console.log("Step 4: Fetching profile...");
    const profile = await getProfileExample();

    // 5. Create a story
    console.log("Step 5: Creating a story...");
    const story = await createStoryExample(profile.authorId);

    // 6. Get stories
    console.log("Step 6: Fetching stories...");
    await getStoriesExample(1, 10);

    // 7. Update story
    console.log("Step 7: Updating story...");
    await updateStoryExample(story.id);

    console.log("User journey completed successfully!");
  } catch (error) {
    console.error("User journey failed:", error);
  }
}
