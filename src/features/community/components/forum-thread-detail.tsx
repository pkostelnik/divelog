"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";

import { useDemoData } from "@/providers/demo-data-provider";
import { useAuth } from "@/providers/auth-provider";

const ANONYMOUS_AUTHOR_ID_KEY = "divelog:community-anonymous-author-id";

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

function formatDate(value: string) {
  return new Date(value).toLocaleString("de-DE", {
    dateStyle: "short",
    timeStyle: "short"
  });
}

type ReplyFormProps = {
  onSubmit: (payload: { author: string; authorId?: string; message: string }) => void;
  currentUserId?: string | null;
  currentUserName?: string | null;
  anonymousAuthorId?: string | null;
};

function ReplyForm({ onSubmit, currentUserId, currentUserName, anonymousAuthorId }: ReplyFormProps) {
  const resolvedAuthor = currentUserName?.trim() ?? "";
  const authorLocked = resolvedAuthor.length > 0;

  const [author, setAuthor] = useState(resolvedAuthor);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAuthor(resolvedAuthor);
  }, [resolvedAuthor]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedAuthor = authorLocked ? resolvedAuthor : author.trim();
    const trimmedMessage = message.trim();

    if (trimmedAuthor.length < 2 || trimmedMessage.length < 3) {
      setError("Bitte einen Namen und eine Nachricht eingeben.");
      return;
    }

    onSubmit({
      author: trimmedAuthor,
      authorId: authorLocked
        ? currentUserId ?? undefined
        : anonymousAuthorId ?? undefined,
      message: trimmedMessage
    });
    if (!authorLocked) {
      setAuthor("");
    }
    setMessage("");
    setError(null);
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
          Name
          <input
            name="author"
            value={author}
            onChange={(event) => {
              if (!authorLocked) {
                setAuthor(event.target.value);
              }
            }}
            placeholder="Dein Name"
            readOnly={authorLocked}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
          />
        </label>
        <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600 md:col-span-2">
          Antwort
          <textarea
            name="message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Teile deine Gedanken oder Tipps"
            className="min-h-[100px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
          />
        </label>
      </div>
      {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center rounded-xl bg-ocean-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-ocean-700"
        >
          Antwort posten
        </button>
      </div>
    </form>
  );
}

type ForumThreadDetailProps = {
  threadId: string;
};

type ThreadDraft = {
  title: string;
  author: string;
  categoryId: string;
  body: string;
};

type ReplyDraft = {
  author: string;
  message: string;
};

type AlertMessage = {
  variant: "success" | "error";
  message: string;
};

