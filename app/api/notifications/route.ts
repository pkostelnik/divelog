/** GET /api/notifications — Gibt Benachrichtigungen aus den Mock-Daten zurück. */
import { notifications } from "@/data/mock-data";
import { withErrorHandler } from "../_helpers";

export const GET = withErrorHandler(async () => {
  return Response.json(notifications, {
    headers: { "Cache-Control": "private, no-store" }
  });
});
