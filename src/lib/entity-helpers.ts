/**
 * Helper functions to add Cosmos DB system fields to entities
 */

import type {
  DiveLogPreview,
  EquipmentItem,
  MediaItem,
  DiveSite,
  NotificationItem,
  MemberProfile
} from "@/data/mock-data";

export function createDiveLog(
  data: Omit<DiveLogPreview, "id" | "type" | "ownerId">,
  ownerId: string
): Omit<DiveLogPreview, "id"> {
  return {
    ...data,
    type: "dive",
    ownerId
  };
}

export function createEquipment(
  data: Omit<EquipmentItem, "id" | "type" | "ownerId">,
  ownerId: string
): Omit<EquipmentItem, "id"> {
  return {
    ...data,
    type: "equipment",
    ownerId
  };
}

export function createMediaItem(
  data: Omit<MediaItem, "id" | "type" | "ownerId">,
  ownerId: string
): Omit<MediaItem, "id"> {
  return {
    ...data,
    type: "media",
    ownerId
  };
}

export function createDiveSite(
  data: Omit<DiveSite, "id" | "type" | "ownerId">,
  ownerId: string
): Omit<DiveSite, "id"> {
  return {
    ...data,
    type: "site",
    ownerId
  };
}

export function createNotification(
  data: Omit<NotificationItem, "id" | "type" | "userId">,
  userId: string
): Omit<NotificationItem, "id"> {
  return {
    ...data,
    type: "notification",
    userId
  };
}

export function createMember(
  data: Omit<MemberProfile, "id" | "type" | "userId">
): Omit<MemberProfile, "id"> {
  const userId = `member-${Date.now()}`;
  return {
    ...data,
    type: "user",
    userId
  };
}
