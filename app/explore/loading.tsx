import { Skeleton } from "@/components/ui/skeleton";

export default function ExploreLoading() {
  return (
    <div className='w-full px-4 py-6 sm:px-6 lg:px-12 xl:px-20 2xl:px-28'>
      <div className='flex gap-6'>
        <aside className='hidden w-64 shrink-0 lg:block'>
          <div className='space-y-4'>
            <Skeleton className='h-5 w-20' />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='flex items-center gap-2'>
                <Skeleton className='h-4 w-4' />
                <Skeleton className='h-4 w-24' />
              </div>
            ))}
            <Skeleton className='mt-6 h-5 w-24' />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className='flex items-center gap-2'>
                <Skeleton className='h-4 w-4' />
                <Skeleton className='h-4 w-28' />
              </div>
            ))}
          </div>
        </aside>

        <div className='flex-1'>
          <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <Skeleton className='h-10 w-full max-w-md' />
            <Skeleton className='h-9 w-36' />
          </div>
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4'>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className='flex w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-card'>
                <Skeleton className='aspect-[4/5] w-full rounded-none' />
                <div className='flex flex-col gap-2 p-3'>
                  <Skeleton className='h-4 w-3/4' />
                  <div className='flex items-center justify-between'>
                    <Skeleton className='h-3 w-16' />
                    <Skeleton className='h-3 w-10' />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className='mt-8 flex items-center justify-center gap-2'>
            <Skeleton className='h-9 w-24' />
            <Skeleton className='h-9 w-16' />
            <Skeleton className='h-9 w-24' />
          </div>
        </div>
      </div>
    </div>
  );
}
