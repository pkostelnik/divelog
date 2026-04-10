/** GET /api/sites — Gibt die Tauchplätze aus den Mock-Daten zurück. */
import { diveSites } from "@/data/mock-data";
import { withErrorHandler } from "../_helpers";

export const GET = withErrorHandler(async () => {
  return Response.json(diveSites, {
    headers: { "Cache-Control": "private, no-store" }
  });
});
