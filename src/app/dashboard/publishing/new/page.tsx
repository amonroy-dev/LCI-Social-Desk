import { TopBar } from "@/components/shell/top-bar";
import { PublishingWorkspace } from "@/features/publishing/publishing-workspace";
import { isEmailConfigured } from "@/lib/services/email-service";

export const metadata = {
  title: "New Draft — LCI Social Desk",
};

export const dynamic = "force-dynamic";

export default function NewDraftPage() {
  return (
    <>
      <TopBar
        title="New Draft"
        subtitle="Draft mode is on. Posts will not publish until scheduled or posted."
      />
      <PublishingWorkspace emailConfigured={isEmailConfigured()} />
    </>
  );
}
