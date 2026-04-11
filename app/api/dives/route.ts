/** GET /api/dives — Gibt die Liste der Tauchgänge zurück. */
import { getRepository } from "@/lib/db";
import { withErrorHandler } from "../_helpers";

export const GET = withErrorHandler(async () => {
  const repo = getRepository();
  const dives = await repo.getDives();
  return Response.json(dives, {
    headers: { "Cache-Control": "private, no-store" }
  });
});
