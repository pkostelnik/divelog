/** GET /api/media — Gibt Medieneinträge aus den Mock-Daten zurück. */
import { media } from "@/data/mock-data";
import { withErrorHandler } from "../_helpers";

export const GET = withErrorHandler(async () => {
  return Response.json(media, {
    headers: { "Cache-Control": "private, no-store" }
  });
});
