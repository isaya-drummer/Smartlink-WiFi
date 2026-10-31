import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth(function middleware(req) {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const userRole = (req.auth?.user as { role?: string } | undefined)?.role

  // Allow public access to portal and portal API
  if (
    nextUrl.pathname.startsWith("/portal") ||
    nextUrl.pathname.startsWith("/api/portal")
  ) {
    return NextResponse.next()
  }

  // Allow public access to auth pages
  if (nextUrl.pathname.startsWith("/auth")) {
    return NextResponse.next()
  }

  // Allow webhook routes
  if (nextUrl.pathname.startsWith("/api/webhook")) {
    return NextResponse.next()
  }

  // Protect /super-admin/* — SUPER_ADMIN only
  if (nextUrl.pathname.startsWith("/super-admin")) {
    if (!isLoggedIn || userRole !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/auth/login", nextUrl))
    }
    return NextResponse.next()
  }

  // Protect /admin/* — ADMIN or SUPER_ADMIN
  if (nextUrl.pathname.startsWith("/admin")) {
    if (!isLoggedIn || (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN")) {
      return NextResponse.redirect(new URL("/auth/login", nextUrl))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
} as Parameters<typeof auth>[0])

export const config = {
  matcher: ["/admin/:path*", "/super-admin/:path*", "/portal/:path*"],
}
