import Link from "next/link";

export default function NotFound() {
  return (
    <div className='flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center gap-4 px-4 text-center'>
      <h1 className='text-7xl font-bold text-primary'>404</h1>
      <h2 className='text-2xl font-semibold text-foreground'>Page Not Found</h2>
      <p className='max-w-md text-muted-foreground'>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href='/'
        className='mt-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors'
      >
        Go Home
      </Link>
    </div>
  );
}
