import { Skeleton } from "@/components/ui/skeleton";

export default function NewsLoading() {
  return (
    <div className='w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-10 xl:px-16'>
      <div className='mb-6'>
        <Skeleton className='mb-1 h-8 w-24 sm:h-9' />
        <Skeleton className='h-4 w-64' />
      </div>

      <div className='space-y-4'>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className='flex flex-col overflow-hidden rounded-xs border border-border bg-card sm:flex-row'
          >
            <Skeleton className='h-48 w-full shrink-0 rounded-none sm:h-40 sm:w-56' />
            <div className='flex flex-1 flex-col justify-center gap-2 p-5'>
              <div className='flex items-center gap-2'>
                <Skeleton className='h-4 w-16' />
                <Skeleton className='h-4 w-24' />
              </div>
              <Skeleton className='h-5 w-3/4' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-2/3' />
              <div className='mt-2 flex items-center gap-4'>
                <Skeleton className='h-4 w-16' />
                <Skeleton className='h-4 w-16' />
                <Skeleton className='h-4 w-16' />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
