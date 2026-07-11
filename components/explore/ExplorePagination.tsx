"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface ExplorePaginationProps {
  currentPage: number;
  totalPages: number;
}

export function ExplorePagination({
  currentPage,
  totalPages,
}: ExplorePaginationProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  function hrefForPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `${pathname}?${params.toString()}`;
  }

  if (totalPages <= 1) return null;

  const prevDisabled = currentPage <= 1;
  const nextDisabled = currentPage >= totalPages;

  return (
    <div className='mt-8 flex items-center justify-center gap-4'>
      <Link
        href={prevDisabled ? "#" : hrefForPage(currentPage - 1)}
        aria-disabled={prevDisabled}
        className={`flex h-9 w-9 items-center justify-center rounded-full border border-border ${
          prevDisabled ? "pointer-events-none opacity-40" : "hover:bg-secondary"
        }`}
      >
        <ChevronLeft className='h-4 w-4' />
      </Link>

      <span className='text-sm text-muted-foreground'>
        Page{" "}
        <span className='font-semibold text-foreground'>{currentPage}</span> of{" "}
        {totalPages}
      </span>

      <Link
        href={nextDisabled ? "#" : hrefForPage(currentPage + 1)}
        aria-disabled={nextDisabled}
        className={`flex h-9 w-9 items-center justify-center rounded-full border border-border ${
          nextDisabled ? "pointer-events-none opacity-40" : "hover:bg-secondary"
        }`}
      >
        <ChevronRight className='h-4 w-4' />
      </Link>
    </div>
  );
}
