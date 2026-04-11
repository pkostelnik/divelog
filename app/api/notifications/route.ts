/** GET /api/notifications — Gibt Benachrichtigungen zurück. */
import { getRepository } from "@/lib/db";
import { withErrorHandler } from "../_helpers";

export const GET = withErrorHandler(async () => {
  const repo = getRepository();
  const items = await repo.getNotifications();
  return Response.json(items, {
    headers: { "Cache-Control": "private, no-store" }
  });
});
