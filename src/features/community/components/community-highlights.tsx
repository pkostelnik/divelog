"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { createPortal } from "react-dom";

import { useDemoData } from "@/providers/demo-data-provider";
import { useAuth } from "@/providers/auth-provider";
import { useI18n } from "@/providers/i18n-provider";
import { type CommunityPostAttachment } from "@/data/mock-data";

const AUTHORED_COMMENT_STORAGE_KEY = "divelog:community-authored-comments";
const ANONYMOUS_AUTHOR_ID_KEY = "divelog:community-anonymous-author-id";
const ALLOWED_ATTACHMENT_MIME_TYPES = ["image/jpeg", "image/png"] as const;
const ALLOWED_ATTACHMENT_LABELS = ["JPEG", "PNG"];
const ALLOWED_ATTACHMENT_TYPES = new Set<string>(ALLOWED_ATTACHMENT_MIME_TYPES);
const MAX_ATTACHMENT_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_ATTACHMENT_SIZE_MB = MAX_ATTACHMENT_SIZE_BYTES / (1024 * 1024);

function createCommentId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `comment-${Math.random().toString(16).slice(2)}-${Date.now()}`;
}

function createAttachmentId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `attachment-${Math.random().toString(16).slice(2)}-${Date.now()}`;
}

function persistAuthoredCommentIds(ids: Set<string>) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(AUTHORED_COMMENT_STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // Ignoriere fehlerhafte oder blockierte Storage-Zugriffe.
  }
}

function loadAuthoredCommentIds() {
  if (typeof window === "undefined") {
    return new Set<string>();
  }

  try {
    const raw = window.localStorage.getItem(AUTHORED_COMMENT_STORAGE_KEY);
    if (!raw) {
      return new Set<string>();
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return new Set<string>();
    }

    const next = new Set<string>();
    parsed.forEach((value) => {
      if (typeof value === "string" && value.trim().length > 0) {
        next.add(value);
      }
    });

    return next;
  } catch {
    return new Set<string>();
  }
}

function generateAnonymousAuthorId() {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? `anon-${crypto.randomUUID()}`
    : `anon-${Math.random().toString(16).slice(2)}-${Date.now()}`;
}

function ensureAnonymousAuthorId() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(ANONYMOUS_AUTHOR_ID_KEY);
    if (stored && stored.trim().length > 0) {
      return stored;
    }

    const generated = generateAnonymousAuthorId();

    window.localStorage.setItem(ANONYMOUS_AUTHOR_ID_KEY, generated);
    return generated;
  } catch {
    return null;
  }
}

type CommentFormProps = {
  postId: string;
  onSubmit: (payload: {
    author: string;
    authorId?: string;
    authorEmail?: string;
    message: string;
  }) => void;
  currentUserId?: string | null;
  currentUserEmail?: string | null;
  currentUserName?: string | null;
  fallbackAuthorId?: string | null;
};

function CommentForm({
  postId,
  onSubmit,
  currentUserId,
  currentUserEmail,
  currentUserName,
  fallbackAuthorId
}: CommentFormProps) {
  const { t } = useI18n();
  const authorId = `comment-author-${postId}`;
  const messageId = `comment-message-${postId}`;
  const lockedAuthor = Boolean(currentUserName?.trim());
  const resolvedAuthor = currentUserName?.trim() ?? "";

  const [author, setAuthor] = useState(resolvedAuthor);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setAuthor(resolvedAuthor);
  }, [resolvedAuthor]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const authorValue = lockedAuthor ? resolvedAuthor : author.trim();
    const messageValue = message.trim();

    if (authorValue.length < 2 || messageValue.length < 3) {
      return;
    }

    onSubmit({
      author: authorValue,
      authorId: lockedAuthor ? currentUserId ?? undefined : fallbackAuthorId ?? undefined,
      authorEmail: lockedAuthor ? currentUserEmail ?? undefined : undefined,
      message: messageValue
    });
    setMessage("");
    if (!lockedAuthor) {
      setAuthor("");
    }
  };

  return (
    <form className="mt-4 space-y-3 border-t border-slate-200 pt-4" onSubmit={handleSubmit}>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600" htmlFor={authorId}>
          {t("dashboard.community.highlights.commentForm.fields.author.label")}
          <input
            id={authorId}
            name="author"
            value={author}
            onChange={(event) => {
              if (!lockedAuthor) {
                setAuthor(event.target.value);
              }
            }}
            placeholder={t("dashboard.community.highlights.commentForm.fields.author.placeholder")}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            required
            minLength={2}
            readOnly={lockedAuthor}
          />
        </label>
        <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600 md:col-span-2" htmlFor={messageId}>
          {t("dashboard.community.highlights.commentForm.fields.message.label")}
          <textarea
            id={messageId}
            name="message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={t("dashboard.community.highlights.commentForm.fields.message.placeholder")}
            className="min-h-[80px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
            required
            minLength={3}
          />
        </label>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center rounded-xl bg-ocean-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-ocean-700"
        >
          {t("dashboard.community.highlights.commentForm.submit")}
        </button>
      </div>
    </form>
  );
}

