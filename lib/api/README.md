# API Library

Production-ready API client library for Storytime frontend application.

## Structure

```
lib/api/
├── config.ts          # API configuration and endpoints
├── types.ts           # TypeScript types from OpenAPI schema
├── client.ts          # Base HTTP client with interceptors
├── auth.service.ts    # Authentication API service
├── user.service.ts    # User API service
├── story.service.ts   # Story API service
├── admin.service.ts   # Admin API service
├── hooks.ts           # React hooks for API calls
├── index.ts           # Central exports
└── README.md          # This file
```

## Features

- ✅ **Type-safe**: Full TypeScript support with auto-generated types
- ✅ **Error Handling**: Custom error classes with proper error responses
- ✅ **Authentication**: Automatic token management and injection
- ✅ **Request Timeout**: Configurable timeout with abort controller
- ✅ **React Hooks**: Custom hooks for easy integration with React components
- ✅ **Environment Config**: Supports environment variables for base URL
- ✅ **Production Ready**: Best practices for error handling, retries, and logging

## Configuration

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.storytime.ng
```

If not set, defaults to `http://localhost:3001`

## Usage Examples

### Basic Service Usage

```typescript
import { authService, storyService, userService } from "@/lib/api";

// Register a new user
try {
  const user = await authService.register({
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    password: "securePassword123",
    dateOfBirth: "1990-01-01",
    agreement: true,
  });
  console.log("User registered:", user);
} catch (error) {
  console.error("Registration failed:", error);
}

// Login
try {
  const { access_token } = await authService.login({
    email: "john@example.com",
    password: "securePassword123",
  });
  console.log("Logged in, token stored automatically");
} catch (error) {
  console.error("Login failed:", error);
}

// Get user profile
try {
  const profile = await userService.getProfile();
  console.log("User profile:", profile);
} catch (error) {
  console.error("Failed to get profile:", error);
}

// Get stories with pagination
try {
  const stories = await storyService.getStories({ page: 1, limit: 10 });
  console.log("Stories:", stories);
} catch (error) {
  console.error("Failed to get stories:", error);
}
```

### Using React Hooks

```typescript
"use client";

import { useApi, useMutation, getErrorMessage } from "@/lib/api/hooks";
import { authService, storyService } from "@/lib/api";
import type { LoginDto, CreateStoryDto } from "@/lib/api";

function LoginForm() {
  const { loading, error, execute } = useApi(authService.login);

  const handleSubmit = async (formData: LoginDto) => {
    const result = await execute(formData);
    if (result) {
      console.log("Login successful!");
      // Redirect or update UI
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        handleSubmit({
          email: formData.get("email") as string,
          password: formData.get("password") as string,
        });
      }}
    >
      {error && <div className="error">{getErrorMessage(error)}</div>}
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}

function CreateStoryForm() {
  const { data, loading, error, mutate } = useMutation(
    storyService.createStory
  );

  const handleSubmit = async (storyData: CreateStoryDto) => {
    const result = await mutate(storyData);
    if (result) {
      console.log("Story created:", result);
      // Redirect or show success message
    }
  };

  return (
    <div>
      {/* Form implementation */}
      {loading && <p>Creating story...</p>}
      {error && <p className="error">{getErrorMessage(error)}</p>}
      {data && <p>Story created successfully!</p>}
    </div>
  );
}
```

### Error Handling

```typescript
import {
  authService,
  UnauthorizedError,
  ValidationError,
  NotFoundError,
  ApiClientError,
} from "@/lib/api";

try {
  await authService.login({ email: "test@example.com", password: "wrong" });
} catch (error) {
  if (error instanceof UnauthorizedError) {
    console.error("Invalid credentials");
  } else if (error instanceof ValidationError) {
    console.error("Validation errors:", error.apiError?.error?.validation);
  } else if (error instanceof NotFoundError) {
    console.error("Resource not found");
  } else if (error instanceof ApiClientError) {
    console.error("API Error:", error.message, error.statusCode);
  } else {
    console.error("Unexpected error:", error);
  }
}
```

### Server Components (Next.js 14+)

