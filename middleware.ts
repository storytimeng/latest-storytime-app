import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  STORYTIME_SHELL_HEADER,
  storytimeShellFromPathname,
  mobilePathToDesktop,
  desktopPathToMobile,
  isDesktopAppPath,
} from "@/config/desktopRoutes";
import {
  SHELL_PREFERENCE_COOKIE,
  parseShellPreference,
} from "@/lib/shellRouting";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const preference = parseShellPreference(
    request.cookies.get(SHELL_PREFERENCE_COOKIE)?.value,
  );

  if (preference === "desktop" && !isDesktopAppPath(pathname)) {
    const desktopPath = mobilePathToDesktop(pathname);
    if (desktopPath) {
      const url = request.nextUrl.clone();
      url.pathname = desktopPath.split("?")[0];
      return NextResponse.redirect(url);
    }
  }

  if (preference === "mobile" && isDesktopAppPath(pathname)) {
    const mobilePath = desktopPathToMobile(pathname);
    if (mobilePath) {
      const url = request.nextUrl.clone();
      url.pathname = mobilePath.split("?")[0];
      return NextResponse.redirect(url);
    }
  }

  const response = NextResponse.next();
  response.headers.set(
    STORYTIME_SHELL_HEADER,
    storytimeShellFromPathname(pathname),
  );
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|splash|images|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
