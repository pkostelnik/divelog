'use client';

import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";

import {
  communityPosts as communitySeed,
  forumCategories as forumCategorySeed,
  forumThreads as forumThreadSeed,
  diveSites as diveSiteSeed,
  diveLogs as diveLogSeed,
  equipment as equipmentSeed,
  media as mediaSeed,
  notifications as notificationSeed,
  type CommunityPost,
  type CommunityComment,
  type CommunityPostAttachment,
  type ForumCategory,
  type ForumThread,
  type ForumReply,
  type DiveLogPreview,
  type DiveSite,
  type EquipmentItem,
  type MediaItem,
  type NotificationItem
} from "@/data/mock-data";

type DemoNotification = NotificationItem & { read: boolean };
type DemoCommunityPost = CommunityPost & { likedByMe: boolean };
type DemoForumReply = ForumReply & { likedByMe: boolean };
type DemoForumThread = Omit<ForumThread, "replies"> & {
  likedByMe: boolean;
  replies: DemoForumReply[];
};
type CommunityPostAttachmentInput = Omit<CommunityPostAttachment, "id"> & { id?: string };
type AddCommunityPostPayload = {
  title: string;
  author: string;
  authorId?: string;
  authorEmail?: string;
  body: string;
  diveLogId?: string;
  attachments?: CommunityPostAttachmentInput[];
  id?: string;
  likes?: number;
};
type UpdateCommunityPostPayload = {
  id: string;
  data: Partial<
    Pick<CommunityPost, "title" | "author" | "authorId" | "authorEmail" | "body" | "diveLogId" | "attachments">
  > & {
    diveLogId?: string | null;
    attachments?: CommunityPostAttachmentInput[];
  };
};
type RemoveCommunityPostPayload = { id: string };
type AddCommunityCommentPayload = {
  postId: string;
  author: string;
  authorId?: string;
  authorEmail?: string;
  message: string;
  id?: string;
  createdAt?: string;
};
type UpdateCommunityCommentPayload = {
  postId: string;
  commentId: string;
  data: Partial<Pick<CommunityComment, "author" | "authorId" | "authorEmail" | "message" | "createdAt">>;
};
type RemoveCommunityCommentPayload = {
  postId: string;
  commentId: string;
};
type AddForumThreadPayload = {
  title: string;
  author: string;
  authorId?: string;
  categoryId: string;
  body: string;
  id?: string;
  excerpt?: string;
};
type UpdateForumThreadPayload = {
  id: string;
  data: Partial<Pick<ForumThread, "title" | "author" | "authorId" | "body" | "categoryId" | "excerpt">>;
};
type RemoveForumThreadPayload = { id: string };
type AddForumReplyPayload = {
  threadId: string;
  author: string;
  authorId?: string;
  message: string;
  id?: string;
  createdAt?: string;
};
type UpdateForumReplyPayload = {
  threadId: string;
  replyId: string;
  data: Partial<Pick<ForumReply, "author" | "authorId" | "message">>;
};
type RemoveForumReplyPayload = {
  threadId: string;
  replyId: string;
};
type UpdateEquipmentPayload = Omit<EquipmentItem, "id">;
type UpdateDiveSitePayload = Omit<DiveSite, "id">;
type AddEquipmentPayload = Omit<EquipmentItem, "id"> & { id?: string };
type AddDiveSitePayload = Omit<DiveSite, "id"> & { id?: string };
type AddMediaItemPayload = Omit<MediaItem, "id"> & { id?: string };
type UpdateMediaItemPayload = Omit<MediaItem, "id">;

function compareEquipment(a: EquipmentItem, b: EquipmentItem) {
  return `${a.manufacturer} ${a.model}`.localeCompare(`${b.manufacturer} ${b.model}`);
}

type DemoState = {
  diveLogs: DiveLogPreview[];
  equipment: EquipmentItem[];
  communityPosts: DemoCommunityPost[];
  forumCategories: ForumCategory[];
  forumThreads: DemoForumThread[];
  notifications: DemoNotification[];
  diveSites: DiveSite[];
  mediaItems: MediaItem[];
  favoriteMediaIds: string[];
  favoriteSiteIds: string[];
};

type AddDiveLogPayload = Omit<DiveLogPreview, "id"> & { id?: string };
type PurgeMemberContentPayload = {
  memberId: string;
  placeholderName?: string;
};

