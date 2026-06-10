import { Skeleton } from "@/components/ui/skeleton";

export default function PublishingLoading() {
  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-card/80 px-5">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-52" />
        </div>
        <div className="ml-auto">
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
      </header>
      <main className="flex-1 overflow-auto px-3 py-4 space-y-3 sm:px-6 sm:py-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-5 flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-48" />
              <Skeleton className="h-3 w-72" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-7 w-16 rounded-md" />
          </div>
        ))}
      </main>
    </>
  );
}
