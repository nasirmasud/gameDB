import { auth } from "@/auth";
import { MobileNav } from "@/components/layout/MobileNav";
import { UserMenu } from "@/components/layout/UserMenu";
import { Button } from "@/components/ui/button";
import { Gamepad2, Search } from "lucide-react";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/explore", label: "Games" },
  { href: "/genres", label: "Genres" },
  { href: "/platforms", label: "Platforms" },
  { href: "/news", label: "News" },
];

export async function Navbar() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className='sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80'>
      <div className='mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8'>
        {/* Logo */}
        <Link href='/' className='flex items-center gap-2 shrink-0'>
          <Gamepad2 className='h-6 w-6 text-primary' />
          <span className='text-lg font-bold tracking-tight'>GameDB</span>
        </Link>

        {/* Search — hidden on small screens to save space */}
        <div className='hidden md:flex flex-1 max-w-md'>
          <div className='relative w-full'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <input
              type='text'
              placeholder='Search for games, genres, platforms...'
              className='w-full rounded-md border border-input bg-secondary/50 py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            />
          </div>
        </div>

        {/* Desktop nav links */}
        <nav className='hidden lg:flex items-center gap-6 ml-auto'>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className='text-sm font-medium text-muted-foreground hover:text-foreground transition-colors'
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth area */}
        <div className='flex items-center gap-3 lg:ml-6'>
          {user ? (
            <div className='hidden md:block'>
              <UserMenu user={user} />
            </div>
          ) : (
            <div className='hidden md:flex items-center gap-2'>
              <Button asChild variant='outline' size='sm'>
                <Link href='/login'>Log In</Link>
              </Button>
              <Button asChild size='sm'>
                <Link href='/register'>Sign Up</Link>
              </Button>
            </div>
          )}

          <MobileNav user={user} />
        </div>
      </div>
    </header>
  );
}
