"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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

export function CommunityForumBoard() {
  const { forumCategories, forumThreads, toggleForumThreadLike, removeForumThread } = useDemoData();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";
  const currentUserId = currentUser?.id ?? null;
  const normalizedCurrentUserName = currentUser?.name.trim().toLowerCase() ?? null;
  const [pendingThreadDeleteId, setPendingThreadDeleteId] = useState<string | null>(null);
  const anonymousAuthorId = useMemo(() => {
    const ensured = ensureAnonymousAuthorId();
    if (ensured) {
      return ensured;
    }

    const generated = generateAnonymousAuthorId();
    try {
      window.localStorage.setItem(ANONYMOUS_AUTHOR_ID_KEY, generated);
    } catch {
      // Ignore storage errors (private tabs, disabled storage, etc.).
    }
    return generated;
  }, []);

  const threads = useMemo(() => {
    return [...forumThreads].sort((a, b) => b.lastActivity.localeCompare(a.lastActivity));
  }, [forumThreads]);

  const categoriesWithCounts = useMemo(() => {
    const counts = new Map<string, number>();

    forumThreads.forEach((thread) => {
      counts.set(thread.categoryId, (counts.get(thread.categoryId) ?? 0) + 1);
    });

    return forumCategories.map((category) => ({
      ...category,
      threadCount: counts.get(category.id) ?? 0
    }));
  }, [forumCategories, forumThreads]);

  const canManageThread = (thread: (typeof forumThreads)[number]) => {
    if (isAdmin) {
      return true;
    }
    if (currentUserId && thread.authorId && currentUserId === thread.authorId) {
      return true;
    }
    if (anonymousAuthorId && thread.authorId && thread.authorId === anonymousAuthorId) {
      return true;
    }
    const normalizedAuthor = thread.author.trim().toLowerCase();
    return normalizedCurrentUserName !== null && normalizedCurrentUserName === normalizedAuthor;
  };

  const requestThreadDelete = (threadId: string) => {
    const target = forumThreads.find((item) => item.id === threadId);
    if (!target || !canManageThread(target)) {
      return;
    }

    setPendingThreadDeleteId(threadId);
  };

  const cancelThreadDelete = () => {
    setPendingThreadDeleteId(null);
  };

  const confirmThreadDelete = (threadId: string) => {
    const target = forumThreads.find((item) => item.id === threadId);
    if (!target || !canManageThread(target)) {
      return;
    }

    removeForumThread(threadId);
    setPendingThreadDeleteId(null);
  };

  useEffect(() => {
    if (!pendingThreadDeleteId) {
      return;
    }
    const stillExists = forumThreads.some((thread) => thread.id === pendingThreadDeleteId);
    if (!stillExists) {
      setPendingThreadDeleteId(null);
    }
  }, [forumThreads, pendingThreadDeleteId]);

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-700">Forenbereiche</h2>
        <ul className="space-y-3">
          {categoriesWithCounts.map((category) => (
            <li
              key={category.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-900">{category.title}</p>
              <p className="mt-1 text-xs text-slate-600">{category.description}</p>
              <p className="mt-3 text-xs font-semibold text-ocean-700">
                {category.threadCount} Threads aktiv
              </p>
            </li>
          ))}
        </ul>
      </aside>
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Aktive Diskussionen</h2>
          <span className="text-xs text-slate-500">{threads.length} laufende Threads</span>
        </div>
        <div className="space-y-3">
          {threads.map((thread) => {
            const category = forumCategories.find((item) => item.id === thread.categoryId);
            const replyCount = thread.replies.length;
            const participants = new Set<string>([thread.author]);
            thread.replies.forEach((reply) => participants.add(reply.author));
            const canManage = canManageThread(thread);

            return (
              <article
                key={thread.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-ocean-300"
              >
                <header className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center rounded-full bg-ocean-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-ocean-700">
                    {category?.title ?? "Community"}
                  </span>
                  <h3 className="text-base font-semibold text-slate-900">{thread.title}</h3>
                </header>
                <p className="mt-2 text-sm text-slate-600">{thread.excerpt}</p>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span>Gestartet von {thread.author}</span>
                  <span>Antworten: {replyCount}</span>
                  <span>Teilnehmende: {Array.from(participants).join(", ")}</span>
                  <span>Letzte Aktivität: {formatDate(thread.lastActivity)}</span>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => toggleForumThreadLike(thread.id)}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-ocean-700 transition hover:border-ocean-300 hover:text-ocean-800"
                  >
                    {thread.likedByMe ? "❤️ Gefällt mir" : "♡ Gefällt mir"}
                    <span className="font-medium text-slate-600">{thread.likes}</span>
                  </button>
                  <Link
                    href={`/dashboard/community/forum/${thread.id}`}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-ocean-600 transition hover:text-ocean-700"
                  >
                    Thread öffnen
                    <span aria-hidden>→</span>
                  </Link>
                  {canManage && (
                    pendingThreadDeleteId === thread.id ? (
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => confirmThreadDelete(thread.id)}
                          className="inline-flex items-center rounded-full border border-rose-300 bg-rose-600 px-3 py-1 font-semibold text-white transition hover:bg-rose-700"
                        >
                          Löschen bestätigen
                        </button>
                        <button
                          type="button"
                          onClick={cancelThreadDelete}
                          className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-700"
                        >
                          Abbrechen
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => requestThreadDelete(thread.id)}
                        className="inline-flex items-center rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-700 transition hover:border-rose-300 hover:text-rose-800"
                      >
                        Thread löschen
                      </button>
                    )
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