type DemoAction =
  | { type: "ADD_DIVE_LOG"; payload: AddDiveLogPayload }
  | { type: "REMOVE_DIVE_LOG"; payload: { id: string } }
  | { type: "UPDATE_DIVE_LOG"; payload: { id: string; data: Omit<DiveLogPreview, "id"> } }
  | {
      type: "UPDATE_EQUIPMENT_STATUS";
      payload: { id: string; status: EquipmentItem["status"]; lastService?: string };
    }
  | { type: "TOGGLE_POST_LIKE"; payload: { id: string } }
  | { type: "ADD_COMMUNITY_POST"; payload: AddCommunityPostPayload }
  | { type: "UPDATE_COMMUNITY_POST"; payload: UpdateCommunityPostPayload }
  | { type: "REMOVE_COMMUNITY_POST"; payload: RemoveCommunityPostPayload }
  | { type: "ADD_COMMUNITY_COMMENT"; payload: AddCommunityCommentPayload }
  | { type: "UPDATE_COMMUNITY_COMMENT"; payload: UpdateCommunityCommentPayload }
  | { type: "REMOVE_COMMUNITY_COMMENT"; payload: RemoveCommunityCommentPayload }
  | { type: "ADD_FORUM_THREAD"; payload: AddForumThreadPayload }
  | { type: "UPDATE_FORUM_THREAD"; payload: UpdateForumThreadPayload }
  | { type: "REMOVE_FORUM_THREAD"; payload: RemoveForumThreadPayload }
  | { type: "ADD_FORUM_REPLY"; payload: AddForumReplyPayload }
  | { type: "UPDATE_FORUM_REPLY"; payload: UpdateForumReplyPayload }
  | { type: "REMOVE_FORUM_REPLY"; payload: RemoveForumReplyPayload }
  | { type: "TOGGLE_FORUM_THREAD_LIKE"; payload: { id: string } }
  | { type: "TOGGLE_FORUM_REPLY_LIKE"; payload: { threadId: string; replyId: string } }
  | { type: "ADD_EQUIPMENT"; payload: AddEquipmentPayload }
  | { type: "UPDATE_EQUIPMENT"; payload: { id: string; data: UpdateEquipmentPayload } }
  | { type: "REMOVE_EQUIPMENT"; payload: { id: string } }
  | { type: "ADD_DIVE_SITE"; payload: AddDiveSitePayload }
  | { type: "UPDATE_DIVE_SITE"; payload: { id: string; data: UpdateDiveSitePayload } }
  | { type: "REMOVE_DIVE_SITE"; payload: { id: string } }
  | { type: "ADD_MEDIA_ITEM"; payload: AddMediaItemPayload }
  | { type: "UPDATE_MEDIA_ITEM"; payload: { id: string; data: UpdateMediaItemPayload } }
  | { type: "REMOVE_MEDIA_ITEM"; payload: { id: string } }
  | { type: "ADD_NOTIFICATION"; payload: { title: string; description: string } }
  | { type: "MARK_NOTIFICATION"; payload: { id: string; read: boolean } }
  | { type: "DISMISS_NOTIFICATION"; payload: { id: string } }
  | { type: "TOGGLE_MEDIA_FAVORITE"; payload: { id: string } }
  | { type: "TOGGLE_SITE_FAVORITE"; payload: { id: string } }
  | { type: "PURGE_MEMBER_CONTENT"; payload: PurgeMemberContentPayload };

const DemoDataContext = createContext<DemoDataContextValue | undefined>(undefined);

