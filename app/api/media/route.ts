/** GET /api/media — Gibt Medieneinträge zurück. */
import { getRepository } from "@/lib/db";
import { withErrorHandler } from "../_helpers";

export const GET = withErrorHandler(async () => {
  const repo = getRepository();
  const items = await repo.getMedia();
  return Response.json(items, {
    headers: { "Cache-Control": "private, no-store" }
  });
});
