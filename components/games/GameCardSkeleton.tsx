export function GameCardSkeleton() {
  return (
    <div className='flex w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-card animate-pulse'>
      <div className='aspect-[4/3] w-full bg-secondary' />
      <div className='flex flex-col gap-2 p-3'>
        <div className='h-4 w-3/4 rounded bg-secondary' />
        <div className='flex items-center justify-between'>
          <div className='h-3 w-16 rounded bg-secondary' />
          <div className='h-3 w-10 rounded bg-secondary' />
        </div>
      </div>
    </div>
  );
}
