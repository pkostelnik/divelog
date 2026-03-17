import { type NextRequest, NextResponse } from "next/server";

/**
 * Next.js Middleware
 *
 * Applies additional security measures to API routes and protects
 * authenticated routes. In the current demo setup authentication is
 * handled client-side so the middleware focuses on:
 *
 *  1. Rate-limiting API calls (simple in-memory, per-IP, sliding window)
 *  2. Adding CSRF-style protection for mutating API requests
 *  3. Logging diagnostic information for observability
 *
 * NOTE: For production, replace the in-memory rate-limiter with a
 * distributed store (e.g. Azure Redis Cache) and add real session-based
 * auth checks once NextAuth.js is integrated.
 */

// ---------------------------------------------------------------------------
// Simple in-memory rate limiter (per IP, sliding window)
// ---------------------------------------------------------------------------
const RATE_WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 120; // generous for demo

type RateBucket = { count: number; resetAt: number };
const rateLimitMap = new Map<string, RateBucket>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = rateLimitMap.get(ip);

  if (!bucket || now >= bucket.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  bucket.count += 1;
  return bucket.count > MAX_REQUESTS_PER_WINDOW;
}

// Periodically trim stale entries to prevent memory leaks
if (typeof globalThis !== "undefined") {
  const CLEANUP_INTERVAL_MS = 5 * 60_000;
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of rateLimitMap) {
      if (now >= bucket.resetAt) {
        rateLimitMap.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);

  // Allow the Node.js process to exit even if the interval is pending
  if (typeof timer === "object" && "unref" in timer) {
    timer.unref();
  }
}

// ---------------------------------------------------------------------------
// Middleware handler
// ---------------------------------------------------------------------------
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ---- Rate limiting for API routes ----
  if (pathname.startsWith("/api/")) {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    // ---- CSRF protection for mutating methods ----
    const method = request.method.toUpperCase();
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      const origin = request.headers.get("origin");
      const host = request.headers.get("host");

      // In demo mode we allow requests without origin (e.g. Postman, curl)
      // but block cross-origin requests from different hosts
      if (origin && host) {
        const originUrl = new URL(origin);
        const hostHostname = host.split(":")[0];
        if (originUrl.hostname !== hostHostname) {
          return NextResponse.json(
            { error: "Cross-origin requests are not allowed." },
            { status: 403 }
          );
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply to API routes and dashboard pages
    "/api/:path*",
    "/dashboard/:path*"
  ]
};
