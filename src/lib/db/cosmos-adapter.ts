/**
 * Azure Cosmos DB Adapter
 *
 * Nutzt die bestehende 2-Container-Architektur:
 * - users-and-social (partitioniert nach userId)
 * - dive-content (partitioniert nach ownerId)
 *
 * Env-Variablen: AZURE_COSMOS_DB_ENDPOINT, AZURE_COSMOS_DB_KEY, AZURE_COSMOS_DB_DATABASE
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
import {
  queryDiveContent,
  queryUsersSocial,
  createDiveContentItem,
  createUsersSocialItem,
  updateDiveContentItem,
  updateUsersSocialItem,
  deleteDiveContentItem,
  deleteUsersSocialItem,
  type CosmosEntity,
} from "../cosmos-db";

function generateId(): string {
  return crypto.randomUUID();
}

export class CosmosAdapter implements Repository {
  // ── Dives ──
  async getDives() {
    return queryDiveContent<DiveLogPreview & CosmosEntity>(
      "SELECT * FROM c WHERE c.type = 'dive' ORDER BY c.date DESC"
    );
  }
  async getDiveById(id: string) {
    const results = await queryDiveContent<DiveLogPreview & CosmosEntity>(
      "SELECT * FROM c WHERE c.id = @id AND c.type = 'dive'",
      [{ name: "@id", value: id }]
    );
    return results[0] ?? null;
  }
  async createDive(dive: Omit<DiveLogPreview, "id">) {
    const item = { ...dive, id: generateId() } as DiveLogPreview & CosmosEntity;
    const created = await createDiveContentItem(item);
    return created as unknown as DiveLogPreview;
  }
  async updateDive(id: string, data: Partial<DiveLogPreview>) {
    const existing = await this.getDiveById(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, id } as DiveLogPreview & CosmosEntity;
    await updateDiveContentItem(id, existing.ownerId, updated);
    return updated;
  }
  async deleteDive(id: string) {
    const existing = await this.getDiveById(id);
    if (!existing) return false;
    await deleteDiveContentItem(id, existing.ownerId);
    return true;
  }

  // ── Equipment ──
  async getEquipment() {
    return queryDiveContent<EquipmentItem & CosmosEntity>(
      "SELECT * FROM c WHERE c.type = 'equipment'"
    );
  }
  async getEquipmentById(id: string) {
    const results = await queryDiveContent<EquipmentItem & CosmosEntity>(
      "SELECT * FROM c WHERE c.id = @id AND c.type = 'equipment'",
      [{ name: "@id", value: id }]
    );
    return results[0] ?? null;
  }
  async createEquipment(item: Omit<EquipmentItem, "id">) {
    const entry = { ...item, id: generateId() } as EquipmentItem & CosmosEntity;
    const created = await createDiveContentItem(entry);
    return created as unknown as EquipmentItem;
  }
  async updateEquipment(id: string, data: Partial<EquipmentItem>) {
    const existing = await this.getEquipmentById(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, id } as EquipmentItem & CosmosEntity;
    await updateDiveContentItem(id, existing.ownerId, updated);
    return updated;
  }
  async deleteEquipment(id: string) {
    const existing = await this.getEquipmentById(id);
    if (!existing) return false;
    await deleteDiveContentItem(id, existing.ownerId);
    return true;
  }

  // ── Sites ──
  async getSites() {
    return queryDiveContent<DiveSite & CosmosEntity>(
      "SELECT * FROM c WHERE c.type = 'site'"
    );
  }
  async getSiteById(id: string) {
    const results = await queryDiveContent<DiveSite & CosmosEntity>(
      "SELECT * FROM c WHERE c.id = @id AND c.type = 'site'",
      [{ name: "@id", value: id }]
    );
    return results[0] ?? null;
  }
  async createSite(site: Omit<DiveSite, "id">) {
    const entry = { ...site, id: generateId() } as DiveSite & CosmosEntity;
    const created = await createDiveContentItem(entry);
    return created as unknown as DiveSite;
  }
  async updateSite(id: string, data: Partial<DiveSite>) {
    const existing = await this.getSiteById(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, id } as DiveSite & CosmosEntity;
    await updateDiveContentItem(id, existing.ownerId, updated);
    return updated;
  }
  async deleteSite(id: string) {
    const existing = await this.getSiteById(id);
    if (!existing) return false;
    await deleteDiveContentItem(id, existing.ownerId);
    return true;
  }

  // ── Media ──
  async getMedia() {
    return queryDiveContent<MediaItem & CosmosEntity>(
      "SELECT * FROM c WHERE c.type = 'media'"
    );
  }
  async getMediaById(id: string) {
    const results = await queryDiveContent<MediaItem & CosmosEntity>(
      "SELECT * FROM c WHERE c.id = @id AND c.type = 'media'",
      [{ name: "@id", value: id }]
    );
    return results[0] ?? null;
  }
  async createMedia(item: Omit<MediaItem, "id">) {
    const entry = { ...item, id: generateId() } as MediaItem & CosmosEntity;
    const created = await createDiveContentItem(entry);
    return created as unknown as MediaItem;
  }
  async deleteMedia(id: string) {
    const existing = await this.getMediaById(id);
    if (!existing) return false;
    await deleteDiveContentItem(id, existing.ownerId);
    return true;
  }

  // ── Notifications ──
  async getNotifications(userId?: string) {
    if (userId) {
      return queryUsersSocial<NotificationItem & CosmosEntity>(
        "SELECT * FROM c WHERE c.type = 'notification' AND c.userId = @userId ORDER BY c.timestamp DESC",
        [{ name: "@userId", value: userId }]
      );
    }
    return queryUsersSocial<NotificationItem & CosmosEntity>(
      "SELECT * FROM c WHERE c.type = 'notification' ORDER BY c.timestamp DESC"
    );
  }
  async createNotification(item: Omit<NotificationItem, "id">) {
    const entry = { ...item, id: generateId() } as NotificationItem & CosmosEntity;
    const created = await createUsersSocialItem(entry);
    return created as unknown as NotificationItem;
  }
  async deleteNotification(id: string) {
    const results = await queryUsersSocial<NotificationItem & CosmosEntity>(
      "SELECT * FROM c WHERE c.id = @id AND c.type = 'notification'",
      [{ name: "@id", value: id }]
    );
    const existing = results[0];
    if (!existing) return false;
    await deleteUsersSocialItem(id, existing.userId);
    return true;
  }

  // ── Community ──
  async getCommunityPosts() {
    return queryDiveContent<CommunityPost & CosmosEntity>(
      "SELECT * FROM c WHERE c.type = 'blog'"
    );
  }
  async getCommunityPostById(id: string) {
    const results = await queryDiveContent<CommunityPost & CosmosEntity>(
      "SELECT * FROM c WHERE c.id = @id AND c.type = 'blog'",
      [{ name: "@id", value: id }]
    );
    return results[0] ?? null;
  }
  async createCommunityPost(post: Omit<CommunityPost, "id">) {
    const entry = { ...post, id: generateId() } as CommunityPost & CosmosEntity;
    const created = await createDiveContentItem(entry);
    return created as unknown as CommunityPost;
  }
  async updateCommunityPost(id: string, data: Partial<CommunityPost>) {
    const existing = await this.getCommunityPostById(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, id } as CommunityPost & CosmosEntity;
    await updateDiveContentItem(id, existing.ownerId, updated);
    return updated;
  }
  async deleteCommunityPost(id: string) {
    const existing = await this.getCommunityPostById(id);
    if (!existing) return false;
    await deleteDiveContentItem(id, existing.ownerId);
    return true;
  }

  // ── Members ──
  async getMembers() {
    return queryUsersSocial<MemberProfile & CosmosEntity>(
      "SELECT * FROM c WHERE c.type = 'user'"
    );
  }
  async getMemberById(id: string) {
    const results = await queryUsersSocial<MemberProfile & CosmosEntity>(
      "SELECT * FROM c WHERE c.id = @id AND c.type = 'user'",
      [{ name: "@id", value: id }]
    );
    return results[0] ?? null;
  }
  async getMemberByEmail(email: string) {
    const results = await queryUsersSocial<MemberProfile & CosmosEntity>(
      "SELECT * FROM c WHERE c.email = @email AND c.type = 'user'",
      [{ name: "@email", value: email }]
    );
    return results[0] ?? null;
  }
  async createMember(member: Omit<MemberProfile, "id">) {
    const entry = { ...member, id: generateId() } as MemberProfile & CosmosEntity;
    const created = await createUsersSocialItem(entry);
    return created as unknown as MemberProfile;
  }
  async updateMember(id: string, data: Partial<MemberProfile>) {
    const existing = await this.getMemberById(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, id } as MemberProfile & CosmosEntity;
    await updateUsersSocialItem(id, existing.userId, updated);
    return updated;
  }
  async deleteMember(id: string) {
    const existing = await this.getMemberById(id);
    if (!existing) return false;
    await deleteUsersSocialItem(id, existing.userId);
    return true;
  }
}
