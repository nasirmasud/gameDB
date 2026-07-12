import { auth } from "@/auth";
import { MobileNav } from "@/components/layout/MobileNav";
import { NavLink } from "@/components/layout/NavLink";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { UserMenu } from "@/components/layout/UserMenu";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/layout/SearchBar";
import Image from "next/image";
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
          <Image
            src='/favicon.ico'
            alt='GameDB Logo'
            width={64}
            height={64}
            className='h-15 w-15 object-contain'
          />
          <span className='text-lg font-bold tracking-tight text-foreground'>
            GameDB
          </span>
        </Link>

<SearchBar />

        {/* Desktop nav links */}
        <nav className='hidden lg:flex items-center gap-6 ml-auto'>
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href}>
              {link.label}
            </NavLink>
          ))}
          {user && (
            <NavLink href='/user/dashboard'>Dashboard</NavLink>
          )}
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
