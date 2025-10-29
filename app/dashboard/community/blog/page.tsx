import { CommunityHighlights } from "@/features/community/components/community-highlights";
import { CommunityPostForm } from "@/features/community/components/community-post-form";

export default function CommunityBlogPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Community Blog</h1>
        <p className="text-sm text-slate-600">
          Teile ausführliche Erfahrungsberichte, Tipps und inspiriere andere Taucher:innen mit deinen Stories.
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <CommunityPostForm />
        <CommunityHighlights />
      </div>
    </div>
  );
}
