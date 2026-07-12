"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Heart,
  LayoutGrid,
  LogOut,
  PlusCircle,
  ShieldCheck,
} from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: "user" | "admin";
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const initials = (user.name ?? user.email ?? "?")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className='outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full'>
        <Avatar className='h-9 w-9 border border-border'>
          <AvatarImage
            src={user.image ?? undefined}
            alt={user.name ?? "User"}
          />
          <AvatarFallback className='bg-secondary text-secondary-foreground text-sm'>
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end' className='w-56'>
        <DropdownMenuLabel className='font-normal'>
          <p className='text-sm font-medium truncate'>{user.name}</p>
          <p className='text-xs text-muted-foreground truncate'>{user.email}</p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href='/wishlist' className='cursor-pointer'>
            <Heart className='mr-2 h-4 w-4' />
            Wishlist
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href='/items/manage' className='cursor-pointer'>
            <LayoutGrid className='mr-2 h-4 w-4' />
            Manage Items
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href='/items/add' className='cursor-pointer'>
            <PlusCircle className='mr-2 h-4 w-4' />
            Add Item
          </Link>
        </DropdownMenuItem>

        {user.role === "admin" && (
          <DropdownMenuItem asChild>
            <Link href='/admin/dashboard' className='cursor-pointer'>
              <ShieldCheck className='mr-2 h-4 w-4' />
              Admin Panel
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/" })}
          className='cursor-pointer text-destructive focus:text-destructive'
        >
          <LogOut className='mr-2 h-4 w-4' />
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
