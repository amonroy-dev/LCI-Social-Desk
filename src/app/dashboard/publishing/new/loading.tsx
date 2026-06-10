import { Skeleton } from "@/components/ui/skeleton";

export default function NewPostLoading() {
  return (
    <>
      {/* TopBar */}
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-card/80 px-5">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-64" />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Skeleton className="h-5 w-28 rounded-full" />
          <Skeleton className="hidden lg:block h-8 w-56 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </header>

      {/* 50/50 workspace */}
      <div className="grid min-h-0 flex-1 overflow-hidden grid-cols-1 lg:grid-cols-2">
        {/* Left — composer */}
        <div className="flex flex-col overflow-hidden border-r border-border px-6 pt-5 pb-2 gap-3">
          {/* Composer card */}
          <div className="rounded-lg border border-border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-40 rounded-md" />
            </div>
            <Skeleton className="h-32 w-full rounded-md" />
            <div className="flex items-center gap-2 pt-1">
              <Skeleton className="h-7 w-7 rounded-md" />
              <Skeleton className="h-7 w-7 rounded-md" />
              <Skeleton className="h-7 w-7 rounded-md" />
              <div className="ml-auto flex items-center gap-2">
                <Skeleton className="h-6 w-28 rounded-full" />
                <Skeleton className="h-7 w-36 rounded-md" />
              </div>
            </div>
          </div>
          {/* Collapsible panels */}
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-card px-5 py-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-7 w-7 rounded-md shrink-0" />
                <div className="flex flex-col gap-1.5 flex-1">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-52" />
                </div>
                <Skeleton className="h-5 w-12 rounded-full" />
                <Skeleton className="h-4 w-4 rounded" />
              </div>
            </div>
          ))}
          {/* ActionBar skeleton */}
          <div className="mt-auto border-t border-border bg-card/80 px-5 py-3 flex items-center gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-32" />
            <div className="ml-auto flex gap-2">
              <Skeleton className="h-8 w-20 rounded-md" />
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
          </div>
        </div>

        {/* Right — preview */}
        <div className="flex flex-col overflow-hidden bg-muted/30 px-5 pt-5 pb-6 gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <Skeleton className="h-7 w-48 rounded-md" />
            <Skeleton className="h-5 w-10 rounded-full" />
          </div>
          <div className="rounded-3xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border px-4 py-2.5 flex items-center gap-1.5">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-2.5 w-20" />
                </div>
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-40 w-full rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
