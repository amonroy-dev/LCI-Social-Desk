import { TopBar } from "@/components/shell/top-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MediaLibraryPage() {
  return (
    <>
      <TopBar
        title="Media Library"
        subtitle="Shared media assets across all client accounts."
      />
      <main className="flex-1 overflow-auto px-3 py-4 sm:px-6 sm:py-5">
        <Card>
          <CardHeader>
            <CardTitle>Asset workspace</CardTitle>
          </CardHeader>
          <CardContent className="text-[12px] text-muted-foreground">
            The media library will surface uploaded images and videos grouped
            by client once the storage backend is wired in.
          </CardContent>
        </Card>
      </main>
    </>
  );
}
