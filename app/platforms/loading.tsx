import { Skeleton } from "@/components/ui/skeleton";

export default function PlatformsLoading() {
  return (
    <div className='w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-10 xl:px-16'>
      <div className='mb-10 border-b border-border pb-6'>
        <div className='flex flex-wrap items-end justify-between gap-4'>
          <div>
            <Skeleton className='mb-3 h-5 w-28 rounded-full' />
            <Skeleton className='mb-2 h-9 sm:h-10' />
            <Skeleton className='h-4 w-96 max-w-full' />
          </div>
          <Skeleton className='h-4 w-32' />
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr] lg:gap-8 xl:grid-cols-[260px_1fr]'>
        <aside className='hidden flex-col gap-6 lg:flex'>
          <Skeleton className='h-5 w-16' />
          <Skeleton className='h-10 w-full' />
          <div className='space-y-3'>
            <Skeleton className='h-4 w-20' />
            {Array.from({ length: 3 }).map((_, i) => (
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
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className='relative h-80 rounded-xs overflow-hidden border border-border bg-card'>
                <Skeleton className='absolute inset-0 rounded-none' />
                <div className='absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/30' />
                <div className='relative z-10 flex h-full flex-col p-6'>
                  <div className='flex items-center gap-4'>
                    <Skeleton className='h-16 w-16 rounded-sm' />
                    <div>
                      <Skeleton className='mb-1 h-6 w-32' />
                      <Skeleton className='h-4 w-20' />
                    </div>
                  </div>
                  <Skeleton className='mt-5 h-4 w-full' />
                  <Skeleton className='mt-1 h-4 w-3/4' />
                  <div className='flex-1' />
                  <Skeleton className='mb-3 h-4 w-16' />
                  <div className='flex items-center gap-4'>
                    <Skeleton className='h-20 w-20 rounded-xs' />
                    <div>
                      <Skeleton className='h-4 w-24' />
                      <Skeleton className='mt-1 h-4 w-12' />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
