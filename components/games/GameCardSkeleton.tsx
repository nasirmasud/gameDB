import { Skeleton } from "@/components/ui/skeleton";

export function GameCardSkeleton() {
  return (
    <div className='flex w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-card'>
      <Skeleton className='aspect-[4/3] w-full rounded-none' />
      <div className='flex flex-col gap-2 p-3'>
        <Skeleton className='h-4 w-3/4' />
        <div className='flex items-center justify-between'>
          <Skeleton className='h-3 w-16' />
          <Skeleton className='h-3 w-10' />
        </div>
      </div>
    </div>
  );
}
