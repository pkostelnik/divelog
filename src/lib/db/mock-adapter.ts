/**
 * Mock-Adapter — verwendet die bestehenden In-Memory-Daten.
 * Aktiv wenn DB_PROVIDER=mock oder nicht gesetzt (Demo-Modus).
 */

import type { Repository } from "./types";
import {
  diveLogs,
  equipment,
  diveSites,
  media,
  notifications,
  communityPosts,
  members,
  type DiveLogPreview,
  type EquipmentItem,
  type DiveSite,
  type MediaItem,
  type NotificationItem,
  type CommunityPost,
  type MemberProfile,
} from "@/data/mock-data";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// Mutable copies of mock data
const store = {
  dives: [...diveLogs],
  equipment: [...equipment],
  sites: [...diveSites],
  media: [...media],
  notifications: [...notifications],
  community: [...communityPosts],
  members: [...members],
};

export class MockAdapter implements Repository {
  // ── Dives ──
  async getDives() { return store.dives; }
  async getDiveById(id: string) { return store.dives.find((d) => d.id === id) ?? null; }
  async createDive(dive: Omit<DiveLogPreview, "id">) {
    const item = { ...dive, id: generateId() } as DiveLogPreview;
    store.dives.push(item);
    return item;
  }
  async updateDive(id: string, data: Partial<DiveLogPreview>) {
    const idx = store.dives.findIndex((d) => d.id === id);
    if (idx === -1) return null;
    store.dives[idx] = { ...store.dives[idx], ...data } as DiveLogPreview;
    return store.dives[idx];
  }
  async deleteDive(id: string) {
    const len = store.dives.length;
    store.dives = store.dives.filter((d) => d.id !== id);
    return store.dives.length < len;
  }

  // ── Equipment ──
  async getEquipment() { return store.equipment; }
  async getEquipmentById(id: string) { return store.equipment.find((e) => e.id === id) ?? null; }
  async createEquipment(item: Omit<EquipmentItem, "id">) {
    const entry = { ...item, id: generateId() } as EquipmentItem;
    store.equipment.push(entry);
    return entry;
  }
  async updateEquipment(id: string, data: Partial<EquipmentItem>) {
    const idx = store.equipment.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    store.equipment[idx] = { ...store.equipment[idx], ...data } as EquipmentItem;
    return store.equipment[idx];
  }
  async deleteEquipment(id: string) {
    const len = store.equipment.length;
    store.equipment = store.equipment.filter((e) => e.id !== id);
    return store.equipment.length < len;
  }

  // ── Sites ──
  async getSites() { return store.sites; }
  async getSiteById(id: string) { return store.sites.find((s) => s.id === id) ?? null; }
  async createSite(site: Omit<DiveSite, "id">) {
    const entry = { ...site, id: generateId() } as DiveSite;
    store.sites.push(entry);
    return entry;
  }
  async updateSite(id: string, data: Partial<DiveSite>) {
    const idx = store.sites.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    store.sites[idx] = { ...store.sites[idx], ...data } as DiveSite;
    return store.sites[idx];
  }
  async deleteSite(id: string) {
    const len = store.sites.length;
    store.sites = store.sites.filter((s) => s.id !== id);
    return store.sites.length < len;
  }

  // ── Media ──
  async getMedia() { return store.media; }
  async getMediaById(id: string) { return store.media.find((m) => m.id === id) ?? null; }
  async createMedia(item: Omit<MediaItem, "id">) {
    const entry = { ...item, id: generateId() } as MediaItem;
    store.media.push(entry);
    return entry;
  }
  async deleteMedia(id: string) {
    const len = store.media.length;
    store.media = store.media.filter((m) => m.id !== id);
    return store.media.length < len;
  }

  // ── Notifications ──
  async getNotifications(userId?: string) {
    if (userId) return store.notifications.filter((n) => n.userId === userId);
    return store.notifications;
  }
  async createNotification(item: Omit<NotificationItem, "id">) {
    const entry = { ...item, id: generateId() } as NotificationItem;
    store.notifications.push(entry);
    return entry;
  }
  async deleteNotification(id: string) {
    const len = store.notifications.length;
    store.notifications = store.notifications.filter((n) => n.id !== id);
    return store.notifications.length < len;
  }

  // ── Community ──
  async getCommunityPosts() { return store.community; }
  async getCommunityPostById(id: string) { return store.community.find((p) => p.id === id) ?? null; }
  async createCommunityPost(post: Omit<CommunityPost, "id">) {
    const entry = { ...post, id: generateId() } as CommunityPost;
    store.community.push(entry);
    return entry;
  }
  async updateCommunityPost(id: string, data: Partial<CommunityPost>) {
    const idx = store.community.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    store.community[idx] = { ...store.community[idx], ...data } as CommunityPost;
    return store.community[idx];
  }
  async deleteCommunityPost(id: string) {
    const len = store.community.length;
    store.community = store.community.filter((p) => p.id !== id);
    return store.community.length < len;
  }

  // ── Members ──
  async getMembers() { return store.members; }
  async getMemberById(id: string) { return store.members.find((m) => m.id === id) ?? null; }
  async getMemberByEmail(email: string) { return store.members.find((m) => m.email === email) ?? null; }
  async createMember(member: Omit<MemberProfile, "id">) {
    const entry = { ...member, id: generateId() } as MemberProfile;
    store.members.push(entry);
    return entry;
  }
  async updateMember(id: string, data: Partial<MemberProfile>) {
    const idx = store.members.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    store.members[idx] = { ...store.members[idx], ...data } as MemberProfile;
    return store.members[idx];
  }
  async deleteMember(id: string) {
    const len = store.members.length;
    store.members = store.members.filter((m) => m.id !== id);
    return store.members.length < len;
  }
}
