"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { FaWindows, FaPlaystation, FaXbox, FaApple, FaLinux, FaAndroid } from "react-icons/fa";
import { BsNintendoSwitch, BsGlobe } from "react-icons/bs";
import { MdPhoneIphone } from "react-icons/md";

interface CustomGameItem {
  _id: string;
  title: string;
  shortDescription: string;
  genre: string;
  developer: string | null;
  publisher: string | null;
  platforms: string[];
  imageUrl: string | null;
  releaseDate: string;
}

interface Props {
  games: CustomGameItem[];
}

export function CustomGamesClient({ games }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="mx-auto w-full px-4 py-20 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Community Games</h2>
        <Link
          href="/user/dashboard/custom-games"
          className="text-sm font-medium text-primary hover:underline"
        >
          View All →
        </Link>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {games.map((g) => (
            <Link
              key={g._id}
              href={`/games/custom/${g._id}`}
              className="w-[180px] shrink-0 sm:w-[220px] lg:w-[240px]"
            >
              <div className="group relative flex w-full shrink-0 flex-col overflow-hidden rounded-sm border border-border bg-card transition-transform hover:-translate-y-1">
                <div className="relative aspect-[4/5] w-full overflow-hidden">
                  {g.imageUrl ? (
                    <img
                      src={g.imageUrl}
                      alt={g.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-secondary text-sm text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 p-3">
                  <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-foreground">
                    {g.title}
                  </h3>

                  <p className="text-xs text-muted-foreground">{g.genre}</p>

                  {g.platforms.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      {g.platforms.map((name) => {
                        const s = name.toLowerCase();
                        let Icon = BsGlobe;
                        if (s.includes("playstation")) Icon = FaPlaystation;
                        else if (s.includes("xbox")) Icon = FaXbox;
                        else if (s.includes("nintendo")) Icon = BsNintendoSwitch;
                        else if (s.includes("mac")) Icon = FaApple;
                        else if (s.includes("linux")) Icon = FaLinux;
                        else if (s.includes("ios") || s.includes("iphone")) Icon = MdPhoneIphone;
                        else if (s.includes("android")) Icon = FaAndroid;
                        else if (s.includes("pc") || s.includes("windows")) Icon = FaWindows;
                        return <Icon key={name} className="h-3 w-3 text-muted-foreground" title={name} />;
                      })}
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(g.releaseDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                    })}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <button
          onClick={() => scroll("left")}
          aria-label="Scroll left"
          className="absolute -left-4 top-1/3 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card shadow-md hover:bg-secondary lg:flex"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => scroll("right")}
          aria-label="Scroll right"
          className="absolute -right-4 top-1/3 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card shadow-md hover:bg-secondary lg:flex"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
