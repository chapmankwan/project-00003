export function DashboardSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Greeting skeleton */}
      <div className="h-8 w-48 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left column */}
        <div className="flex flex-col gap-4">
          {/* Streak card */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex flex-col gap-3">
            <div className="h-3 w-24 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            <div className="h-8 w-16 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            <div className="h-3 w-32 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          </div>

          {/* Overdue card */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex flex-col gap-3">
            <div className="h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            ))}
          </div>
        </div>

        {/* Right column — dailies card */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex flex-col gap-3">
            <div className="h-3 w-28 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}