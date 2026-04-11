/** GET /api/community — Gibt Community-Beiträge zurück. */
import { getRepository } from "@/lib/db";
import { withErrorHandler } from "../_helpers";

export const GET = withErrorHandler(async () => {
  const repo = getRepository();
  const posts = await repo.getCommunityPosts();
  return Response.json(posts, {
    headers: { "Cache-Control": "private, no-store" }
  });
});
