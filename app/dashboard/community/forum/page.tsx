"use client";

import { CommunityForumBoard } from "@/features/community/components/community-forum-board";
import { ForumThreadForm } from "@/features/community/components/forum-thread-form";
import { useI18n } from "@/providers/i18n-provider";

export default function CommunityForumPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {t("dashboard.community.forum.page.heading")}
        </h1>
        <p className="text-sm text-slate-600">{t("dashboard.community.forum.page.description")}</p>
      </header>
      <ForumThreadForm />
      <CommunityForumBoard />
    </div>
  );
}
