/** GET /api/dives — Gibt die Liste der Tauchgänge aus den Mock-Daten zurück. */
import { diveLogs } from "@/data/mock-data";
import { withErrorHandler } from "../_helpers";

export const GET = withErrorHandler(async () => {
  return Response.json(diveLogs, {
    headers: { "Cache-Control": "private, no-store" }
  });
});
