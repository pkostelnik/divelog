/**
 * Azure Cosmos DB Client Configuration
 * 2-Container Architecture:
 * - users-and-social: User profiles, friends, messages, notifications (partitioned by userId)
 * - dive-content: Dives, equipment, media, sites, blogs, forum posts (partitioned by ownerId)
 *
 * Environment variables (matching .env.example):
 *   AZURE_COSMOS_DB_ENDPOINT, AZURE_COSMOS_DB_KEY, AZURE_COSMOS_DB_DATABASE
 */

import { CosmosClient, SqlParameter } from "@azure/cosmos";

if (!process.env.AZURE_COSMOS_DB_ENDPOINT) {
  throw new Error("AZURE_COSMOS_DB_ENDPOINT environment variable is not set");
}

if (!process.env.AZURE_COSMOS_DB_KEY) {
  throw new Error("AZURE_COSMOS_DB_KEY environment variable is not set");
}

if (!process.env.AZURE_COSMOS_DB_DATABASE) {
  throw new Error("AZURE_COSMOS_DB_DATABASE environment variable is not set");
}

const endpoint = process.env.AZURE_COSMOS_DB_ENDPOINT;
const key = process.env.AZURE_COSMOS_DB_KEY;
const databaseId = process.env.AZURE_COSMOS_DB_DATABASE;

// Singleton Cosmos Client
let cosmosClient: CosmosClient | null = null;

export function getCosmosClient(): CosmosClient {
  if (!cosmosClient) {
    cosmosClient = new CosmosClient({
      endpoint,
      key,
      connectionPolicy: {
        requestTimeout: 10000,
        enableEndpointDiscovery: true,
      },
    });
  }
  return cosmosClient;
}

// Container IDs
export const CONTAINER_USERS_SOCIAL = "users-and-social";
export const CONTAINER_DIVE_CONTENT = "dive-content";

// Helper functions to get containers
export function getUsersSocialContainer() {
  const client = getCosmosClient();
  return client.database(databaseId).container(CONTAINER_USERS_SOCIAL);
}

export function getDiveContentContainer() {
  const client = getCosmosClient();
  return client.database(databaseId).container(CONTAINER_DIVE_CONTENT);
}

// Type guards for entity discrimination
export type EntityType = 
  | "user" 
  | "notification" 
  | "friend" 
  | "message"
  | "dive" 
  | "equipment" 
  | "media" 
  | "site" 
  | "blog" 
  | "forum";

export interface CosmosEntity {
  id: string;
  type: EntityType;
  userId?: string; // For users-and-social container
  ownerId?: string; // For dive-content container
}

/**
 * Default retry options for Cosmos DB operations.
 * Handles 429 (Request Rate Too Large) with exponential back-off.
 */
const DEFAULT_MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 500;

async function withRetry<T>(operation: () => Promise<T>, maxRetries = DEFAULT_MAX_RETRIES): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: unknown) {
      lastError = error;
      const statusCode = (error as { code?: number }).code;
      const retryAfterMs = (error as { retryAfterInMs?: number }).retryAfterInMs;

      if (statusCode === 429 && attempt < maxRetries) {
        const delay = retryAfterMs ?? RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
        console.warn(`[Cosmos DB] 429 rate-limited – retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      break;
    }
  }
  throw lastError;
}

// Query helpers
export async function queryUsersSocial<T extends CosmosEntity>(
  query: string,
  parameters?: { name: string; value: unknown }[]
) {
  return withRetry(async () => {
    const container = getUsersSocialContainer();
    const { resources } = await container.items
      .query<T>({
        query,
        parameters: parameters as SqlParameter[],
      })
      .fetchAll();
    return resources;
  });
}

export async function queryDiveContent<T extends CosmosEntity>(
  query: string,
  parameters?: { name: string; value: unknown }[]
) {
  return withRetry(async () => {
    const container = getDiveContentContainer();
    const { resources } = await container.items
      .query<T>({
        query,
        parameters: parameters as SqlParameter[],
      })
      .fetchAll();
    return resources;
  });
}

// CRUD helpers for users-and-social container
export async function createUsersSocialItem<T extends CosmosEntity>(item: T) {
  return withRetry(async () => {
    const container = getUsersSocialContainer();
    const { resource } = await container.items.create(item);
    return resource;
  });
}

export async function readUsersSocialItem<T extends CosmosEntity>(
  id: string,
  userId: string
) {
  return withRetry(async () => {
    const container = getUsersSocialContainer();
    const { resource } = await container.item(id, userId).read<T>();
    return resource;
  });
}

export async function updateUsersSocialItem<T extends CosmosEntity>(
  id: string,
  userId: string,
  item: T
) {
  return withRetry(async () => {
    const container = getUsersSocialContainer();
    const { resource } = await container.item(id, userId).replace(item);
    return resource;
  });
}

export async function deleteUsersSocialItem(id: string, userId: string) {
  return withRetry(async () => {
    const container = getUsersSocialContainer();
    await container.item(id, userId).delete();
  });
}

// CRUD helpers for dive-content container
export async function createDiveContentItem<T extends CosmosEntity>(item: T) {
  return withRetry(async () => {
    const container = getDiveContentContainer();
    const { resource } = await container.items.create(item);
    return resource;
  });
}

export async function readDiveContentItem<T extends CosmosEntity>(
  id: string,
  ownerId: string
) {
  return withRetry(async () => {
    const container = getDiveContentContainer();
    const { resource } = await container.item(id, ownerId).read<T>();
    return resource;
  });
}

export async function updateDiveContentItem<T extends CosmosEntity>(
  id: string,
  ownerId: string,
  item: T
) {
  return withRetry(async () => {
    const container = getDiveContentContainer();
    const { resource } = await container.item(id, ownerId).replace(item);
    return resource;
  });
}

export async function deleteDiveContentItem(id: string, ownerId: string) {
  return withRetry(async () => {
    const container = getDiveContentContainer();
    await container.item(id, ownerId).delete();
  });
}