```typescript
// app/stories/page.tsx
import { storyService } from "@/lib/api";

export default async function StoriesPage() {
  try {
    const { stories } = await storyService.getStories({ page: 1, limit: 10 });

    return (
      <div>
        {stories.map((story) => (
          <article key={story.id}>
            <h2>{story.title}</h2>
            <p>{story.content}</p>
          </article>
        ))}
      </div>
    );
  } catch (error) {
    return <div>Error loading stories</div>;
  }
}
```

### Admin Operations

```typescript
import { adminService } from "@/lib/api";

// Admin login
await adminService.login({
  email: "admin@storytime.ng",
  password: "adminPassword",
});

// Get all users (admin only)
const users = await adminService.getAllUsers();

// Suspend a user
await adminService.suspendUser("user-id");

// Get all stories with pagination
const stories = await adminService.getAllStories({ page: 1, limit: 20 });

// Suspend a story
await adminService.suspendStory("story-id");
```

## API Services

### Authentication Service (`authService`)

- `register(data)` - Register new user
- `verifyEmail(data)` - Verify email with OTP
- `resendOtp(data)` - Resend verification OTP
- `login(data)` - Login user
- `forgotPassword(data)` - Request password reset
- `resetPassword(data)` - Reset password with OTP
- `logout()` - Logout and clear tokens
- `isAuthenticated()` - Check if user is logged in
- `getAccessToken()` - Get current access token

### User Service (`userService`)

- `getProfile()` - Get current user profile
- `setupProfile(data)` - Setup profile (onboarding)
- `getAllUsers()` - Get all users
- `getUserById(id)` - Get user by ID
- `deleteUser(id)` - Delete user (soft delete)
- `suspendUser(id)` - Suspend user
- `unsuspendUser(id)` - Unsuspend user

### Story Service (`storyService`)

- `getStories(params)` - Get paginated stories
- `getStoryById(id)` - Get story by ID
- `createStory(data)` - Create new story
- `updateStory(id, data)` - Update story
- `deleteStory(id)` - Delete story

### Admin Service (`adminService`)

- **Authentication**
  - `login(data)` - Admin login
  - `getProfile()` - Get admin profile
- **Admin Management**

  - `createAdmin(data)` - Create new admin (super admin only)
  - `getAllAdmins()` - Get all admins
  - `getAdminById(id)` - Get admin by ID
  - `updateAdmin(id, data)` - Update admin
  - `deleteAdmin(id)` - Delete admin
  - `suspendAdmin(id)` - Suspend admin
  - `unsuspendAdmin(id)` - Unsuspend admin

- **User Management**

  - `getAllUsers()` - Get all users
  - `suspendUser(id)` - Suspend user
  - `unsuspendUser(id)` - Unsuspend user
  - `deleteUser(id)` - Delete user

- **Story Management**
  - `getAllStories(params)` - Get all stories
  - `updateStory(id, data)` - Update story
  - `deleteStory(id)` - Delete story
  - `suspendStory(id)` - Suspend story
  - `unsuspendStory(id)` - Unsuspend story

## Token Management

Tokens are automatically managed:

- Stored in `localStorage` on successful login/verification
- Automatically attached to authenticated requests
- Cleared on logout or 401 errors

Manual token management:

```typescript
import { tokenManager } from "@/lib/api";

// Get token
const token = tokenManager.getAccessToken();

// Set token
tokenManager.setAccessToken("your-token");

// Remove token
tokenManager.removeAccessToken();

// Clear all tokens
tokenManager.clearAll();
```

## Best Practices

1. **Always use try-catch** when calling API services
2. **Use React hooks** for component-based API calls
3. **Handle specific error types** for better UX
4. **Use TypeScript types** for type safety
5. **Check authentication state** before protected operations
6. **Implement loading states** for better user feedback
7. **Use environment variables** for API base URL

## Error Types

- `ApiClientError` - Base error class
- `UnauthorizedError` - 401 errors (auto-clears tokens)
- `ValidationError` - 400 validation errors
- `NotFoundError` - 404 errors
- Request timeout - 408 after 30 seconds

## Contributing

When adding new endpoints:

1. Add endpoint to `config.ts`
2. Add types to `types.ts`
3. Create/update service in appropriate `.service.ts` file
4. Export from `index.ts`
5. Update this README
