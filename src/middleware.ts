import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/modules/auth/auth.service";
import { authConfig } from "@/config/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") || 
    pathname.startsWith("/favicon") ||
    pathname.includes(".png") ||
    pathname.includes(".svg")
  ) {
    return NextResponse.next();
  }

  const isPublicPath = authConfig.publicPaths.some((path) => pathname.startsWith(path));

  const sessionToken = request.cookies.get(authConfig.cookieName)?.value;
  const session = sessionToken ? await verifySessionToken(sessionToken) : null;

  if (!session && !isPublicPath) {
    const loginUrl = new URL(authConfig.loginPath, request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session && pathname === authConfig.loginPath) {
    return NextResponse.redirect(new URL(authConfig.dashboardPath, request.url));
  }

  if (session && pathname === "/") {
    return NextResponse.redirect(new URL(authConfig.dashboardPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|manifest).*)",
  ],
};
