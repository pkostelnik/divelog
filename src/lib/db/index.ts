/**
 * Öffentlicher Export — alle API-Routen importieren von hier.
 *
 * Verwendung:
 *   import { getRepository } from "@/lib/db";
 *   const repo = getRepository();
 *   const dives = await repo.getDives();
 */

export { getRepository } from "./factory";
export type { Repository, DbProvider } from "./types";
