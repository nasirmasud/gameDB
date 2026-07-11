"use client";

import type { MediaItem } from "@/lib/rawg";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

interface ScreenshotGalleryProps {
  items: MediaItem[];
  gameName: string;
  fallbackImage: string | null;
}

export function ScreenshotGallery({
  items,
  gameName,
  fallbackImage,
}: ScreenshotGalleryProps) {
  const [selected, setSelected] = useState(0);
  const thumbRef = useRef<HTMLDivElement>(null);

  const scrollThumbs = (dir: "left" | "right") => {
    const el = thumbRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (items.length === 0) {
    return (
      <div className='relative overflow-hidden rounded-xs border border-border h-[400px] lg:h-[500px]'>
        {fallbackImage ? (
          <Image
            src={fallbackImage}
            alt={gameName}
            width={1200}
            height={675}
            className='h-full w-full object-cover'
          />
        ) : (
          <div className='flex h-full w-full items-center justify-center bg-secondary text-muted-foreground'>
            No screenshots available
          </div>
        )}
      </div>
    );
  }

  const current = items[selected];

  return (
    <div className='w-full'>
      <div className='relative overflow-hidden rounded-xs border border-border h-[400px] lg:h-[500px] bg-black'>
        {current.type === "screenshot" ? (
          <Image
            src={current.image}
            alt={`${gameName} screenshot ${selected + 1}`}
            width={1200}
            height={675}
            className='h-full w-full object-cover'
          />
        ) : (
          <video
            key={current.id}
            src={current.videoUrl}
            poster={current.preview}
            controls
            autoPlay
            className='h-full w-full'
          />
        )}
      </div>

      <div className='relative mt-3 w-full overflow-hidden'>
        <div
          ref={thumbRef}
          className='flex gap-3 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'
        >
          {items.map((item, i) => (
            <button
              key={item.id}
              onClick={() => setSelected(i)}
              className={`relative h-20 w-[140px] shrink-0 overflow-hidden rounded-xs border cursor-pointer transition-all hover:border-primary ${
                i === selected ? "border-2 border-primary" : "border-border"
              }`}
            >
              <Image
                src={item.type === "screenshot" ? item.image : item.preview}
                alt={
                  item.type === "screenshot"
                    ? `Screenshot ${i + 1}`
                    : item.name
                }
                width={200}
                height={120}
                className='h-full w-full object-cover'
              />
              {item.type === "movie" && (
                <div className='absolute inset-0 flex items-center justify-center bg-black/40'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-xs bg-white/90 text-sm text-black'>
                    <Play className='h-4 w-4 fill-current' />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={() => scrollThumbs("left")}
          aria-label='Scroll thumbnails left'
          className='absolute left-0 top-1/2 z-10 hidden h-full w-10 -translate-y-1/2 items-center justify-center bg-gradient-to-r from-background to-transparent md:flex'
        >
          <ChevronLeft className='h-5 w-5 text-foreground' />
        </button>
        <button
          onClick={() => scrollThumbs("right")}
          aria-label='Scroll thumbnails right'
          className='absolute right-0 top-1/2 z-10 hidden h-full w-10 -translate-y-1/2 items-center justify-center bg-gradient-to-l from-background to-transparent md:flex'
        >
          <ChevronRight className='h-5 w-5 text-foreground' />
        </button>
      </div>
    </div>
  );
}