export function ForumThreadDetail({ threadId }: ForumThreadDetailProps) {
  const {
    forumThreads,
    forumCategories,
    addForumReply,
    toggleForumThreadLike,
    toggleForumReplyLike,
    updateForumThread,
    removeForumThread,
    updateForumReply,
    removeForumReply
  } = useDemoData();
  const { currentUser } = useAuth();
  const router = useRouter();
  const isAdmin = currentUser?.role === "admin";
  const currentUserId = currentUser?.id ?? null;
  const normalizedCurrentUserName = currentUser?.name.trim().toLowerCase() ?? null;

  const anonymousAuthorIdRef = useRef<string | null>(
    typeof window !== "undefined" && !currentUserId ? ensureAnonymousAuthorId() : null
  );

  useEffect(() => {
    if (!currentUserId) {
      anonymousAuthorIdRef.current = ensureAnonymousAuthorId();
    } else {
      anonymousAuthorIdRef.current = null;
    }
  }, [currentUserId]);

  const canManageEntity = useCallback(
    (authorId: string | undefined, authorName: string) => {
      if (isAdmin) {
        return true;
      }
      if (currentUserId && authorId && currentUserId === authorId) {
        return true;
      }
      const anonymousAuthorId = anonymousAuthorIdRef.current;
      if (!currentUserId && anonymousAuthorId && authorId && authorId === anonymousAuthorId) {
        return true;
      }
      const normalizedAuthor = authorName.trim().toLowerCase();
      return normalizedCurrentUserName !== null && normalizedCurrentUserName === normalizedAuthor;
    },
    [isAdmin, currentUserId, normalizedCurrentUserName]
  );

  const [isEditingThread, setIsEditingThread] = useState(false);
  const [threadDraft, setThreadDraft] = useState<ThreadDraft | null>(null);
  const [threadAlert, setThreadAlert] = useState<AlertMessage | null>(null);
  const [savingThread, setSavingThread] = useState(false);

  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState<ReplyDraft>({ author: "", message: "" });
  const [replyAlerts, setReplyAlerts] = useState<Partial<Record<string, AlertMessage>>>({});
  const [savingReply, setSavingReply] = useState<string | null>(null);
  const [pendingThreadDelete, setPendingThreadDelete] = useState(false);
  const [pendingReplyDeleteId, setPendingReplyDeleteId] = useState<string | null>(null);

  const thread = forumThreads.find((item) => item.id === threadId);

  useEffect(() => {
    if (!thread) {
      if (pendingReplyDeleteId) {
        setPendingReplyDeleteId(null);
      }
      setPendingThreadDelete(false);
      return;
    }

    if (
      pendingReplyDeleteId &&
      !thread.replies.some((reply) => reply.id === pendingReplyDeleteId)
    ) {
      setPendingReplyDeleteId(null);
    }
  }, [thread, pendingReplyDeleteId]);

  const submitNewReply = useCallback(
    ({ author, authorId, message }: { author: string; authorId?: string; message: string }) => {
      if (!thread) {
        return;
      }

      let resolvedAuthorId = authorId;
      if (!currentUserId) {
        const ensured = anonymousAuthorIdRef.current ?? ensureAnonymousAuthorId();
        anonymousAuthorIdRef.current = ensured;
        if (ensured) {
          resolvedAuthorId = ensured;
        }
      }

      addForumReply({ threadId: thread.id, author, authorId: resolvedAuthorId, message });
    },
    [addForumReply, currentUserId, thread]
  );

  if (!thread) {
    return (
      <div className="space-y-4">
        <p className="text-base font-semibold text-rose-600">
          Thread wurde nicht gefunden oder wurde bereits entfernt.
        </p>
        <Link
          href="/dashboard/community/forum"
          className="inline-flex items-center gap-2 text-sm font-semibold text-ocean-600"
        >
          Zurück zur Übersicht
          <span aria-hidden>→</span>
        </Link>
      </div>
    );
  }

  const canManageThread = canManageEntity(thread.authorId, thread.author);

  const category = forumCategories.find((item) => item.id === thread.categoryId);
  const replyCount = thread.replies.length;

  const paragraphs = thread.body.split(/\n+/).map((part) => part.trim()).filter(Boolean);

  const handleThreadDraftChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    if (name === "author" && !isAdmin) {
      return;
    }
    setThreadDraft((previous) => (previous ? { ...previous, [name]: value } : previous));
  };

  const handleThreadSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!threadDraft || !canManageThread) {
      if (!canManageThread) {
        setThreadAlert({ variant: "error", message: "Du kannst diesen Thread nicht bearbeiten." });
      }
      return;
    }

    const title = threadDraft.title.trim();
    const author = threadDraft.author.trim();
    const body = threadDraft.body.trim();
    const categoryId = threadDraft.categoryId || thread.categoryId;

    if (title.length < 3) {
      setThreadAlert({ variant: "error", message: "Titel benötigt mindestens 3 Zeichen." });
      return;
    }

    if (author.length < 2) {
      setThreadAlert({ variant: "error", message: "Bitte einen gültigen Autorennamen angeben." });
      return;
    }

    if (body.length < 10) {
      setThreadAlert({ variant: "error", message: "Der Beitrag sollte mindestens 10 Zeichen enthalten." });
      return;
    }

    setSavingThread(true);
    await updateForumThread({
      id: thread.id,
      data: {
        title,
        author,
        body,
        categoryId
      }
    });
    setSavingThread(false);

    setIsEditingThread(false);
    setThreadDraft(null);
    setThreadAlert({ variant: "success", message: "Thread wurde aktualisiert." });
  };

  const startThreadEditing = () => {
    if (!canManageThread) {
      return;
    }

    setPendingThreadDelete(false);
    setThreadAlert(null);
    setIsEditingThread(true);
    setThreadDraft({
      title: thread.title,
      author: thread.author,
      categoryId: thread.categoryId,
      body: thread.body
    });
  };

  const cancelThreadEditing = () => {
    setIsEditingThread(false);
    setThreadDraft(null);
    setThreadAlert(null);
    setPendingThreadDelete(false);
  };

  const requestThreadDelete = () => {
    if (!canManageThread) {
      return;
    }

    setThreadAlert(null);
    setPendingThreadDelete(true);
  };

  const cancelThreadDeleteRequest = () => {
    setPendingThreadDelete(false);
  };

  const confirmThreadDelete = () => {
    if (!canManageThread) {
      return;
    }

    setPendingThreadDelete(false);
    removeForumThread(thread.id);
    router.push("/dashboard/community/forum");
  };

  const setReplyAlert = (replyId: string, alert: AlertMessage | null) => {
    setReplyAlerts((previous) => {
      if (!alert) {
        const { [replyId]: _removed, ...rest } = previous;
        return rest;
      }
      return { ...previous, [replyId]: alert };
    });
  };

  const startReplyEditing = (replyId: string) => {
    const target = thread.replies.find((item) => item.id === replyId);
    if (!target || !canManageEntity(target.authorId, target.author)) {
      return;
    }

    setPendingReplyDeleteId(null);
    setReplyAlert(replyId, null);
    setEditingReplyId(replyId);
    setReplyDraft({ author: target.author, message: target.message });
  };

  const cancelReplyEditing = () => {
    if (editingReplyId) {
      setReplyAlert(editingReplyId, null);
    }
    setEditingReplyId(null);
    setReplyDraft({ author: "", message: "" });
  };

  const handleReplyDraftChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    if (name === "author" && !isAdmin) {
      return;
    }
    setReplyDraft((previous) => ({ ...previous, [name]: value }));
  };

  const handleReplySubmit = async (event: FormEvent<HTMLFormElement>, replyId: string) => {
    event.preventDefault();
    const target = thread.replies.find((item) => item.id === replyId);
    if (!target || !canManageEntity(target.authorId, target.author)) {
      setReplyAlert(replyId, {
        variant: "error",
        message: "Du kannst diese Antwort nicht bearbeiten."
      });
      return;
    }

    const author = replyDraft.author.trim();
    const message = replyDraft.message.trim();

    if (author.length < 2) {
      setReplyAlert(replyId, {
        variant: "error",
        message: "Autor:in benötigt mindestens 2 Zeichen."
      });
      return;
    }

    if (message.length < 3) {
      setReplyAlert(replyId, {
        variant: "error",
        message: "Nachricht benötigt mindestens 3 Zeichen."
      });
      return;
    }

    setSavingReply(replyId);
    await updateForumReply({
      threadId: thread.id,
      replyId,
      data: {
        author,
        authorId: target.authorId,
        message
      }
    });
    setSavingReply(null);

    setReplyAlert(replyId, { variant: "success", message: "Antwort wurde aktualisiert." });
    setEditingReplyId(null);
    setReplyDraft({ author: "", message: "" });
  };

  const requestReplyDelete = (replyId: string) => {
    const target = thread.replies.find((item) => item.id === replyId);
    if (!target || !canManageEntity(target.authorId, target.author)) {
      return;
    }

    setReplyAlert(replyId, null);
    setPendingReplyDeleteId(replyId);
  };

  const cancelReplyDeleteRequest = () => {
    setPendingReplyDeleteId(null);
  };

  const confirmReplyDelete = (replyId: string) => {
    const target = thread.replies.find((item) => item.id === replyId);
    if (!target || !canManageEntity(target.authorId, target.author)) {
      return;
    }

    setPendingReplyDeleteId(null);
    removeForumReply({ threadId: thread.id, replyId });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <Link href="/dashboard/community/forum" className="text-ocean-600 hover:underline">
            ← Zurück
          </Link>
          <span>Thread gestartet von {thread.author}</span>
          <span>Kategorie: {category?.title ?? "Community"}</span>
          <span>Erstellt: {formatDate(thread.createdAt)}</span>
          <span>Letzte Aktivität: {formatDate(thread.lastActivity)}</span>
        </div>
        {isEditingThread ? (
          <form className="space-y-4" onSubmit={handleThreadSubmit}>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
                Titel
                <input
                  name="title"
                  value={threadDraft?.title ?? thread.title}
                  onChange={handleThreadDraftChange}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                  required
                  minLength={3}
                />
              </label>
              <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
                Kategorie
                <select
                  name="categoryId"
                  value={threadDraft?.categoryId ?? thread.categoryId}
                  onChange={handleThreadDraftChange}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                >
                  {forumCategories.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
              Autor:in
              <input
                name="author"
                value={threadDraft?.author ?? thread.author}
                onChange={handleThreadDraftChange}
                readOnly={!isAdmin}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                required
                minLength={2}
              />
            </label>
            <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
              Beitrag
              <textarea
                name="body"
                value={threadDraft?.body ?? thread.body}
                onChange={handleThreadDraftChange}
                className="min-h-[140px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                required
                minLength={10}
              />
            </label>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="submit"
                disabled={savingThread}
                className="inline-flex items-center rounded-xl bg-ocean-600 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-ocean-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingThread ? "Speichern..." : "Änderungen speichern"}
              </button>
              <button
                type="button"
                onClick={cancelThreadEditing}
                className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-600 shadow-sm transition hover:border-slate-400 hover:text-slate-700"
              >
                Abbrechen
              </button>
            </div>
          </form>
        ) : (
          <>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{thread.title}</h1>
            <div className="space-y-3 text-sm text-slate-700">
              {paragraphs.length === 0 ? (
                <p>{thread.body}</p>
              ) : (
                paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))
              )}
            </div>
          </>
        )}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span>{replyCount} Antworten</span>
          <button
            type="button"
            onClick={() => toggleForumThreadLike(thread.id)}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 font-semibold text-ocean-700 transition hover:border-ocean-300 hover:text-ocean-800"
          >
            {thread.likedByMe ? "❤️ Gefällt mir" : "♡ Gefällt mir"}
            <span className="font-medium text-slate-600">{thread.likes}</span>
          </button>
          {canManageThread && !isEditingThread && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={startThreadEditing}
                className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-700"
              >
                Thread bearbeiten
              </button>
              {pendingThreadDelete ? (
                <>
                  <button
                    type="button"
                    onClick={confirmThreadDelete}
                    className="inline-flex items-center rounded-full border border-rose-300 bg-rose-600 px-3 py-1 font-semibold text-white transition hover:bg-rose-700"
                  >
                    Löschen bestätigen
                  </button>
                  <button
                    type="button"
                    onClick={cancelThreadDeleteRequest}
                    className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-700"
                  >
                    Abbrechen
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={requestThreadDelete}
                  className="inline-flex items-center rounded-full border border-rose-200 px-3 py-1 font-semibold text-rose-700 transition hover:border-rose-300 hover:text-rose-800"
                >
                  Thread löschen
                </button>
              )}
            </div>
          )}
        </div>
        {threadAlert && (
          <p
            className={`text-xs font-semibold ${
              threadAlert.variant === "error" ? "text-rose-600" : "text-emerald-600"
            }`}
          >
            {threadAlert.message}
          </p>
        )}
      </div>

      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900">Antworten</h2>
          <p className="text-xs text-slate-500">
            Teile deine Erfahrungen oder unterstütze andere mit einem Tipp.
          </p>
        </header>
        <div className="space-y-3">
          {thread.replies.length === 0 ? (
            <p className="text-xs text-slate-500">Noch keine Antworten vorhanden.</p>
          ) : (
            thread.replies.map((reply) => {
              const canManageReply = canManageEntity(reply.authorId, reply.author);

              return (
                <article
                  key={reply.id}
                  className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4"
                >
                  <header className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-600">
                    <span>{reply.author}</span>
                    <span className="text-[10px] font-normal text-slate-500">
                      {formatDate(reply.createdAt)}
                    </span>
                  </header>
                  {editingReplyId === reply.id ? (
                    <form className="space-y-3" onSubmit={(event) => handleReplySubmit(event, reply.id)}>
                      <label className="flex flex-col gap-2 text-[11px] font-semibold text-slate-600">
                        Autor:in
                        <input
                          name="author"
                          value={replyDraft.author}
                          onChange={handleReplyDraftChange}
                          readOnly={!isAdmin}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                          required
                          minLength={2}
                        />
                      </label>
                      <label className="flex flex-col gap-2 text-[11px] font-semibold text-slate-600">
                        Nachricht
                        <textarea
                          name="message"
                          value={replyDraft.message}
                          onChange={handleReplyDraftChange}
                          className="min-h-[90px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs shadow-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                          required
                          minLength={3}
                        />
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="submit"
                          disabled={savingReply === reply.id}
                          className="inline-flex items-center rounded-lg bg-ocean-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm transition hover:bg-ocean-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {savingReply === reply.id ? "Speichern..." : "Antwort speichern"}
                        </button>
                        <button
                          type="button"
                          onClick={cancelReplyEditing}
                          className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1 text-[11px] font-semibold text-slate-600 shadow-sm transition hover:border-slate-400 hover:text-slate-700"
                        >
                          Abbrechen
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <p className="text-xs text-slate-600">{reply.message}</p>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                        <button
                          type="button"
                          onClick={() => toggleForumReplyLike(thread.id, reply.id)}
                          className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 font-semibold text-ocean-700 transition hover:border-ocean-300 hover:text-ocean-800"
                        >
                          {reply.likedByMe ? "❤️ Gefällt mir" : "♡ Gefällt mir"}
                          <span className="font-medium text-slate-600">{reply.likes}</span>
                        </button>
                        {canManageReply && (
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => startReplyEditing(reply.id)}
                              className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-700"
                            >
                              Bearbeiten
                            </button>
                            {pendingReplyDeleteId === reply.id ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => confirmReplyDelete(reply.id)}
                                  className="inline-flex items-center rounded-full border border-rose-300 bg-rose-600 px-3 py-1 font-semibold text-white transition hover:bg-rose-700"
                                >
                                  Löschen bestätigen
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelReplyDeleteRequest}
                                  className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-700"
                                >
                                  Abbrechen
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => requestReplyDelete(reply.id)}
                                className="inline-flex items-center rounded-full border border-rose-200 px-3 py-1 font-semibold text-rose-700 transition hover:border-rose-300 hover:text-rose-800"
                              >
                                Löschen
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  {replyAlerts[reply.id] && (
                    <p
                      className={`text-[11px] font-semibold ${
                        replyAlerts[reply.id]?.variant === "error"
                          ? "text-rose-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {replyAlerts[reply.id]?.message}
                    </p>
                  )}
                </article>
              );
            })
          )}
        </div>
        <div className="border-t border-slate-200 pt-4">
          <ReplyForm
            currentUserId={currentUserId}
            currentUserName={currentUser?.name ?? null}
            anonymousAuthorId={anonymousAuthorIdRef.current}
            onSubmit={submitNewReply}
          />
        </div>
      </section>
    </div>
  );
}
