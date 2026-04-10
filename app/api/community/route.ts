/** GET /api/community — Gibt Community-Beiträge aus den Mock-Daten zurück. */
import { communityPosts } from "@/data/mock-data";
import { withErrorHandler } from "../_helpers";

export const GET = withErrorHandler(async () => {
  return Response.json(communityPosts, {
    headers: { "Cache-Control": "private, no-store" }
  });
});
