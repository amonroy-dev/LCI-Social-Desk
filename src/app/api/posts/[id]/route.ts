import { type NextRequest, NextResponse } from "next/server";
import { deletePost } from "@/lib/services/post-service";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { event } = await deletePost(id);
    return NextResponse.json({ ok: true, event });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
