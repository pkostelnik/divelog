/**
 * PostgreSQL Adapter
 *
 * Relationales Schema mit einer Tabelle pro Entity.
 * Nutzt den offiziellen 'pg' Client.
 *
 * Env-Variablen: DATABASE_URL (PostgreSQL Connection String)
 * Beispiel: postgres://user:pass@localhost:5432/divelog
 *
 * Schema-Migration: Tabellen werden beim ersten Zugriff erstellt (idempotent).
 */

import type { Repository } from "./types";
import type {
  DiveLogPreview,
  EquipmentItem,
  DiveSite,
  MediaItem,
  NotificationItem,
  CommunityPost,
  MemberProfile,
} from "@/data/mock-data";

// Lazy-Import: pg wird nur geladen, wenn der Adapter tatsächlich genutzt wird.
// Falls pg nicht installiert ist, wirft der Konstruktor einen klaren Fehler.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Pool: any;

async function getPool() {
  if (!Pool) {
    try {
      // Dynamic require — pg ist eine optionale Abhängigkeit
      const pg = require("pg");
      Pool = pg.Pool;
    } catch {
      throw new Error(
        "PostgreSQL-Adapter benötigt das Paket 'pg'. Installiere es mit: npm install pg @types/pg"
      );
    }
  }
  return Pool;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pool: any = null;

async function getConnection() {
  if (!pool) {
    const PoolClass = await getPool();
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL Umgebungsvariable ist nicht gesetzt (PostgreSQL).");
    }
    pool = new PoolClass({ connectionString });
  }
  return pool;
}

function generateId(): string {
  return crypto.randomUUID();
}

/** Erstellt alle Tabellen, falls sie nicht existieren. */
async function ensureSchema() {
  const db = await getConnection();
  await db.query(`
    CREATE TABLE IF NOT EXISTS dives (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS equipment (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS sites (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS community_posts (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}

let schemaReady = false;

async function ready() {
  if (!schemaReady) {
    await ensureSchema();
    schemaReady = true;
  }
}

// ── Generic JSONB Helpers ──

async function getAll<T>(table: string): Promise<T[]> {
  await ready();
  const db = await getConnection();
  const { rows } = await db.query(`SELECT data FROM ${table} ORDER BY created_at DESC`);
  return rows.map((r: { data: T }) => r.data);
}

async function getById<T>(table: string, id: string): Promise<T | null> {
  await ready();
  const db = await getConnection();
  const { rows } = await db.query(`SELECT data FROM ${table} WHERE id = $1`, [id]);
  return rows[0]?.data ?? null;
}

async function insertItem<T>(table: string, item: Omit<T, "id">, extraColumns?: Record<string, unknown>): Promise<T> {
  await ready();
  const db = await getConnection();
  const id = generateId();
  const full = { ...item, id } as T;
  const cols = ["id", "data"];
  const vals = [id, JSON.stringify(full)];
  let paramIdx = 3;
  if (extraColumns) {
    for (const [col, val] of Object.entries(extraColumns)) {
      cols.push(col);
      vals.push(val as string);
      paramIdx++;
    }
  }
  const placeholders = vals.map((_, i) => `$${i + 1}`).join(", ");
  await db.query(`INSERT INTO ${table} (${cols.join(", ")}) VALUES (${placeholders})`, vals);
  return full;
}

async function updateItem<T>(table: string, id: string, data: Partial<T>): Promise<T | null> {
  await ready();
  const existing = await getById<T>(table, id);
  if (!existing) return null;
  const updated = { ...existing, ...data, id } as T;
  const db = await getConnection();
  await db.query(`UPDATE ${table} SET data = $1 WHERE id = $2`, [JSON.stringify(updated), id]);
  return updated;
}

async function deleteItem(table: string, id: string): Promise<boolean> {
  await ready();
  const db = await getConnection();
  const { rowCount } = await db.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
  return (rowCount ?? 0) > 0;
}

export class PostgresAdapter implements Repository {
  // ── Dives ──
  async getDives() { return getAll<DiveLogPreview>("dives"); }
  async getDiveById(id: string) { return getById<DiveLogPreview>("dives", id); }
  async createDive(dive: Omit<DiveLogPreview, "id">) { return insertItem("dives", dive); }
  async updateDive(id: string, data: Partial<DiveLogPreview>) { return updateItem("dives", id, data); }
  async deleteDive(id: string) { return deleteItem("dives", id); }

  // ── Equipment ──
  async getEquipment() { return getAll<EquipmentItem>("equipment"); }
  async getEquipmentById(id: string) { return getById<EquipmentItem>("equipment", id); }
  async createEquipment(item: Omit<EquipmentItem, "id">) { return insertItem("equipment", item); }
  async updateEquipment(id: string, data: Partial<EquipmentItem>) { return updateItem("equipment", id, data); }
  async deleteEquipment(id: string) { return deleteItem("equipment", id); }

  // ── Sites ──
  async getSites() { return getAll<DiveSite>("sites"); }
  async getSiteById(id: string) { return getById<DiveSite>("sites", id); }
  async createSite(site: Omit<DiveSite, "id">) { return insertItem("sites", site); }
  async updateSite(id: string, data: Partial<DiveSite>) { return updateItem("sites", id, data); }
  async deleteSite(id: string) { return deleteItem("sites", id); }

  // ── Media ──
  async getMedia() { return getAll<MediaItem>("media"); }
  async getMediaById(id: string) { return getById<MediaItem>("media", id); }
  async createMedia(item: Omit<MediaItem, "id">) { return insertItem("media", item); }
  async deleteMedia(id: string) { return deleteItem("media", id); }

  // ── Notifications ──
  async getNotifications(userId?: string) {
    await ready();
    const db = await getConnection();
    if (userId) {
      const { rows } = await db.query(
        `SELECT data FROM notifications WHERE data->>'userId' = $1 ORDER BY created_at DESC`,
        [userId]
      );
      return rows.map((r: { data: NotificationItem }) => r.data);
    }
    return getAll<NotificationItem>("notifications");
  }
  async createNotification(item: Omit<NotificationItem, "id">) { return insertItem("notifications", item); }
  async deleteNotification(id: string) { return deleteItem("notifications", id); }

  // ── Community ──
  async getCommunityPosts() { return getAll<CommunityPost>("community_posts"); }
  async getCommunityPostById(id: string) { return getById<CommunityPost>("community_posts", id); }
  async createCommunityPost(post: Omit<CommunityPost, "id">) { return insertItem("community_posts", post); }
  async updateCommunityPost(id: string, data: Partial<CommunityPost>) { return updateItem("community_posts", id, data); }
  async deleteCommunityPost(id: string) { return deleteItem("community_posts", id); }

  // ── Members ──
  async getMembers() { return getAll<MemberProfile>("members"); }
  async getMemberById(id: string) { return getById<MemberProfile>("members", id); }
  async getMemberByEmail(email: string) {
    await ready();
    const db = await getConnection();
    const { rows } = await db.query(`SELECT data FROM members WHERE email = $1`, [email]);
    return rows[0]?.data ?? null;
  }
  async createMember(member: Omit<MemberProfile, "id">) {
    return insertItem("members", member, { email: (member as { email: string }).email });
  }
  async updateMember(id: string, data: Partial<MemberProfile>) {
    const result = await updateItem<MemberProfile>("members", id, data);
    if (result && data.email) {
      const db = await getConnection();
      await db.query(`UPDATE members SET email = $1 WHERE id = $2`, [data.email, id]);
    }
    return result;
  }
  async deleteMember(id: string) { return deleteItem("members", id); }
}
