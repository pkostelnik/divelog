/** GET /api/equipment — Gibt die Ausrüstungsliste zurück. */
import { getRepository } from "@/lib/db";
import { withErrorHandler } from "../_helpers";

export const GET = withErrorHandler(async () => {
  const repo = getRepository();
  const items = await repo.getEquipment();
  return Response.json(items, {
    headers: { "Cache-Control": "private, no-store" }
  });
});
