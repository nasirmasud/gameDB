"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface ExplorePaginationProps {
  currentPage: number;
  totalPages: number;
}

function getVisiblePages(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [];
  pages.push(1);

  if (current > 3) {
    pages.push("ellipsis");
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push("ellipsis");
  }

  pages.push(total);
  return pages;
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
  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <div className='mt-10 flex items-center justify-center gap-2 text-sm'>
      <Link
        href={prevDisabled ? "#" : hrefForPage(currentPage - 1)}
        aria-disabled={prevDisabled}
        className={`flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-secondary ${
          prevDisabled ? "pointer-events-none opacity-40" : ""
        }`}
      >
        <ChevronLeft className='h-4 w-4' />
      </Link>

      {visiblePages.map((page, idx) =>
        page === "ellipsis" ? (
          <span key={`e-${idx}`} className='px-1 text-muted-foreground'>
            ...
          </span>
        ) : (
          <Link
            key={page}
            href={hrefForPage(page)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg font-medium ${
              page === currentPage
                ? "bg-primary text-primary-foreground"
                : "border border-border text-foreground hover:bg-secondary"
            }`}
          >
            {page}
          </Link>
        ),
      )}

      <Link
        href={nextDisabled ? "#" : hrefForPage(currentPage + 1)}
        aria-disabled={nextDisabled}
        className={`flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-secondary ${
          nextDisabled ? "pointer-events-none opacity-40" : ""
        }`}
      >
        <ChevronRight className='h-4 w-4' />
      </Link>
    </div>
  );
}
