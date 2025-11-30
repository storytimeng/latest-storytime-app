# Authentication Hooks - Quick Reference

## Usage Examples

### Login
```typescript
import { useLogin } from "@/src/hooks/useAuth";

function LoginComponent() {
  const { trigger, isMutating, error, data } = useLogin();

  const handleLogin = async () => {
    try {
      await trigger({
        emailOrPenName: "user@example.com",
        password: "password123",
        remember: true  // Optional: persist session
      });
      // Success - user is authenticated
    } catch (err) {
      // Handle error
    }
  };
}
```

### Register
```typescript
import { useRegister } from "@/src/hooks/useAuth";

function SignupComponent() {
  const { trigger, isMutating } = useRegister();

  const handleSignup = async () => {
    await trigger({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "securepass",
      dateOfBirth: "1990-01-01",
      agreement: true
    });
  };
}
```

### Verify Email
```typescript
import { useVerifyEmail } from "@/src/hooks/useAuth";

function OTPComponent() {
  const { trigger } = useVerifyEmail();

  const handleVerify = async (otp: string) => {
    await trigger({
      email: "user@example.com",
      otp: otp
    });
    // Auto-authenticated after verification
  };
}
```

### Logout
```typescript
import { useLogout } from "@/src/hooks/useAuth";

function LogoutButton() {
  const { logout } = useLogout();

  return (
    <button onClick={logout}>
      Sign Out
    </button>
  );
}
```

## All Available Hooks

| Hook | Purpose | Request Type |
|------|---------|--------------|
| `useLogin()` | Authenticate user | `{ emailOrPenName, password, remember? }` |
| `useRegister()` | Create new account | `RegisterDto` |
| `useVerifyEmail()` | Verify email with OTP | `{ email, otp }` |
| `useResendOtp()` | Resend verification code | `{ email }` |
| `useForgotPassword()` | Initiate password reset | `{ email }` |
| `useResetPassword()` | Complete password reset | `{ email, otp, newPassword }` |
| `useLogout()` | Sign out user | N/A (call `logout()`) |

## Return Values

All mutation hooks return:
```typescript
{
  trigger: (data: TRequest) => Promise<TResponse>,
  isMutating: boolean,
  error: Error | null,
  data: TResponse | undefined
}
```

`useLogout` returns:
```typescript
{
  logout: () => Promise<void>
}
```
