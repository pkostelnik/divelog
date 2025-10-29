import { CommunityForumBoard } from "@/features/community/components/community-forum-board";
import { ForumThreadForm } from "@/features/community/components/forum-thread-form";

export default function CommunityForumPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Community Forum</h1>
        <p className="text-sm text-slate-600">
          Stelle Fragen, diskutiere Technik und finde Mitreisende für den nächsten Dive-Trip.
        </p>
      </header>
      <ForumThreadForm />
      <CommunityForumBoard />
    </div>
  );
}
