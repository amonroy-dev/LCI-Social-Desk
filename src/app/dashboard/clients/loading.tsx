import { Skeleton } from "@/components/ui/skeleton";

export default function ClientsLoading() {
  return (
    <>
      {/* TopBar */}
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-card/80 px-5">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-56" />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
      </header>

      <main className="flex-1 overflow-auto px-6 py-5">
        {/* Toolbar row */}
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-8 w-64 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>

        {/* Client rows */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-border px-5 py-4 last:border-0"
            >
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-3.5 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-7 w-7 rounded-md" />
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
