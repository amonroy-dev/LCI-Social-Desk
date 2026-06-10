import { Skeleton } from "@/components/ui/skeleton";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarLoading() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Calendar header bar */}
      <header className="flex h-14 shrink-0 flex-wrap items-center gap-3 border-b border-border bg-card/80 px-5">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-7 w-48 rounded-md" />
        <div className="flex items-center gap-1">
          <Skeleton className="h-7 w-7 rounded-md" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-7 w-7 rounded-md" />
          <Skeleton className="h-7 w-14 rounded-md" />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Skeleton className="h-7 w-24 rounded-md" />
          <Skeleton className="h-7 w-20 rounded-md" />
        </div>
      </header>

      {/* Day-name row */}
      <div className="grid grid-cols-7 border-b border-border bg-muted/20">
        {DAY_NAMES.map((d) => (
          <div key={d} className="py-2 text-center">
            <Skeleton className="mx-auto h-3 w-6" />
          </div>
        ))}
      </div>

      {/* Calendar grid — 5 week rows */}
      <div className="flex flex-1 flex-col divide-y divide-border">
        {[...Array(5)].map((_, wi) => (
          <div
            key={wi}
            className="grid min-h-[120px] flex-1 grid-cols-7 divide-x divide-border"
          >
            {[...Array(7)].map((_, di) => (
              <div key={di} className="p-2 space-y-1.5">
                <Skeleton className="h-5 w-5 rounded-full" />
                {/* Occasional fake post pill */}
                {(wi + di) % 5 === 0 && (
                  <Skeleton className="h-8 w-full rounded" />
                )}
                {(wi + di) % 7 === 0 && (
                  <Skeleton className="h-8 w-full rounded" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
