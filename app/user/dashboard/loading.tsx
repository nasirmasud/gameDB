import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex w-full">
      <aside className="hidden w-64 shrink-0 flex-col gap-6 border-r border-border bg-background p-5 lg:flex">
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-11 rounded-full" />
          <div>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-1 h-3 w-24" />
          </div>
        </div>
        <nav className="flex flex-col gap-1 text-sm">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="mt-3 h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </nav>
        <Skeleton className="mt-auto h-9 w-full" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </aside>

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Skeleton className="mb-1 h-7 w-64" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-10 w-44 rounded-lg" />
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4">
              <Skeleton className="mb-3 h-7 w-28" />
              <Skeleton className="mb-1 h-8 w-20" />
              <Skeleton className="mt-2 h-4 w-16" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_300px]">
          <div className="min-w-0">
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
              <div className="mb-2 flex items-center justify-between">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-8 w-28" />
              </div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
              <Skeleton className="mb-4 h-5 w-32" />
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="mb-1 h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </main>
    </div>
  );
}
