/**
 * MySQL Adapter
 *
 * Relationales Schema mit einer Tabelle pro Entity.
 * Nutzt das 'mysql2' Paket mit Promise-API.
 *
 * Env-Variablen: DATABASE_URL (MySQL Connection String)
 * Beispiel: mysql://user:pass@localhost:3306/divelog
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mysql2: any = null;

async function getMysql() {
  if (!mysql2) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      mysql2 = require("mysql2/promise");
    } catch {
      throw new Error(
        "MySQL-Adapter benötigt das Paket 'mysql2'. Installiere es mit: npm install mysql2"
      );
    }
  }
  return mysql2;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pool: any = null;

async function getConnection() {
  if (!pool) {
    const m = await getMysql();
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL Umgebungsvariable ist nicht gesetzt (MySQL).");
    }
    pool = m.createPool(connectionString);
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
      id VARCHAR(36) PRIMARY KEY,
      data JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS equipment (
      id VARCHAR(36) PRIMARY KEY,
      data JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS sites (
      id VARCHAR(36) PRIMARY KEY,
      data JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS media (
      id VARCHAR(36) PRIMARY KEY,
      data JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id VARCHAR(36) PRIMARY KEY,
      data JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS community_posts (
      id VARCHAR(36) PRIMARY KEY,
      data JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS members (
      id VARCHAR(36) PRIMARY KEY,
      email VARCHAR(255) UNIQUE,
      data JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

let schemaReady = false;

async function ready() {
  if (!schemaReady) {
    await ensureSchema();
    schemaReady = true;
  }
}

// ── Generic JSON Helpers ──

async function getAll<T>(table: string): Promise<T[]> {
  await ready();
  const db = await getConnection();
  const [rows] = await db.query(`SELECT data FROM ${table} ORDER BY created_at DESC`);
  return (rows as Array<{ data: string | T }>).map((r) =>
    typeof r.data === "string" ? JSON.parse(r.data) : r.data
  );
}

async function getById<T>(table: string, id: string): Promise<T | null> {
  await ready();
  const db = await getConnection();
  const [rows] = await db.query(`SELECT data FROM ${table} WHERE id = ?`, [id]);
  const arr = rows as Array<{ data: string | T }>;
  if (arr.length === 0) return null;
  const raw = arr[0].data;
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

async function insertItem<T>(table: string, item: Omit<T, "id">, extraColumns?: Record<string, unknown>): Promise<T> {
  await ready();
  const db = await getConnection();
  const id = generateId();
  const full = { ...item, id } as T;

  if (extraColumns) {
    const cols = ["id", "data", ...Object.keys(extraColumns)];
    const placeholders = cols.map(() => "?").join(", ");
    const vals = [id, JSON.stringify(full), ...Object.values(extraColumns)];
    await db.query(`INSERT INTO ${table} (${cols.join(", ")}) VALUES (${placeholders})`, vals);
  } else {
    await db.query(`INSERT INTO ${table} (id, data) VALUES (?, ?)`, [id, JSON.stringify(full)]);
  }
  return full;
}

async function updateItem<T>(table: string, id: string, data: Partial<T>): Promise<T | null> {
  await ready();
  const existing = await getById<T>(table, id);
  if (!existing) return null;
  const updated = { ...existing, ...data, id } as T;
  const db = await getConnection();
  await db.query(`UPDATE ${table} SET data = ? WHERE id = ?`, [JSON.stringify(updated), id]);
  return updated;
}

async function deleteItem(table: string, id: string): Promise<boolean> {
  await ready();
  const db = await getConnection();
  const [result] = await db.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
  return ((result as { affectedRows?: number }).affectedRows ?? 0) > 0;
}

export class MysqlAdapter implements Repository {
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
      const [rows] = await db.query(
        `SELECT data FROM notifications WHERE JSON_EXTRACT(data, '$.userId') = ? ORDER BY created_at DESC`,
        [userId]
      );
      return (rows as Array<{ data: string | NotificationItem }>).map((r) =>
        typeof r.data === "string" ? JSON.parse(r.data) : r.data
      );
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
    const [rows] = await db.query(`SELECT data FROM members WHERE email = ?`, [email]);
    const arr = rows as Array<{ data: string | MemberProfile }>;
    if (arr.length === 0) return null;
    return typeof arr[0].data === "string" ? JSON.parse(arr[0].data) : arr[0].data;
  }
  async createMember(member: Omit<MemberProfile, "id">) {
    return insertItem("members", member, { email: (member as { email: string }).email });
  }
  async updateMember(id: string, data: Partial<MemberProfile>) {
    const result = await updateItem<MemberProfile>("members", id, data);
    if (result && data.email) {
      const db = await getConnection();
      await db.query(`UPDATE members SET email = ? WHERE id = ?`, [data.email, id]);
    }
    return result;
  }
  async deleteMember(id: string) { return deleteItem("members", id); }
}
