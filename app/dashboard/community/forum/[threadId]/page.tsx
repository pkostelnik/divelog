import { ForumThreadDetail } from "@/features/community/components/forum-thread-detail";

type ThreadPageProps = {
  params: Promise<{ threadId: string }>;
};

export default async function CommunityForumThreadPage({ params }: ThreadPageProps) {
  const { threadId } = await params;

  return (
    <div className="space-y-6">
      <ForumThreadDetail threadId={threadId} />
    </div>
  );
}
