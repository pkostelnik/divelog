/** GET /api/sites — Gibt die Tauchplätze zurück. */
import { getRepository } from "@/lib/db";
import { withErrorHandler } from "../_helpers";

export const GET = withErrorHandler(async () => {
  const repo = getRepository();
  const sites = await repo.getSites();
  return Response.json(sites, {
    headers: { "Cache-Control": "private, no-store" }
  });
});