function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id-${Math.random().toString(16).slice(2)}`;
}

function createExcerpt(body: string) {
  if (body.length <= 160) {
    return body;
  }
  return `${body.slice(0, 157)}...`;
}

function normalizePostAttachments(attachments?: CommunityPostAttachmentInput[]) {
  if (!attachments || attachments.length === 0) {
    return [] as CommunityPostAttachment[];
  }

  const normalized: CommunityPostAttachment[] = [];

  attachments.forEach((attachment) => {
    const url = attachment.url.trim();
    if (url.length === 0) {
      return;
    }

    normalized.push({
      id: attachment.id ?? generateId(),
      url,
      title: attachment.title?.trim() || attachment.fileName?.trim() || "Anhang",
      source: attachment.source ?? "upload",
      fileName: attachment.fileName?.trim() || undefined,
      type: "image"
    });
  });

  return normalized;
}

const initialState: DemoState = {
  diveLogs: [...diveLogSeed].sort((a, b) => b.date.localeCompare(a.date)),
  equipment: [...equipmentSeed].sort(compareEquipment),
  communityPosts: communitySeed.map((post) => ({
    ...post,
    attachments: normalizePostAttachments(post.attachments),
    likedByMe: false
  })),
  forumCategories: [...forumCategorySeed],
  forumThreads: forumThreadSeed
    .map<DemoForumThread>((thread) => ({
      ...thread,
      likedByMe: false,
      replies: thread.replies
        .map<DemoForumReply>((reply) => ({
          ...reply,
          likedByMe: false
        }))
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    }))
    .sort((a, b) => b.lastActivity.localeCompare(a.lastActivity)),
  notifications: notificationSeed.map((note) => ({ ...note, read: false })),
  diveSites: [...diveSiteSeed],
  mediaItems: [...mediaSeed].sort((a, b) => a.title.localeCompare(b.title)),
  favoriteMediaIds: [],
  favoriteSiteIds: []
};

function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "ADD_DIVE_LOG": {
      const id = action.payload.id ?? generateId();
      const nextLog: DiveLogPreview = { ...action.payload, id };
      return {
        ...state,
        diveLogs: [nextLog, ...state.diveLogs].sort((a, b) => b.date.localeCompare(a.date))
      };
    }
    case "REMOVE_DIVE_LOG": {
      return {
        ...state,
        diveLogs: state.diveLogs.filter((log) => log.id !== action.payload.id)
      };
    }
    case "UPDATE_DIVE_LOG": {
      return {
        ...state,
        diveLogs: state.diveLogs
          .map((log) => (log.id === action.payload.id ? { ...action.payload.data, id: log.id } : log))
          .sort((a, b) => b.date.localeCompare(a.date))
      };
    }
    case "UPDATE_EQUIPMENT_STATUS": {
      const { id, status, lastService } = action.payload;
      return {
        ...state,
        equipment: state.equipment.map((item) =>
          item.id === id
            ? {
                ...item,
                status,
                lastService: lastService ?? item.lastService
              }
            : item
        )
      };
    }
    case "TOGGLE_POST_LIKE": {
      return {
        ...state,
        communityPosts: state.communityPosts.map((post) => {
          if (post.id !== action.payload.id) {
            return post;
          }

          const likedByMe = !post.likedByMe;
          const likes = likedByMe ? post.likes + 1 : Math.max(0, post.likes - 1);

          return { ...post, likedByMe, likes };
        })
      };
    }
    case "ADD_COMMUNITY_POST": {
      const id = action.payload.id ?? generateId();
      const likes = action.payload.likes ?? 0;
      const attachments = normalizePostAttachments(action.payload.attachments);
      const newPost: DemoCommunityPost = {
        id,
        title: action.payload.title,
        author: action.payload.author,
        authorId: action.payload.authorId,
        authorEmail: action.payload.authorEmail,
        body: action.payload.body,
        diveLogId: action.payload.diveLogId,
        likes,
        likedByMe: false,
        attachments,
        comments: []
      };

      return {
        ...state,
        communityPosts: [newPost, ...state.communityPosts]
      };
    }
    case "UPDATE_COMMUNITY_POST": {
      const { id, data } = action.payload;
      return {
        ...state,
        communityPosts: state.communityPosts.map((post) => {
          if (post.id !== id) {
            return post;
          }

          const nextDiveLogId =
            data.diveLogId === undefined
              ? post.diveLogId
              : data.diveLogId === null || data.diveLogId === ""
                ? undefined
                : data.diveLogId;
          const nextAuthorId =
            data.authorId === undefined ? post.authorId : data.authorId || undefined;
          const nextAuthorEmail =
            data.authorEmail === undefined ? post.authorEmail : data.authorEmail || undefined;
          const nextAttachments =
            data.attachments === undefined
              ? post.attachments ?? []
              : normalizePostAttachments(data.attachments);

          return {
            ...post,
            title: data.title !== undefined ? data.title.trim() : post.title,
            author: data.author !== undefined ? data.author.trim() : post.author,
            body: data.body !== undefined ? data.body.trim() : post.body,
            diveLogId: nextDiveLogId,
            authorId: nextAuthorId,
            authorEmail: nextAuthorEmail,
            attachments: nextAttachments
          };
        })
      };
    }
    case "REMOVE_COMMUNITY_POST": {
      return {
        ...state,
        communityPosts: state.communityPosts.filter((post) => post.id !== action.payload.id)
      };
    }
    case "ADD_COMMUNITY_COMMENT": {
      const comment: CommunityComment = {
        id: action.payload.id ?? generateId(),
        author: action.payload.author,
        authorId: action.payload.authorId,
        authorEmail: action.payload.authorEmail,
        message: action.payload.message,
        createdAt: action.payload.createdAt ?? new Date().toISOString()
      };

      return {
        ...state,
        communityPosts: state.communityPosts.map((post) =>
          post.id === action.payload.postId
            ? { ...post, comments: [...post.comments, comment] }
            : post
        )
      };
    }
    case "UPDATE_COMMUNITY_COMMENT": {
      const { postId, commentId, data } = action.payload;
      return {
        ...state,
        communityPosts: state.communityPosts.map((post) => {
          if (post.id !== postId) {
            return post;
          }

          const comments = post.comments.map((comment) => {
            if (comment.id !== commentId) {
              return comment;
            }

            return {
              ...comment,
              author:
                data.author !== undefined ? data.author.trim() : comment.author,
              authorId:
                data.authorId !== undefined ? data.authorId || undefined : comment.authorId,
              authorEmail:
                data.authorEmail !== undefined
                  ? data.authorEmail ? data.authorEmail.trim().toLowerCase() : undefined
                  : comment.authorEmail,
              message:
                data.message !== undefined ? data.message.trim() : comment.message,
              createdAt: data.createdAt ?? comment.createdAt
            };
          });

          return {
            ...post,
            comments
          };
        })
      };
    }
    case "REMOVE_COMMUNITY_COMMENT": {
      const { postId, commentId } = action.payload;
      return {
        ...state,
        communityPosts: state.communityPosts.map((post) =>
          post.id === postId
            ? { ...post, comments: post.comments.filter((comment) => comment.id !== commentId) }
            : post
        )
      };
    }
    case "ADD_FORUM_THREAD": {
      const id = action.payload.id ?? generateId();
      const createdAt = new Date().toISOString();
      const excerpt = action.payload.excerpt ?? createExcerpt(action.payload.body);
      const newThread: DemoForumThread = {
        id,
        title: action.payload.title,
        author: action.payload.author,
        authorId: action.payload.authorId,
        categoryId: action.payload.categoryId,
        body: action.payload.body,
        excerpt,
        createdAt,
        lastActivity: createdAt,
        likes: 0,
        likedByMe: false,
        replies: []
      };

      return {
        ...state,
        forumThreads: [newThread, ...state.forumThreads].sort((a, b) =>
          b.lastActivity.localeCompare(a.lastActivity)
        )
      };
    }
    case "UPDATE_FORUM_THREAD": {
      const { id, data } = action.payload;
      return {
        ...state,
        forumThreads: state.forumThreads
          .map((thread) => {
            if (thread.id !== id) {
              return thread;
            }

            const nextBody =
              data.body !== undefined ? data.body.trim() : thread.body;
            const nextExcerpt =
              data.excerpt !== undefined
                ? data.excerpt
                : data.body !== undefined
                  ? createExcerpt(nextBody)
                  : thread.excerpt;
            const nextAuthorId =
              data.authorId === undefined ? thread.authorId : data.authorId || undefined;

            return {
              ...thread,
              title: data.title !== undefined ? data.title.trim() : thread.title,
              author: data.author !== undefined ? data.author.trim() : thread.author,
              categoryId: data.categoryId ?? thread.categoryId,
              body: nextBody,
              authorId: nextAuthorId,
              excerpt: nextExcerpt
            };
          })
          .sort((a, b) => b.lastActivity.localeCompare(a.lastActivity))
      };
    }
    case "REMOVE_FORUM_THREAD": {
      return {
        ...state,
        forumThreads: state.forumThreads.filter((thread) => thread.id !== action.payload.id)
      };
    }
    case "ADD_FORUM_REPLY": {
      const replyCreatedAt = action.payload.createdAt ?? new Date().toISOString();
      const reply: DemoForumReply = {
        id: action.payload.id ?? generateId(),
        author: action.payload.author,
        authorId: action.payload.authorId,
        message: action.payload.message,
        createdAt: replyCreatedAt,
        likes: 0,
        likedByMe: false
      };

      return {
        ...state,
        forumThreads: state.forumThreads
          .map((thread) => {
            if (thread.id !== action.payload.threadId) {
              return thread;
            }

            const replies = [...thread.replies, reply].sort((a, b) =>
              a.createdAt.localeCompare(b.createdAt)
            ) as DemoForumReply[];
            const lastActivity = replies[replies.length - 1]?.createdAt ?? thread.lastActivity;

            return {
              ...thread,
              replies,
              lastActivity
            };
          })
          .sort((a, b) => b.lastActivity.localeCompare(a.lastActivity))
      };
    }
    case "UPDATE_FORUM_REPLY": {
      return {
        ...state,
        forumThreads: state.forumThreads
          .map((thread) => {
            if (thread.id !== action.payload.threadId) {
              return thread;
            }

            const replies = thread.replies.map((reply) => {
              if (reply.id !== action.payload.replyId) {
                return reply;
              }

              const nextAuthorId =
                action.payload.data.authorId === undefined
                  ? reply.authorId
                  : action.payload.data.authorId || undefined;

              return {
                ...reply,
                author:
                  action.payload.data.author !== undefined
                    ? action.payload.data.author.trim()
                    : reply.author,
                message:
                  action.payload.data.message !== undefined
                    ? action.payload.data.message.trim()
                    : reply.message,
                authorId: nextAuthorId
              };
            });

            return {
              ...thread,
              replies
            };
          })
          .sort((a, b) => b.lastActivity.localeCompare(a.lastActivity))
      };
    }
    case "REMOVE_FORUM_REPLY": {
      return {
        ...state,
        forumThreads: state.forumThreads
          .map((thread) => {
            if (thread.id !== action.payload.threadId) {
              return thread;
            }

            const replies = thread.replies.filter((reply) => reply.id !== action.payload.replyId);
            const lastActivity =
              replies.length > 0 ? replies[replies.length - 1].createdAt : thread.createdAt;

            return {
              ...thread,
              replies,
              lastActivity
            };
          })
          .sort((a, b) => b.lastActivity.localeCompare(a.lastActivity))
      };
    }
    case "TOGGLE_FORUM_THREAD_LIKE": {
      return {
        ...state,
        forumThreads: state.forumThreads.map((thread) => {
          if (thread.id !== action.payload.id) {
            return thread;
          }

          const likedByMe = !thread.likedByMe;
          const likes = likedByMe ? thread.likes + 1 : Math.max(0, thread.likes - 1);

          return {
            ...thread,
            likedByMe,
            likes
          };
        })
      };
    }
    case "TOGGLE_FORUM_REPLY_LIKE": {
      return {
        ...state,
        forumThreads: state.forumThreads.map((thread) => {
          if (thread.id !== action.payload.threadId) {
            return thread;
          }

          const replies = thread.replies.map<DemoForumReply>((reply) => {
            if (reply.id !== action.payload.replyId) {
              return reply;
            }

            const likedByMe = !reply.likedByMe;
            const likes = likedByMe ? reply.likes + 1 : Math.max(0, reply.likes - 1);

            return {
              ...reply,
              likedByMe,
              likes
            };
          });

          return {
            ...thread,
            replies
          };
        })
      };
    }
    case "ADD_EQUIPMENT": {
      const id = action.payload.id ?? generateId();
      const nextItem: EquipmentItem = {
        id,
        manufacturer: action.payload.manufacturer,
        model: action.payload.model,
        serialNumber: action.payload.serialNumber,
        status: action.payload.status,
        lastService: action.payload.lastService
      };

      return {
        ...state,
        equipment: [...state.equipment, nextItem].sort(compareEquipment)
      };
    }
    case "UPDATE_EQUIPMENT": {
      const { id, data } = action.payload;
      return {
        ...state,
        equipment: state.equipment
          .map((item) =>
            item.id === id
              ? {
                  ...data,
                  id
                }
              : item
          )
          .sort(compareEquipment)
      };
    }
    case "REMOVE_EQUIPMENT": {
      const { id } = action.payload;
      return {
        ...state,
        equipment: state.equipment.filter((item) => item.id !== id)
      };
    }
    case "ADD_DIVE_SITE": {
      const id = action.payload.id ?? generateId();
      const nextSite: DiveSite = {
        id,
        name: action.payload.name,
        country: action.payload.country,
        difficulty: action.payload.difficulty,
        highlight: action.payload.highlight,
        coordinates: {
          latitude: action.payload.coordinates.latitude,
          longitude: action.payload.coordinates.longitude
        },
        ownerId: action.payload.ownerId
      };

      return {
        ...state,
        diveSites: [...state.diveSites, nextSite].sort((a, b) => a.name.localeCompare(b.name))
      };
    }
    case "UPDATE_DIVE_SITE": {
      const { id, data } = action.payload;
      return {
        ...state,
        diveSites: state.diveSites.map((site) => {
          if (site.id !== id) {
            return site;
          }

          return {
            id,
            name: data.name,
            country: data.country,
            difficulty: data.difficulty,
            highlight: data.highlight,
            coordinates: {
              latitude: data.coordinates.latitude,
              longitude: data.coordinates.longitude
            },
            ownerId: data.ownerId ?? site.ownerId
          } satisfies DiveSite;
        })
      };
    }
    case "REMOVE_DIVE_SITE": {
      const { id } = action.payload;
      return {
        ...state,
        diveSites: state.diveSites.filter((site) => site.id !== id),
        favoriteSiteIds: state.favoriteSiteIds.filter((siteId) => siteId !== id)
      };
    }
    case "ADD_MEDIA_ITEM": {
      const id = action.payload.id ?? generateId();
      const nextMedia: MediaItem = {
        id,
        title: action.payload.title,
        author: action.payload.author,
          ownerId: action.payload.ownerId,
        url: action.payload.url,
        type: action.payload.type,
        source: action.payload.source,
        fileName: action.payload.fileName
      };

      return {
        ...state,
        mediaItems: [...state.mediaItems, nextMedia].sort((a, b) =>
          a.title.localeCompare(b.title)
        )
      };
    }
    case "UPDATE_MEDIA_ITEM": {
      const { id, data } = action.payload;
      return {
        ...state,
        mediaItems: state.mediaItems
          .map((item) =>
            item.id === id
              ? {
                  ...data,
                    ownerId: data.ownerId,
                  id
                }
              : item
          )
          .sort((a, b) => a.title.localeCompare(b.title))
      };
    }
    case "REMOVE_MEDIA_ITEM": {
      const { id } = action.payload;
      return {
        ...state,
        mediaItems: state.mediaItems.filter((item) => item.id !== id),
        favoriteMediaIds: state.favoriteMediaIds.filter((mediaId) => mediaId !== id)
      };
    }
    case "ADD_NOTIFICATION": {
      const now = new Date().toISOString();
      const nextNote: DemoNotification = {
        id: generateId(),
        title: action.payload.title,
        description: action.payload.description,
        timestamp: now,
        read: false
      };

      return {
        ...state,
        notifications: [nextNote, ...state.notifications]
      };
    }
    case "MARK_NOTIFICATION": {
      return {
        ...state,
        notifications: state.notifications.map((note) =>
          note.id === action.payload.id ? { ...note, read: action.payload.read } : note
        )
      };
    }
    case "DISMISS_NOTIFICATION": {
      return {
        ...state,
        notifications: state.notifications.filter((note) => note.id !== action.payload.id)
      };
    }
    case "TOGGLE_MEDIA_FAVORITE": {
      const id = action.payload.id;
      const exists = state.favoriteMediaIds.includes(id);
      return {
        ...state,
        favoriteMediaIds: exists
          ? state.favoriteMediaIds.filter((item) => item !== id)
          : [...state.favoriteMediaIds, id]
      };
    }
    case "TOGGLE_SITE_FAVORITE": {
      const id = action.payload.id;
      const exists = state.favoriteSiteIds.includes(id);
      return {
        ...state,
        favoriteSiteIds: exists
          ? state.favoriteSiteIds.filter((item) => item !== id)
          : [...state.favoriteSiteIds, id]
      };
    }
    case "PURGE_MEMBER_CONTENT": {
      const placeholderName = action.payload.placeholderName?.trim() || "Gelöschtes Mitglied";
      const placeholderComment = "Dieser Kommentar wurde entfernt.";
      const placeholderReply = "Diese Antwort wurde entfernt.";

      const filteredDiveLogs = state.diveLogs.filter((log) => log.diverId !== action.payload.memberId);

      const sanitizedCommunityPosts = state.communityPosts
        .filter((post) => post.authorId !== action.payload.memberId)
        .map((post): typeof post => {
          const comments = post.comments.map((comment): typeof comment => {
            if (comment.authorId !== action.payload.memberId) {
              return comment;
            }
            return {
              ...comment,
              author: placeholderName,
              authorId: undefined,
              authorEmail: undefined,
              message: placeholderComment
            };
          });

          return {
            ...post,
            comments
          };
        });

      const sanitizedForumThreads = state.forumThreads
        .filter((thread) => thread.authorId !== action.payload.memberId)
        .map((thread): typeof thread => {
          const replies = thread.replies.map((reply): typeof reply => {
            if (reply.authorId !== action.payload.memberId) {
              return reply;
            }
            return {
              ...reply,
              author: placeholderName,
              authorId: undefined,
              message: placeholderReply
            };
          });

          return {
            ...thread,
            replies
          };
        });

      const sanitizedMedia = state.mediaItems.filter((item) => item.ownerId !== action.payload.memberId);
      const sanitizedFavoriteMedia = state.favoriteMediaIds.filter((mediaId) =>
        sanitizedMedia.some((mediaItem) => mediaItem.id === mediaId)
      );
      const sanitizedDiveSites = state.diveSites.filter((site) => site.ownerId !== action.payload.memberId);
      const sanitizedFavoriteSites = state.favoriteSiteIds.filter((siteId) =>
        sanitizedDiveSites.some((site) => site.id === siteId)
      );

      return {
        ...state,
        diveLogs: filteredDiveLogs,
        communityPosts: sanitizedCommunityPosts,
        forumThreads: sanitizedForumThreads,
        mediaItems: sanitizedMedia,
        favoriteMediaIds: sanitizedFavoriteMedia,
        diveSites: sanitizedDiveSites,
        favoriteSiteIds: sanitizedFavoriteSites
      };
    }
    default:
      return state;
  }
}

type DemoDataContextValue = DemoState & {
  addDiveLog: (payload: AddDiveLogPayload) => void;
  removeDiveLog: (id: string) => void;
  updateDiveLog: (id: string, data: Omit<DiveLogPreview, "id">) => void;
  updateEquipmentStatus: (
    id: string,
    status: EquipmentItem["status"],
    options?: { lastService?: string }
  ) => void;
  addEquipment: (payload: AddEquipmentPayload) => void;
  updateEquipment: (id: string, data: UpdateEquipmentPayload) => void;
  removeEquipment: (id: string) => void;
  addDiveSite: (payload: AddDiveSitePayload) => void;
  updateDiveSite: (id: string, data: UpdateDiveSitePayload) => void;
  removeDiveSite: (id: string) => void;
  addMediaItem: (payload: AddMediaItemPayload) => void;
  updateMediaItem: (id: string, data: UpdateMediaItemPayload) => void;
  removeMediaItem: (id: string) => void;
  togglePostLike: (id: string) => void;
  addCommunityPost: (payload: AddCommunityPostPayload) => void;
  updateCommunityPost: (payload: UpdateCommunityPostPayload) => void;
  removeCommunityPost: (id: string) => void;
  addCommunityComment: (payload: AddCommunityCommentPayload) => void;
  updateCommunityComment: (payload: UpdateCommunityCommentPayload) => void;
  removeCommunityComment: (payload: RemoveCommunityCommentPayload) => void;
  addForumThread: (payload: AddForumThreadPayload) => void;
  updateForumThread: (payload: UpdateForumThreadPayload) => void;
  removeForumThread: (id: string) => void;
  addForumReply: (payload: AddForumReplyPayload) => void;
  updateForumReply: (payload: UpdateForumReplyPayload) => void;
  removeForumReply: (payload: RemoveForumReplyPayload) => void;
  toggleForumThreadLike: (id: string) => void;
  toggleForumReplyLike: (threadId: string, replyId: string) => void;
  addNotification: (payload: { title: string; description: string }) => void;
  markNotification: (id: string, read: boolean) => void;
  dismissNotification: (id: string) => void;
  toggleFavoriteMedia: (id: string) => void;
  toggleFavoriteSite: (id: string) => void;
  purgeMemberContent: (payload: PurgeMemberContentPayload) => void;
};

export function DemoDataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(demoReducer, initialState);

  const value = useMemo<DemoDataContextValue>(() => {
    return {
      ...state,
      addDiveLog: (payload) => dispatch({ type: "ADD_DIVE_LOG", payload }),
      removeDiveLog: (id) => dispatch({ type: "REMOVE_DIVE_LOG", payload: { id } }),
      updateDiveLog: (id, data) => dispatch({ type: "UPDATE_DIVE_LOG", payload: { id, data } }),
      updateEquipmentStatus: (id, status, options) =>
        dispatch({
          type: "UPDATE_EQUIPMENT_STATUS",
          payload: { id, status, lastService: options?.lastService }
        }),
      addEquipment: (payload) => dispatch({ type: "ADD_EQUIPMENT", payload }),
      updateEquipment: (id, data) =>
        dispatch({ type: "UPDATE_EQUIPMENT", payload: { id, data } }),
      removeEquipment: (id) => dispatch({ type: "REMOVE_EQUIPMENT", payload: { id } }),
      addDiveSite: (payload) => dispatch({ type: "ADD_DIVE_SITE", payload }),
      updateDiveSite: (id, data) =>
        dispatch({ type: "UPDATE_DIVE_SITE", payload: { id, data } }),
      removeDiveSite: (id) => dispatch({ type: "REMOVE_DIVE_SITE", payload: { id } }),
      addMediaItem: (payload) => dispatch({ type: "ADD_MEDIA_ITEM", payload }),
      updateMediaItem: (id, data) =>
        dispatch({ type: "UPDATE_MEDIA_ITEM", payload: { id, data } }),
      removeMediaItem: (id) => dispatch({ type: "REMOVE_MEDIA_ITEM", payload: { id } }),
      togglePostLike: (id) => dispatch({ type: "TOGGLE_POST_LIKE", payload: { id } }),
      addCommunityPost: (payload) => dispatch({ type: "ADD_COMMUNITY_POST", payload }),
      updateCommunityPost: (payload) =>
        dispatch({ type: "UPDATE_COMMUNITY_POST", payload }),
      removeCommunityPost: (id) =>
        dispatch({ type: "REMOVE_COMMUNITY_POST", payload: { id } }),
      addCommunityComment: (payload) =>
        dispatch({ type: "ADD_COMMUNITY_COMMENT", payload }),
      updateCommunityComment: (payload) =>
        dispatch({ type: "UPDATE_COMMUNITY_COMMENT", payload }),
      removeCommunityComment: (payload) =>
        dispatch({ type: "REMOVE_COMMUNITY_COMMENT", payload }),
      addForumThread: (payload) => dispatch({ type: "ADD_FORUM_THREAD", payload }),
      updateForumThread: (payload) =>
        dispatch({ type: "UPDATE_FORUM_THREAD", payload }),
      removeForumThread: (id) =>
        dispatch({ type: "REMOVE_FORUM_THREAD", payload: { id } }),
      addForumReply: (payload) => dispatch({ type: "ADD_FORUM_REPLY", payload }),
      updateForumReply: (payload) =>
        dispatch({ type: "UPDATE_FORUM_REPLY", payload }),
      removeForumReply: (payload) =>
        dispatch({ type: "REMOVE_FORUM_REPLY", payload }),
      toggleForumThreadLike: (id) =>
        dispatch({ type: "TOGGLE_FORUM_THREAD_LIKE", payload: { id } }),
      toggleForumReplyLike: (threadId, replyId) =>
        dispatch({ type: "TOGGLE_FORUM_REPLY_LIKE", payload: { threadId, replyId } }),
      addNotification: (payload) => dispatch({ type: "ADD_NOTIFICATION", payload }),
      markNotification: (id, read) =>
        dispatch({ type: "MARK_NOTIFICATION", payload: { id, read } }),
      dismissNotification: (id) =>
        dispatch({ type: "DISMISS_NOTIFICATION", payload: { id } }),
      toggleFavoriteMedia: (id) =>
        dispatch({ type: "TOGGLE_MEDIA_FAVORITE", payload: { id } }),
      toggleFavoriteSite: (id) =>
        dispatch({ type: "TOGGLE_SITE_FAVORITE", payload: { id } }),
      purgeMemberContent: (payload) =>
        dispatch({ type: "PURGE_MEMBER_CONTENT", payload })
    };
  }, [state]);

  return <DemoDataContext.Provider value={value}>{children}</DemoDataContext.Provider>;
}

export function useDemoData() {
  const context = useContext(DemoDataContext);
  if (!context) {
    throw new Error("useDemoData must be used within a DemoDataProvider");
  }
  return context;
}
