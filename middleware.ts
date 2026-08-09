import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { updateSession } from "@/utils/supabase/middleware";

async function verifyAdminToken(token?: string) {
  if (!token) return false;
  const secretStr = process.env.JWT_SECRET;
  if (!secretStr) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secretStr));
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow the Supabase auth callback to proceed without interference
  if (pathname.startsWith("/auth/callback")) {
    return NextResponse.next();
  }

  // Handle admin routes
  if (pathname.startsWith("/admin")) {
    const adminToken = request.cookies.get("admin_session")?.value;
    const isAdmin = await verifyAdminToken(adminToken);

    if (!isAdmin && pathname !== "/admin/login") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    if (isAdmin && pathname === "/admin/login") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    return NextResponse.next();
  }

  // Handle user authentication
  const { supabaseResponse, user } = await updateSession(request);

  const publicPaths = ["/", "/login", "/register", "/forgot-password"];
  const isPublicRoute = publicPaths.includes(pathname) ||
    publicPaths.some((p) => p !== "/" && pathname.startsWith(p));

  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return supabaseResponse;
}
export const config = {
  matcher: [
     /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};