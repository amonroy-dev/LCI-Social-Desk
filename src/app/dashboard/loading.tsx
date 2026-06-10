import { Skeleton } from "@/components/ui/skeleton";

function TopBarSkeleton() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-card/80 px-5">
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-48" />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="hidden lg:block h-8 w-56 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </header>
  );
}

export default function DashboardLoading() {
  return (
    <>
      <TopBarSkeleton />
      <main className="flex-1 overflow-auto px-6 py-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-5 space-y-3">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-8 w-28 rounded-md" />
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