type PostAttachmentDraft = CommunityPostAttachment;

type PostEditState = {
  title: string;
  author: string;
  body: string;
  diveLogId: string;
  attachments: PostAttachmentDraft[];
};

type PostAlert = {
  variant: "success" | "error";
  message: string;
};

export function CommunityHighlights() {
  const {
    communityPosts,
    togglePostLike,
    addCommunityComment,
    updateCommunityComment,
    removeCommunityComment,
    diveLogs,
    updateCommunityPost,
    removeCommunityPost
  } = useDemoData();
  const { currentUser } = useAuth();
  const { t, locale } = useI18n();
  const isAdmin = currentUser?.role === "admin";
  const currentUserId = currentUser?.id ?? null;
  const rawCurrentUserEmail = currentUser?.email;
  const rawCurrentUserName = currentUser?.name;
  const currentUserEmail = rawCurrentUserEmail ? rawCurrentUserEmail.trim().toLowerCase() : null;
  const normalizedCurrentUserName = rawCurrentUserName ? rawCurrentUserName.trim().toLowerCase() : null;
  const attachmentTypeList = useMemo(() => ALLOWED_ATTACHMENT_LABELS.join(", "), []);
  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }),
    [locale]
  );
  const diveDateFormatter = useMemo(() => new Intl.DateTimeFormat(locale), [locale]);
  const commentDateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "short", timeStyle: "short" }),
    [locale]
  );

  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [postDraft, setPostDraft] = useState<PostEditState | null>(null);
  const [postAlerts, setPostAlerts] = useState<Partial<Record<string, PostAlert>>>({});
  const [savingPostId, setSavingPostId] = useState<string | null>(null);
  const [hiddenPostIds, setHiddenPostIds] = useState<Set<string>>(() => new Set());
  const [globalAlert, setGlobalAlert] = useState<PostAlert | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [hiddenCommentIds, setHiddenCommentIds] = useState<Record<string, Set<string>>>(() => ({}));
  const [authoredCommentIds, setAuthoredCommentIds] = useState<Set<string>>(() => new Set());
  const [pendingCommentDelete, setPendingCommentDelete] = useState<Record<string, string | null>>(
    () => ({})
  );
  const [draftAttachmentError, setDraftAttachmentError] = useState<string | null>(null);
  const [previewAttachment, setPreviewAttachment] = useState<CommunityPostAttachment | null>(null);
  const anonymousAuthorIdRef = useRef<string | null>(null);

  if (anonymousAuthorIdRef.current === null) {
    const ensured = ensureAnonymousAuthorId();
    if (ensured) {
      anonymousAuthorIdRef.current = ensured;
    } else {
      anonymousAuthorIdRef.current = generateAnonymousAuthorId();
    }
  }

  const anonymousAuthorId = anonymousAuthorIdRef.current;

  useEffect(() => {
    const loaded = loadAuthoredCommentIds();
    if (loaded.size === 0) {
      return;
    }
    setAuthoredCommentIds(new Set(loaded));
  }, []);

  const mutateAuthoredCommentIds = useCallback((mutator: (draft: Set<string>) => void) => {
    setAuthoredCommentIds((previous) => {
      const draft = new Set(previous);
      mutator(draft);

      if (draft.size === previous.size) {
        let identical = true;
        previous.forEach((value) => {
          if (!draft.has(value)) {
            identical = false;
          }
        });
        if (identical) {
          return previous;
        }
      }

      persistAuthoredCommentIds(draft);
      return draft;
    });
  }, []);

  useEffect(() => {
    if (!anonymousAuthorId || communityPosts.length === 0) {
      return;
    }

    const missing = communityPosts.some((post) =>
      post.comments.some(
        (comment) => comment.authorId === anonymousAuthorId && !authoredCommentIds.has(comment.id)
      )
    );

    if (!missing) {
      return;
    }

    mutateAuthoredCommentIds((draft) => {
      communityPosts.forEach((post) => {
        post.comments.forEach((comment) => {
          if (comment.authorId === anonymousAuthorId) {
            draft.add(comment.id);
          }
        });
      });
    });
  }, [anonymousAuthorId, authoredCommentIds, communityPosts, mutateAuthoredCommentIds]);

  const diveLogMap = useMemo(() => new Map(diveLogs.map((log) => [log.id, log])), [diveLogs]);

  const diveOptions = useMemo(() => {
    return diveLogs.map((log) => ({
      id: log.id,
      label: `${log.title} • ${diveDateFormatter.format(new Date(log.date))}`
    }));
  }, [diveLogs, diveDateFormatter]);

  const canManageEntity = (
    authorId: string | undefined,
    authorName: string,
    authorEmail?: string
  ) => {
    if (isAdmin) {
      return true;
    }
    if (currentUserId && authorId && currentUserId === authorId) {
      return true;
    }
    if (anonymousAuthorId && authorId && authorId === anonymousAuthorId) {
      return true;
    }
    if (currentUserEmail && authorEmail && currentUserEmail === authorEmail.trim().toLowerCase()) {
      return true;
    }
    const normalizedAuthor = authorName.trim().toLowerCase();
    return normalizedCurrentUserName !== null && normalizedCurrentUserName === normalizedAuthor;
  };
  const canManagePost = (post: (typeof communityPosts)[number]) =>
    canManageEntity(post.authorId, post.author, post.authorEmail);

  useEffect(() => {
    if (!currentUser || communityPosts.length === 0) {
      return;
    }

    const normalizedName = normalizedCurrentUserName;
    const normalizedEmail = currentUserEmail;
    const patchable = communityPosts.filter((post) => {
      if (post.authorId && post.authorEmail) {
        return false;
      }

      const authorMatchesName = normalizedName
        ? post.author.trim().toLowerCase() === normalizedName
        : false;
      const emailMatches = normalizedEmail
        ? post.authorEmail?.trim().toLowerCase() === normalizedEmail
        : false;

      if (!authorMatchesName && !emailMatches) {
        return false;
      }

      return !post.authorId || !post.authorEmail;
    });

    if (patchable.length === 0) {
      return;
    }

    patchable.forEach((post) => {
      updateCommunityPost({
        id: post.id,
        data: {
          authorId: post.authorId ?? currentUser.id,
          authorEmail: post.authorEmail ?? normalizedEmail ?? undefined
        }
      });
    });
  }, [communityPosts, currentUser, currentUserEmail, normalizedCurrentUserName, updateCommunityPost]);

  useEffect(() => {
    if (!currentUser || communityPosts.length === 0) {
      return;
    }

    const normalizedName = normalizedCurrentUserName;
    const normalizedEmail = currentUserEmail;
    const patches: { postId: string; commentId: string; authorId?: string; authorEmail?: string }[] = [];

    communityPosts.forEach((post) => {
      post.comments.forEach((comment) => {
        if (comment.authorId && comment.authorEmail) {
          return;
        }

        const matchesName = normalizedName
          ? comment.author.trim().toLowerCase() === normalizedName
          : false;
        const matchesEmail = normalizedEmail
          ? comment.authorEmail?.trim().toLowerCase() === normalizedEmail
          : false;

        if (!matchesName && !matchesEmail) {
          return;
        }

        if (comment.authorId && comment.authorEmail) {
          return;
        }

        patches.push({
          postId: post.id,
          commentId: comment.id,
          authorId: comment.authorId ?? currentUser.id,
          authorEmail: comment.authorEmail ?? normalizedEmail ?? undefined
        });
      });
    });

    if (patches.length === 0) {
      return;
    }

    patches.forEach((patch) => {
      updateCommunityComment({
        postId: patch.postId,
        commentId: patch.commentId,
        data: {
          authorId: patch.authorId,
          authorEmail: patch.authorEmail
        }
      });
    });
  }, [communityPosts, currentUser, currentUserEmail, normalizedCurrentUserName, updateCommunityComment]);

  useEffect(() => {
    setHiddenPostIds((previous) => {
      if (previous.size === 0) {
        return previous;
      }

      const remaining = new Set<string>();
      communityPosts.forEach((post) => {
        if (previous.has(post.id)) {
          remaining.add(post.id);
        }
      });

      if (remaining.size === previous.size) {
        let identical = true;
        previous.forEach((id) => {
          if (!remaining.has(id)) {
            identical = false;
          }
        });
        if (identical) {
          return previous;
        }
      }

      return remaining;
    });
  }, [communityPosts]);

  useEffect(() => {
    const existingCommentIds = new Set<string>();
    communityPosts.forEach((post) => {
      post.comments.forEach((comment) => {
        existingCommentIds.add(comment.id);
      });
    });

    setHiddenCommentIds((previous) => {
      let changed = false;
      const next: Record<string, Set<string>> = {};

      Object.entries(previous).forEach(([postId, ids]) => {
        const post = communityPosts.find((item) => item.id === postId);
        if (!post) {
          changed = true;
          return;
        }

        const retained = new Set<string>();

        ids.forEach((id) => {
          if (existingCommentIds.has(id)) {
            retained.add(id);
          } else {
            changed = true;
          }
        });

        if (retained.size > 0) {
          next[postId] = retained;
        } else if (ids.size > 0) {
          changed = true;
        }
      });

      if (!changed) {
        return previous;
      }

      return next;
    });

    mutateAuthoredCommentIds((draft) => {
      Array.from(draft).forEach((id) => {
        if (!existingCommentIds.has(id)) {
          draft.delete(id);
        }
      });
    });

    setPendingCommentDelete((previous) => {
      let changed = false;
      const next: Record<string, string | null> = {};

      Object.entries(previous).forEach(([postId, commentId]) => {
        if (!commentId) {
          next[postId] = null;
          return;
        }

        if (existingCommentIds.has(commentId)) {
          next[postId] = commentId;
        } else {
          next[postId] = null;
          changed = true;
        }
      });

      if (!changed) {
        return previous;
      }

      return next;
    });
  }, [communityPosts, mutateAuthoredCommentIds]);

  const setPostAlert = (postId: string, alert: PostAlert | null) => {
    setPostAlerts((previous) => {
      if (!alert) {
        const { [postId]: _removed, ...rest } = previous;
        return rest;
      }
      return { ...previous, [postId]: alert };
    });
  };

  const handleCommentSubmit = (
    postId: string
  ) =>
    ({
      author,
      authorId,
      authorEmail,
      message
    }: {
      author: string;
      authorId?: string;
      authorEmail?: string;
      message: string;
    }) => {
      const commentId = createCommentId();

      addCommunityComment({
        postId,
        id: commentId,
        author,
        authorId: authorId ?? anonymousAuthorId ?? undefined,
        authorEmail,
        message
      });

      mutateAuthoredCommentIds((draft) => {
        draft.add(commentId);
      });

      setPostAlert(postId, {
        variant: "success",
        message: t("dashboard.community.highlights.alert.comment.added")
      });
    };

  const startEditingPost = (postId: string) => {
    const post = communityPosts.find((item) => item.id === postId);
    if (!post || !canManagePost(post)) {
      return;
    }

    setPostAlert(postId, null);
    setGlobalAlert(null);
    setPendingDeleteId(null);
    setEditingPostId(postId);
    setPostDraft({
      title: post.title,
      author: post.author,
      body: post.body,
      diveLogId: post.diveLogId ?? "",
      attachments: (post.attachments ?? []).map((attachment) => ({
        ...attachment,
        title: attachment.title,
        source: attachment.source ?? "upload",
        type: "image"
      }))
    });
    setDraftAttachmentError(null);
  };

  const cancelEditingPost = () => {
    if (editingPostId) {
      setPostAlert(editingPostId, null);
    }
    setGlobalAlert(null);
    setPendingDeleteId(null);
    setEditingPostId(null);
    setPostDraft(null);
    setDraftAttachmentError(null);
  };

  const handleDraftChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    if (name === "author" && !isAdmin) {
      return;
    }
    setPostDraft((previous) => (previous ? { ...previous, [name]: value } : previous));
  };

  const handleDraftAttachmentUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!postDraft || files.length === 0) {
      return;
    }

    setDraftAttachmentError(null);
    let hadError = false;

    files.forEach((file) => {
      if (!ALLOWED_ATTACHMENT_TYPES.has(file.type)) {
        setDraftAttachmentError(
          t("dashboard.community.highlights.form.attachments.error.type").replace(
            "{types}",
            attachmentTypeList
          )
        );
        hadError = true;
        return;
      }
      if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
        setDraftAttachmentError(
          t("dashboard.community.highlights.form.attachments.error.size").replace(
            "{size}",
            numberFormatter.format(MAX_ATTACHMENT_SIZE_MB)
          )
        );
        hadError = true;
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result !== "string") {
          return;
        }
        const title = file.name.replace(/\.[^.]+$/, "").trim() ||
          t("dashboard.community.highlights.form.attachments.fallbackTitle");
        setPostDraft((previous) => {
          if (!previous) {
            return previous;
          }
          return {
            ...previous,
            attachments: [
              ...previous.attachments,
              {
                id: createAttachmentId(),
                url: result,
                title,
                fileName: file.name,
                source: "upload",
                type: "image"
              }
            ]
          };
        });
        if (!hadError) {
          setDraftAttachmentError(null);
        }
      };
      reader.readAsDataURL(file);
    });

    event.target.value = "";
  };

  const handleDraftAttachmentRemove = (attachmentId: string) => {
    setPostDraft((previous) => {
      if (!previous) {
        return previous;
      }
      return {
        ...previous,
        attachments: previous.attachments.filter((item) => item.id !== attachmentId)
      };
    });
  };

  const openAttachmentPreview = (attachment: CommunityPostAttachment) => {
    setPreviewAttachment(attachment);
  };

  const closeAttachmentPreview = () => {
    setPreviewAttachment(null);
  };

  const handlePostSubmit = (event: FormEvent<HTMLFormElement>, postId: string) => {
    event.preventDefault();
    if (editingPostId !== postId || !postDraft) {
      return;
    }

    const target = communityPosts.find((item) => item.id === postId);
    if (!target || !canManagePost(target)) {
      setPostAlert(postId, {
        variant: "error",
        message: t("dashboard.community.highlights.alert.post.cannotEdit")
      });
      return;
    }

    const title = postDraft.title.trim();
    const author = postDraft.author.trim();
    const body = postDraft.body.trim();
    const diveLogId = postDraft.diveLogId.trim();
    const attachments = postDraft.attachments.map((attachment) => ({
      ...attachment,
      title:
        attachment.title.trim() ||
        attachment.fileName ||
        t("dashboard.community.highlights.form.attachments.fallbackTitle"),
      type: "image" as const
    }));

    if (title.length < 3) {
      setPostAlert(postId, {
        variant: "error",
        message: t("dashboard.community.highlights.alert.post.titleMin")
      });
      return;
    }

    if (author.length < 2) {
      setPostAlert(postId, {
        variant: "error",
        message: t("dashboard.community.highlights.alert.post.authorMin")
      });
      return;
    }

    if (body.length < 10) {
      setPostAlert(postId, {
        variant: "error",
        message: t("dashboard.community.highlights.alert.post.bodyMin")
      });
      return;
    }

    setGlobalAlert(null);
    setSavingPostId(postId);
    updateCommunityPost({
      id: postId,
      data: {
        title,
        author,
        body,
        authorId: target.authorId,
        authorEmail: target.authorEmail,
        diveLogId: diveLogId.length > 0 ? diveLogId : "",
        attachments
      }
    });
    setSavingPostId(null);
    setDraftAttachmentError(null);

    setPostAlert(postId, {
      variant: "success",
      message: t("dashboard.community.highlights.alert.post.updated")
    });
    setEditingPostId(null);
    setPostDraft(null);
  };

  const handlePostDeleteRequest = (post: (typeof communityPosts)[number]) => {
    if (!canManagePost(post)) {
      return;
    }
    setGlobalAlert(null);
    setPendingDeleteId(post.id);
    setPostAlert(post.id, {
      variant: "error",
      message: t("dashboard.community.highlights.alert.post.deleteConfirm")
    });
  };

  const cancelPostDelete = () => {
    if (pendingDeleteId) {
      setPostAlert(pendingDeleteId, null);
    }
    setPendingDeleteId(null);
  };

  const handlePostDelete = (post: (typeof communityPosts)[number]) => {
    if (!canManagePost(post)) {
      return;
    }

    removeCommunityPost(post.id);
    setHiddenPostIds((previous) => {
      const next = new Set(previous);
      next.add(post.id);
      return next;
    });
    if (editingPostId === post.id) {
      setEditingPostId(null);
      setPostDraft(null);
      setDraftAttachmentError(null);
    }
    setPostAlert(post.id, null);
    setGlobalAlert({
      variant: "success",
      message: t("dashboard.community.highlights.alert.post.deleted")
    });
    setPendingDeleteId(null);
  };

  const handleCommentDelete = (postId: string, commentId: string) => {
    const post = communityPosts.find((item) => item.id === postId);
    if (!post) {
      return;
    }

    const targetComment = post.comments.find((item) => item.id === commentId);
    const ownsComment = authoredCommentIds.has(commentId);
    const canManage = targetComment
      ? canManageEntity(targetComment.authorId, targetComment.author, targetComment.authorEmail) || ownsComment
      : false;
    if (!targetComment || !canManage) {
      return;
    }

    removeCommunityComment({ postId, commentId });
    setHiddenCommentIds((previous) => {
      const next = { ...previous };
      const set = new Set(next[postId] ?? []);
      set.add(commentId);
      next[postId] = set;
      return next;
    });
    mutateAuthoredCommentIds((draft) => {
      draft.delete(commentId);
    });
    setPendingCommentDelete((previous) => ({ ...previous, [postId]: null }));
    setPostAlert(postId, {
      variant: "success",
      message: t("dashboard.community.highlights.alert.comment.deleted")
    });
  };

  const requestCommentDelete = (postId: string, commentId: string) => {
    const post = communityPosts.find((item) => item.id === postId);
    if (!post) {
      return;
    }

    const targetComment = post.comments.find((item) => item.id === commentId);
    if (!targetComment) {
      return;
    }

    const ownsComment = authoredCommentIds.has(commentId);
    const canManage = canManageEntity(
      targetComment.authorId,
      targetComment.author,
      targetComment.authorEmail
    );

    if (!canManage && !ownsComment) {
      return;
    }

    setPendingCommentDelete((previous) => ({ ...previous, [postId]: commentId }));
    setPostAlert(postId, {
      variant: "error",
      message: t("dashboard.community.highlights.alert.comment.deleteConfirm")
    });
  };

  const cancelCommentDelete = (postId: string) => {
    setPendingCommentDelete((previous) => ({ ...previous, [postId]: null }));
    setPostAlert(postId, null);
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-slate-900">{t("dashboard.community.highlights.heading")}</h2>
      {globalAlert && (
        <p
          role="alert"
          aria-live="polite"
          className={`rounded-xl border px-4 py-3 text-xs font-semibold ${globalAlert.variant === "error" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}
        >
          {globalAlert.message}
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {communityPosts
          .filter((post) => !hiddenPostIds.has(post.id))
          .map((post) => {
          const linkedDive = post.diveLogId ? diveLogMap.get(post.diveLogId) : undefined;
          const comments = Array.isArray(post.comments)
            ? [...post.comments]
                .filter((comment) => !(hiddenCommentIds[post.id]?.has(comment.id) ?? false))
                .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
            : [];
          const isEditing = editingPostId === post.id;
          const draft = isEditing && postDraft ? postDraft : null;
          const alert = postAlerts[post.id];
          const saving = savingPostId === post.id;
          const canManage = canManagePost(post);

          return (
            <article
              key={post.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              {isEditing ? (
                <form className="space-y-3" onSubmit={(event) => handlePostSubmit(event, post.id)}>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
                      {t("dashboard.community.postForm.fields.title.label")}
                      <input
                        name="title"
                        value={draft?.title ?? post.title}
                        onChange={handleDraftChange}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                        required
                        minLength={3}
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
                      {t("dashboard.community.postForm.fields.author.label")}
                      <input
                        name="author"
                        value={draft?.author ?? post.author}
                        onChange={handleDraftChange}
                        readOnly={!isAdmin}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                        required
                        minLength={2}
                      />
                    </label>
                  </div>
                  <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
                    {t("dashboard.community.postForm.fields.body.label")}
                    <textarea
                      name="body"
                      value={draft?.body ?? post.body}
                      onChange={handleDraftChange}
                      className="min-h-[120px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                      required
                      minLength={10}
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
                    {t("dashboard.community.postForm.fields.dive.label")}
                    <select
                      name="diveLogId"
                      value={draft?.diveLogId ?? post.diveLogId ?? ""}
                      onChange={handleDraftChange}
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                    >
                      <option value="">{t("dashboard.community.postForm.fields.dive.placeholder")}</option>
                      {diveOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="space-y-2 text-xs font-semibold text-slate-600">
                    <span>{t("dashboard.community.postForm.attachments.label")}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleDraftAttachmentUpload}
                      className="rounded-xl border border-dashed border-slate-300 bg-white px-3 py-2 text-sm shadow-sm file:mr-3 file:rounded-lg file:border-0 file:bg-ocean-600 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                    />
                    {draftAttachmentError ? (
                      <p className="text-xs font-normal text-rose-600">{draftAttachmentError}</p>
                    ) : (
                      <p className="text-[11px] font-normal text-slate-500">
                        {t("dashboard.community.postForm.attachments.helper")
                          .replace("{types}", attachmentTypeList)
                          .replace("{size}", numberFormatter.format(MAX_ATTACHMENT_SIZE_MB))}
                      </p>
                    )}
                    {(draft?.attachments ?? []).length > 0 && (
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {(draft?.attachments ?? []).map((attachment) => (
                          <li key={attachment.id}>
                            <div className="overflow-hidden rounded-xl border border-slate-200">
                              <button
                                type="button"
                                onClick={() => openAttachmentPreview(attachment)}
                                className="group block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-400"
                                title={attachment.fileName ?? attachment.title}
                              >
                                <div className="relative aspect-video bg-slate-100">
                                  <Image
                                    src={attachment.url}
                                    alt={attachment.title}
                                    fill
                                    className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    unoptimized
                                  />
                                </div>
                              </button>
                              <div className="flex items-center justify-between gap-2 px-3 py-2 text-[11px] font-medium text-slate-600">
                                <span className="line-clamp-1" title={attachment.fileName ?? attachment.title}>
                                  {attachment.fileName ?? attachment.title}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleDraftAttachmentRemove(attachment.id)}
                                  className="rounded-lg border border-slate-300 px-2 py-1 text-[10px] font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-700"
                                >
                                  {t("dashboard.community.postForm.attachments.remove")}
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center rounded-xl bg-ocean-600 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-ocean-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving
                        ? t("dashboard.community.highlights.form.actions.saving")
                        : t("dashboard.community.highlights.form.actions.save")}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditingPost}
                      className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-600 shadow-sm transition hover:border-slate-400 hover:text-slate-700"
                    >
                      {t("dashboard.community.highlights.form.actions.cancel")}
                    </button>
                    <span className="text-[11px] text-slate-500">
                      {t("dashboard.community.highlights.form.meta.stats")
                        .replace("{likes}", post.likes.toString())
                        .replace("{comments}", comments.length.toString())}
                    </span>
                  </div>
                </form>
              ) : (
                <>
                  <header className="space-y-1">
                    <h3 className="text-base font-semibold text-slate-900">{post.title}</h3>
                    <p className="text-xs text-slate-500">
                      {t("dashboard.community.highlights.view.meta.author").replace(
                        "{author}",
                        post.author
                      )}
                    </p>
                    {linkedDive && (
                      <p className="text-xs text-slate-500">
                        {t("dashboard.community.highlights.view.meta.linkedDive")
                          .replace("{title}", linkedDive.title)
                          .replace(
                            "{date}",
                            diveDateFormatter.format(new Date(linkedDive.date))
                          )}
                      </p>
                    )}
                  </header>
                  <p className="mt-3 text-sm text-slate-600">{post.body}</p>
                  {(post.attachments ?? []).length > 0 && (
                    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                      {(post.attachments ?? []).map((attachment) => {
                        const unoptimized =
                          attachment.source === "upload" || !isOptimizableImageUrl(attachment.url);
                        return (
                          <li key={attachment.id}>
                            <button
                              type="button"
                              onClick={() => openAttachmentPreview(attachment)}
                              className="group block w-full overflow-hidden rounded-xl border border-slate-200 text-left transition hover:border-ocean-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-400"
                              title={attachment.fileName ?? attachment.title}
                            >
                              <div className="relative h-full w-full overflow-hidden">
                                <div className="relative aspect-video bg-slate-100">
                                  <Image
                                    src={attachment.url}
                                    alt={attachment.title}
                                    fill
                                    className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    unoptimized={unoptimized}
                                  />
                                </div>
                              </div>
                              <div className="flex items-center justify-between gap-2 px-3 py-2 text-[11px] font-medium text-slate-600">
                                <span className="line-clamp-1">{attachment.title}</span>
                                <span
                                  className="text-[13px] text-slate-500 transition group-hover:text-ocean-600"
                                  role="img"
                                  aria-label={t("dashboard.community.highlights.view.attachments.badge")}
                                  title={attachment.fileName ?? attachment.title}
                                >
                                  📎
                                </span>
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <button
                      type="button"
                      onClick={() => togglePostLike(post.id)}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 font-semibold text-ocean-700 transition hover:border-ocean-300 hover:text-ocean-800"
                    >
                      {post.likedByMe
                        ? t("dashboard.community.highlights.view.actions.like.active")
                        : t("dashboard.community.highlights.view.actions.like.inactive")}
                      <span className="font-medium text-slate-600">{post.likes}</span>
                    </button>
                    <span>
                      {t("dashboard.community.highlights.view.meta.commentsCount").replace(
                        "{count}",
                        comments.length.toString()
                      )}
                    </span>
                    {canManage && (
                      pendingDeleteId === post.id ? (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handlePostDelete(post)}
                            className="inline-flex items-center rounded-full border border-rose-300 bg-rose-600 px-3 py-1 font-semibold text-white transition hover:bg-rose-700"
                          >
                            {t("dashboard.community.highlights.view.actions.deleteConfirm")}
                          </button>
                          <button
                            type="button"
                            onClick={cancelPostDelete}
                            className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-700"
                          >
                            {t("dashboard.community.highlights.view.actions.cancel")}
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => startEditingPost(post.id)}
                            className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-700"
                          >
                            {t("dashboard.community.highlights.view.actions.edit")}
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePostDeleteRequest(post)}
                            className="inline-flex items-center rounded-full border border-rose-200 px-3 py-1 font-semibold text-rose-700 transition hover:border-rose-300 hover:text-rose-800"
                          >
                            {t("dashboard.community.highlights.view.actions.delete")}
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </>
              )}
              {alert && (
                <p
                  role="alert"
                  aria-live="polite"
                  className={`mt-3 text-xs font-semibold ${
                    alert.variant === "error" ? "text-rose-600" : "text-emerald-600"
                  }`}
                >
                  {alert.message}
                </p>
              )}
              <section className="mt-4 space-y-3">
                {comments.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    {t("dashboard.community.highlights.comments.empty")}
                  </p>
                ) : (
                  comments.map((comment) => {
                    const canManageComment =
                      canManageEntity(comment.authorId, comment.author, comment.authorEmail) ||
                      authoredCommentIds.has(comment.id);
                    const isPendingDelete = pendingCommentDelete[post.id] === comment.id;
                    return (
                      <div
                        key={comment.id}
                        className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
                      >
                        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between md:gap-3">
                          <p className="text-xs font-semibold text-slate-700">
                            {comment.author}
                            <span className="ml-2 text-[10px] font-normal text-slate-500">
                              {commentDateFormatter.format(new Date(comment.createdAt))}
                            </span>
                          </p>
                          {canManageComment && (
                            isPendingDelete ? (
                              <div className="flex items-center gap-2 text-[10px]">
                                <button
                                  type="button"
                                  onClick={() => handleCommentDelete(post.id, comment.id)}
                                  className="rounded-full bg-rose-600 px-3 py-1 font-semibold text-white shadow-sm transition hover:bg-rose-700"
                                >
                                  {t("dashboard.community.highlights.comments.actions.deleteConfirm")}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => cancelCommentDelete(post.id)}
                                  className="rounded-full border border-slate-300 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-700"
                                >
                                  {t("dashboard.community.highlights.comments.actions.cancel")}
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => requestCommentDelete(post.id, comment.id)}
                                className="text-[10px] font-semibold text-rose-700 transition hover:text-rose-800"
                              >
                                {t("dashboard.community.highlights.comments.actions.delete")}
                              </button>
                            )
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-600">{comment.message}</p>
                      </div>
                    );
                  })
                )}
              </section>
              <CommentForm
                postId={post.id}
                currentUserId={currentUserId}
                currentUserEmail={currentUserEmail}
                currentUserName={rawCurrentUserName ?? null}
                fallbackAuthorId={anonymousAuthorId}
                onSubmit={handleCommentSubmit(post.id)}
              />
            </article>
          );
        })}
      </div>
      {previewAttachment && (
        <AttachmentPreviewOverlay
          attachment={previewAttachment}
          onClose={closeAttachmentPreview}
        />
      )}
    </div>
  );
}

function AttachmentPreviewOverlay({
  attachment,
  onClose
}: {
  attachment: CommunityPostAttachment;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Focus the close button when opened
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
      // Keep focus within the dialog
      if (event.key === "Tab") {
        event.preventDefault();
        closeButtonRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  if (typeof document === "undefined") {
    return null;
  }

  const unoptimized = attachment.source === "upload" || !isOptimizableImageUrl(attachment.url);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-6"
      role="dialog"
      aria-modal="true"
      aria-label={t("dashboard.community.highlights.preview.ariaLabel").replace(
        "{title}",
        attachment.title
      )}
      onClick={onClose}
    >
      <div
        className="relative z-10 flex w-full max-w-4xl flex-col gap-4 overflow-hidden rounded-3xl bg-slate-950/90 p-4 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex items-center justify-center rounded-full border border-slate-600 bg-slate-900/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:border-slate-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-400"
        >
          {t("dashboard.community.highlights.preview.close")}
        </button>
        <div className="flex max-h-[70vh] w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-900">
          <Image
            src={attachment.url}
            alt={attachment.title}
            width={1600}
            height={1000}
            className="h-full w-full max-h-[70vh] object-contain"
            sizes="100vw"
            unoptimized={unoptimized}
            priority
          />
        </div>
        <div className="space-y-1 text-sm text-slate-300">
          <p className="text-base font-semibold text-white">{attachment.title}</p>
          {attachment.fileName && (
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {t("dashboard.community.highlights.preview.fileLabel").replace(
                "{file}",
                attachment.fileName
              )}
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function isOptimizableImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    return parsed.hostname === "images.unsplash.com";
  } catch (error) {
    console.warn("Unable to verify attachment URL", error);
    return false;
  }
}
