import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div>
      <Skeleton className='h-[65vh] min-h-[440px] w-full rounded-none sm:h-[75vh]' />

      <div className='mx-auto w-full px-4 py-20 sm:px-6 lg:px-8'>
        <div className='mb-4 flex items-center justify-between'>
          <Skeleton className='h-6 w-40' />
          <Skeleton className='h-4 w-20' />
        </div>
        <div className='flex gap-4 overflow-hidden'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className='w-[180px] shrink-0 sm:w-[220px] lg:w-[240px]'>
              <div className='flex w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-card'>
                <Skeleton className='aspect-[4/3] w-full rounded-none' />
                <div className='flex flex-col gap-2 p-3'>
                  <Skeleton className='h-4 w-3/4' />
                  <Skeleton className='h-3 w-16' />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='mx-auto w-full px-4 py-20 sm:px-6 lg:px-8'>
        <Skeleton className='mb-4 h-6 w-32' />
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className='aspect-[4/3] rounded-xs' />
          ))}
        </div>
      </div>

      <div className='mx-auto w-full px-4 py-20 sm:px-6 lg:px-8'>
        <Skeleton className='mb-4 h-6 w-36' />
        <div className='flex gap-4 overflow-hidden'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className='w-[180px] shrink-0 sm:w-[220px] lg:w-[240px]'>
              <div className='flex w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-card'>
                <Skeleton className='aspect-[4/3] w-full rounded-none' />
                <div className='flex flex-col gap-2 p-3'>
                  <Skeleton className='h-4 w-3/4' />
                  <Skeleton className='h-3 w-16' />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
