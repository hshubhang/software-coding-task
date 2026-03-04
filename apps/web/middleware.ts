import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't need auth
  const publicPaths = ["/login", "/signup"];
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // For protected routes, we check client-side (token is in localStorage)
  // Middleware can't access localStorage, so we let the page load
  // and handle auth redirection client-side via the useAuth hook
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
