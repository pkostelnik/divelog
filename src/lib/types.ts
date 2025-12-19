/**
 * Form payload types - without Cosmos DB discriminator fields
 * These are used in forms before entities are persisted to Cosmos DB
 */

import type {
  DiveLogPreview,
  EquipmentItem,
  MediaItem,
  DiveSite,
  NotificationItem,
  MemberProfile
} from "@/data/mock-data";

// Form payloads omit: id, type, userId/ownerId (these are added by the system)
export type AddDiveLogPayload = Omit<DiveLogPreview, "id" | "type" | "ownerId">;
export type UpdateDiveLogPayload = Omit<DiveLogPreview, "id" | "type" | "ownerId">;

export type AddEquipmentPayload = Omit<EquipmentItem, "id" | "type" | "ownerId">;
export type UpdateEquipmentPayload = Omit<EquipmentItem, "id" | "type" | "ownerId">;

export type AddMediaItemPayload = Omit<MediaItem, "id" | "type" | "ownerId">;
export type UpdateMediaItemPayload = Omit<MediaItem, "id" | "type" | "ownerId">;

export type AddDiveSitePayload = Omit<DiveSite, "id" | "type" | "ownerId">;
export type UpdateDiveSitePayload = Omit<DiveSite, "id" | "type" | "ownerId">;

export type AddNotificationPayload = Omit<NotificationItem, "id" | "type" | "userId">;

export type RegisterMemberPayload = Omit<MemberProfile, "id" | "type" | "userId">;
