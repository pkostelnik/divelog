/**
 * Repository Interface — DiveLog Studio
 *
 * Definiert die Schnittstelle, die jedes Datenbank-Backend
 * implementieren muss. Die API-Routen sprechen ausschließlich
 * gegen dieses Interface — niemals direkt gegen eine DB.
 *
 * Backend-Wahl: Umgebungsvariable DB_PROVIDER (cosmos | postgres | mysql | mock)
 */

import type {
  DiveLogPreview,
  EquipmentItem,
  DiveSite,
  MediaItem,
  NotificationItem,
  CommunityPost,
  MemberProfile,
} from "@/data/mock-data";

/** Alle unterstützten DB-Provider */
export type DbProvider = "cosmos" | "postgres" | "mysql" | "mock";

/**
 * Zentrales Repository-Interface.
 * Jeder Adapter (Cosmos, Postgres, MySQL, Mock) implementiert diese Methoden.
 */
export interface Repository {
  // ── Dives ──────────────────────────────────────
  getDives(): Promise<DiveLogPreview[]>;
  getDiveById(id: string): Promise<DiveLogPreview | null>;
  createDive(dive: Omit<DiveLogPreview, "id">): Promise<DiveLogPreview>;
  updateDive(id: string, dive: Partial<DiveLogPreview>): Promise<DiveLogPreview | null>;
  deleteDive(id: string): Promise<boolean>;

  // ── Equipment ──────────────────────────────────
  getEquipment(): Promise<EquipmentItem[]>;
  getEquipmentById(id: string): Promise<EquipmentItem | null>;
  createEquipment(item: Omit<EquipmentItem, "id">): Promise<EquipmentItem>;
  updateEquipment(id: string, item: Partial<EquipmentItem>): Promise<EquipmentItem | null>;
  deleteEquipment(id: string): Promise<boolean>;

  // ── Sites ──────────────────────────────────────
  getSites(): Promise<DiveSite[]>;
  getSiteById(id: string): Promise<DiveSite | null>;
  createSite(site: Omit<DiveSite, "id">): Promise<DiveSite>;
  updateSite(id: string, site: Partial<DiveSite>): Promise<DiveSite | null>;
  deleteSite(id: string): Promise<boolean>;

  // ── Media ──────────────────────────────────────
  getMedia(): Promise<MediaItem[]>;
  getMediaById(id: string): Promise<MediaItem | null>;
  createMedia(item: Omit<MediaItem, "id">): Promise<MediaItem>;
  deleteMedia(id: string): Promise<boolean>;

  // ── Notifications ──────────────────────────────
  getNotifications(userId?: string): Promise<NotificationItem[]>;
  createNotification(item: Omit<NotificationItem, "id">): Promise<NotificationItem>;
  deleteNotification(id: string): Promise<boolean>;

  // ── Community ──────────────────────────────────
  getCommunityPosts(): Promise<CommunityPost[]>;
  getCommunityPostById(id: string): Promise<CommunityPost | null>;
  createCommunityPost(post: Omit<CommunityPost, "id">): Promise<CommunityPost>;
  updateCommunityPost(id: string, post: Partial<CommunityPost>): Promise<CommunityPost | null>;
  deleteCommunityPost(id: string): Promise<boolean>;

  // ── Members ────────────────────────────────────
  getMembers(): Promise<MemberProfile[]>;
  getMemberById(id: string): Promise<MemberProfile | null>;
  getMemberByEmail(email: string): Promise<MemberProfile | null>;
  createMember(member: Omit<MemberProfile, "id">): Promise<MemberProfile>;
  updateMember(id: string, member: Partial<MemberProfile>): Promise<MemberProfile | null>;
  deleteMember(id: string): Promise<boolean>;
}
