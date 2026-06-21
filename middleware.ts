import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  STORYTIME_SHELL_HEADER,
  storytimeShellFromPathname,
} from "@/config/desktopRoutes";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set(
    STORYTIME_SHELL_HEADER,
    storytimeShellFromPathname(request.nextUrl.pathname),
  );
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|splash|images|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
