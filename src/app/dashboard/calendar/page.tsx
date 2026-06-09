import { postRepository } from "@/lib/repositories/post-repository";
import { loadClients } from "@/lib/services/client-service";
import { CalendarClient } from "@/features/calendar/calendar-client";

export const metadata = {
  title: "Calendar — LCI Social Desk",
};

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const [clients, posts] = await Promise.all([
    loadClients(),
    postRepository.list(),
  ]);

  return <CalendarClient initialPosts={posts} clients={clients} />;
}
