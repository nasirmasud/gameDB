import { auth } from "@/auth";
import { MobileNav } from "@/components/layout/MobileNav";
import { NavLink } from "@/components/layout/NavLink";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
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
    <header className='sticky top-0 z-50 w-full border-b border-border bg-background'>
      <div className='flex h-16 w-full items-center gap-6 px-8 md:px-12 lg:px-16'>
        {/* Logo */}
        <Link href='/' className='flex items-center gap-2 shrink-0'>
          <Gamepad2 className='h-6 w-6 text-primary' />
          <span className='text-lg font-bold tracking-tight text-foreground'>
            GameDB
          </span>
        </Link>

        {/* Search — hidden on small screens to save space */}
        <div className='hidden md:flex flex-1 max-w-xl'>
          <div className='relative w-full'>
            <Search className='absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <input
              type='text'
              placeholder='Search for games, genres, platforms...'
              className='w-full rounded-full border border-input bg-secondary/60 py-2 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50'
            />
            <Search className='absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          </div>
        </div>

        {/* Desktop nav links */}
        <nav className='hidden lg:flex items-center gap-6 ml-auto'>
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Auth area */}
        <div className='flex items-center gap-3 lg:ml-2'>
          <ThemeToggle />

          {user ? (
            <div className='hidden md:block'>
              <UserMenu user={user} />
            </div>
          ) : (
            <div className='hidden md:flex items-center gap-2'>
              <Button
                asChild
                variant='outline'
                size='sm'
                className='rounded-full'
              >
                <Link href='/login'>Log In</Link>
              </Button>
              <Button
                asChild
                size='sm'
                className='rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90'
              >
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
