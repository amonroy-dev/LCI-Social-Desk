import { notFound } from "next/navigation";

import { TopBar } from "@/components/shell/top-bar";
import { PublishingWorkspace } from "@/features/publishing/publishing-workspace";
import { loadClients } from "@/lib/services/client-service";
import { isEmailConfigured } from "@/lib/services/email-service";
import { getPost } from "@/lib/services/post-service";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const [post, clients] = await Promise.all([getPost(postId), loadClients()]);

  if (!post) notFound();

  return (
    <>
      <TopBar
        title="Edit Post"
        subtitle="Make changes and save or reschedule your post."
      />
      <PublishingWorkspace
        clients={clients}
        emailConfigured={isEmailConfigured()}
        initialDraft={post}
      />
    </>
  );
}
