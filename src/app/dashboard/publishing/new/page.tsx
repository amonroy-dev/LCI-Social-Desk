import { TopBar } from "@/components/shell/top-bar";
import { PublishingWorkspace } from "@/features/publishing/publishing-workspace";

export const metadata = {
  title: "New Draft — LCI Social Desk",
};

export default function NewDraftPage() {
  return (
    <>
      <TopBar
        title="New Draft"
        subtitle="Draft mode is on. Posts will not publish until scheduled or posted."
      />
      <PublishingWorkspace />
    </>
  );
}
