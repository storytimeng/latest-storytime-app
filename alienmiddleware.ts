import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that should redirect to /home if user is already authenticated
const authRoutes = [
  "/",
  "/auth",
  "/auth/login",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/onboarding",
];

// Routes that require authentication - redirect to / (login) if not authenticated
const protectedRoutes = [
  "/library",
  "/pen",
  "/my-stories",
  "/new-story",
  "/edit-story",
  "/notification",
  "/profile",
  "/settings",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get("authToken")?.value;

  // Check if user is authenticated (has a valid token cookie)
  const isAuthenticated = !!authToken;

  // Check if current path is an auth route (should redirect to home if logged in)
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || (route !== "/" && pathname.startsWith(route + "/"))
  );

  // Check if current path is a protected route (should redirect to login if not logged in)
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // If authenticated and trying to access auth routes, redirect to home
  if (isAuthenticated && isAuthRoute) {
    console.log(`[Middleware] Authenticated user accessing ${pathname}, redirecting to /home`);
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // If not authenticated and trying to access protected routes, redirect to login
  if (!isAuthenticated && isProtectedRoute) {
    console.log(`[Middleware] Unauthenticated user accessing ${pathname}, redirecting to /`);
    const loginUrl = new URL("/", request.url);
    // Optionally store the intended destination for redirect after login
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icons, images
     */
    "/((?!api|_next/static|_next/image|favicon.ico|icons|images|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};
