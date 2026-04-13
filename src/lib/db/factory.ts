/**
 * Repository Factory — wählt das Backend anhand DB_PROVIDER.
 */

import type { DbProvider, Repository } from "./types";

let instance: Repository | null = null;

/**
 * Gibt die aktive Repository-Instanz zurück.
 * Beim ersten Aufruf wird der Adapter anhand von DB_PROVIDER erzeugt.
 */
export function getRepository(): Repository {
  if (instance) return instance;

  const provider = (process.env.DB_PROVIDER || "mock") as DbProvider;

  switch (provider) {
    case "cosmos": {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { CosmosAdapter } = require("./cosmos-adapter");
      instance = new CosmosAdapter();
      break;
    }
    case "postgres": {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { PostgresAdapter } = require("./postgres-adapter");
      instance = new PostgresAdapter();
      break;
    }
    case "mysql": {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { MysqlAdapter } = require("./mysql-adapter");
      instance = new MysqlAdapter();
      break;
    }
    case "mock":
    default: {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { MockAdapter } = require("./mock-adapter");
      instance = new MockAdapter();
      break;
    }
  }

  console.log(`[DB] Repository initialisiert: ${provider}`);
  return instance!;
}
