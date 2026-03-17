/**
 * Shared API route helpers
 *
 * Provides consistent error responses, safe JSON parsing and a wrapper
 * that catches unexpected exceptions so individual route handlers stay
 * lean.  For the demo all data comes from mock-data so the helpers are
 * intentionally simple.
 */

import { type NextRequest } from "next/server";

/** Standard JSON error response */
export function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

/**
 * Safely parse a JSON request-body.
 * Returns `null` when the body is missing or not valid JSON.
 */
export async function safeParseBody<T = unknown>(request: NextRequest): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

/**
 * Wrap a route handler so uncaught errors return a 500 instead of
 * crashing the process.  Logs the error for observability.
 */
export function withErrorHandler(
  handler: (request: NextRequest) => Promise<Response> | Response
) {
  return async (request: NextRequest): Promise<Response> => {
    try {
      return await handler(request);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[API] Unhandled error in ${request.method} ${request.nextUrl.pathname}:`, message);
      return errorResponse("Internal Server Error", 500);
    }
  };
}
