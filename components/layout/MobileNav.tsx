"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Heart,
  LayoutGrid,
  LogOut,
  Menu,
  PlusCircle,
  ShieldCheck,
} from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const PUBLIC_LINKS = [
  { href: "/explore", label: "Games" },
  { href: "/genres", label: "Genres" },
  { href: "/platforms", label: "Platforms" },
  { href: "/news", label: "News" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

interface MobileNavProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: "user" | "admin";
  } | null;
}

export function MobileNav({ user }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='lg:hidden'
          aria-label='Open menu'
        >
          <Menu className='h-5 w-5' />
        </Button>
      </SheetTrigger>

      <SheetContent side='right' className='w-72 flex flex-col'>
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        <nav className='flex flex-col gap-1 px-4'>
          {PUBLIC_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Separator className='my-2' />

        <nav className='flex flex-col gap-1 px-4'>
          {user ? (
            <>
              <Link
                href='/user/dashboard'
                onClick={() => setOpen(false)}
                className='flex items-center gap-2 py-2 px-3 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
              >
                <LayoutGrid className='h-4 w-4' /> Dashboard
              </Link>
              <Link
                href='/wishlist'
                onClick={() => setOpen(false)}
                className='flex items-center gap-2 py-2 px-3 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
              >
                <Heart className='h-4 w-4' /> Wishlist
              </Link>
              <Link
                href='/items/manage'
                onClick={() => setOpen(false)}
                className='flex items-center gap-2 py-2 px-3 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
              >
                <LayoutGrid className='h-4 w-4' /> Manage Items
              </Link>
              <Link
                href='/items/add'
                onClick={() => setOpen(false)}
                className='flex items-center gap-2 py-2 px-3 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
              >
                <PlusCircle className='h-4 w-4' /> Add Item
              </Link>
              {user.role === "admin" && (
                <Link
                  href='/admin/dashboard'
                  onClick={() => setOpen(false)}
                  className='flex items-center gap-2 py-2 px-3 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                >
                  <ShieldCheck className='h-4 w-4' /> Admin Panel
                </Link>
              )}

              <Separator className='my-2' />

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className='flex items-center gap-2 py-2 px-3 rounded-md text-sm font-medium text-destructive hover:bg-secondary/60 text-left'
              >
                <LogOut className='h-4 w-4' /> Log Out
              </button>
            </>
          ) : (
            <div className='flex flex-col gap-2 mt-2'>
              <Button asChild variant='outline'>
                <Link href='/login' onClick={() => setOpen(false)}>
                  Log In
                </Link>
              </Button>
              <Button asChild>
                <Link href='/register' onClick={() => setOpen(false)}>
                  Sign Up
                </Link>
              </Button>
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
