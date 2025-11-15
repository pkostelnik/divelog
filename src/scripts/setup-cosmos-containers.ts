/**
 * Setup script to create Cosmos DB containers for 2-container architecture
 * 
 * Run this script once to initialize your Cosmos DB database:
 * npx tsx src/scripts/setup-cosmos-containers.ts
 */

import { CosmosClient } from "@azure/cosmos";

// Load environment variables
const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = process.env.COSMOS_DATABASE_NAME || "divelog-prod";

if (!endpoint || !key) {
  console.error("❌ Missing COSMOS_ENDPOINT or COSMOS_KEY environment variables");
  process.exit(1);
}

async function setupContainers() {
  console.log("🚀 Starting Cosmos DB container setup...\n");

  const client = new CosmosClient({ endpoint, key });

  // Create database if it doesn't exist
  console.log(`📦 Creating database: ${databaseId}`);
  const { database } = await client.databases.createIfNotExists({
    id: databaseId,
  });
  console.log("✅ Database ready\n");

  // Container 1: users-and-social
  console.log("📦 Creating container: users-and-social");
  const { container: usersSocial } = await database.containers.createIfNotExists({
    id: "users-and-social",
    partitionKey: {
      paths: ["/userId"],
      version: 2, // Hierarchical partition keys
    },
    indexingPolicy: {
      automatic: true,
      indexingMode: "consistent",
      includedPaths: [{ path: "/*" }],
      excludedPaths: [{ path: '/"_etag"/?' }],
    },
  });
  console.log("✅ Container 'users-and-social' ready");
  console.log("   - Partition Key: /userId");
  console.log("   - Entities: users, notifications, friends, messages\n");

  // Container 2: dive-content
  console.log("📦 Creating container: dive-content");
  const { container: diveContent } = await database.containers.createIfNotExists({
    id: "dive-content",
    partitionKey: {
      paths: ["/ownerId"],
      version: 2, // Hierarchical partition keys
    },
    indexingPolicy: {
      automatic: true,
      indexingMode: "consistent",
      includedPaths: [{ path: "/*" }],
      excludedPaths: [{ path: '/"_etag"/?' }],
    },
  });
  console.log("✅ Container 'dive-content' ready");
  console.log("   - Partition Key: /ownerId");
  console.log("   - Entities: dives, equipment, media, sites, blogs, forum posts\n");

  console.log("🎉 Cosmos DB setup completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`   Database: ${databaseId}`);
  console.log("   Containers: 2");
  console.log("   - users-and-social (partitioned by userId)");
  console.log("   - dive-content (partitioned by ownerId)");
}

setupContainers()
  .then(() => {
    console.log("\n✅ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error setting up containers:", error);
    process.exit(1);
  });
