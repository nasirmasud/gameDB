import { Skeleton } from "@/components/ui/skeleton";

export default function GenresLoading() {
  return (
    <div className='w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-10 xl:px-16'>
      <div className='mb-8 flex flex-wrap items-start justify-between gap-2'>
        <div>
          <Skeleton className='mb-1 h-8 w-36 sm:h-9' />
          <Skeleton className='h-4 w-64' />
        </div>
        <Skeleton className='mt-1 h-4 w-44' />
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr] lg:gap-8 xl:grid-cols-[260px_1fr]'>
        <aside className='hidden flex-col gap-6 lg:flex'>
          <Skeleton className='h-5 w-16' />
          <Skeleton className='h-10 w-full' />
          <div className='space-y-3'>
            <Skeleton className='h-4 w-20' />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='flex items-center gap-2'>
                <Skeleton className='h-4 w-4 rounded-full' />
                <Skeleton className='h-4 w-28' />
              </div>
            ))}
          </div>
        </aside>

        <div>
          <div className='mb-4 lg:hidden'>
            <Skeleton className='h-9 w-24' />
          </div>
          <div className='grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className='flex flex-col overflow-hidden rounded-xs border border-border bg-secondary sm:flex-row min-h-56'>
                <Skeleton className='h-80 w-full shrink-0 sm:h-auto sm:w-64 rounded-none' />
                <div className='flex flex-1 flex-col justify-center gap-2 p-5'>
                  <Skeleton className='h-5 w-32' />
                  <Skeleton className='h-4 w-20' />
                  <Skeleton className='mt-1 h-4 w-full' />
                  <Skeleton className='h-4 w-3/4' />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
