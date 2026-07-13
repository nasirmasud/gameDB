"use client";

import { ArrowRight, Play, Star } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { FaPlaystation, FaXbox } from "react-icons/fa6";
import { SiSteam } from "react-icons/si";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";

// npm install react-icons  (PlayStation / Xbox / Steam glyph গুলোর জন্য — lucide-react-এ brand icon নেই)

// ─── Types ────────────────────────────────────────────────────────────────

interface HeroGame {
  id: number;
  slug: string;
  name: string;
  background_image: string | null;
  rating: number;
  ratings_count: number;
  metacritic: number | null;
  description: string;
  platformSlugs: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function formatCount(n: number): string {
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

function displayScore(game: HeroGame): string {
  if (game.metacritic) return (game.metacritic / 10).toFixed(1);
  return (game.rating * 2).toFixed(1);
}

const PLATFORM_ICONS: Record<
  string,
  { icon: React.ElementType; label: string }[]
> = {
  playstation: [{ icon: FaPlaystation, label: "PlayStation" }],
  xbox: [{ icon: FaXbox, label: "Xbox" }],
  pc: [{ icon: SiSteam, label: "Steam" }],
};

function PlatformIcons({ slugs }: { slugs: string[] }) {
  const entries = slugs.flatMap((slug) => PLATFORM_ICONS[slug] ?? []);
  const hasPc = slugs.includes("pc");

  return (
    <div className='mt-6 flex items-center gap-4'>
      {entries.map(({ icon: Icon, label }) => (
        <Icon
          key={label}
          className='h-5 w-5 text-white/70'
          aria-label={label}
        />
      ))}
      {hasPc && (
        <span className='flex h-5 items-center rounded border border-white/30 px-1.5 text-[10px] font-bold tracking-wide text-white/70'>
          PC
        </span>
      )}
    </div>
  );
}

// ─── Single Slide ─────────────────────────────────────────────────────────

function HeroSlide({ game }: { game: HeroGame }) {
  return (
    <div
      className='relative h-[65vh] min-h-[440px] w-full overflow-hidden bg-[#05070c] sm:h-[75vh]'
      style={{
        backgroundImage: game.background_image
          ? `url(${game.background_image})`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* বাম থেকে ডানে ডার্ক ওভারলে, যাতে টেক্সট পড়া যায় */}
      <div
        className='absolute inset-0'
        style={{
          background:
            "linear-gradient(to right, #05070c 5%, #05070cdd 32%, #05070c88 55%, transparent 85%)",
        }}
      />

      <div className='relative z-10 flex h-full max-w-7xl flex-col justify-center px-6 sm:px-10 lg:px-20'>
        <div className='max-w-lg'>
          {/* Badge */}
          <div className='inline-flex items-center gap-2 text-sm font-medium text-white/70'>
            <Star className='h-4 w-4 fill-violet-400 text-violet-400' />
            Editor&apos;s Choice
          </div>

          {/* Title */}
          <h1 className='mt-3 text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl'>
            {game.name}
          </h1>

          {/* Rating */}
          <div className='mt-3 flex items-center gap-2 text-sm text-white/80'>
            <Star className='h-4 w-4 fill-lime-400 text-lime-400' />
            <span className='font-semibold text-white'>
              {displayScore(game)}
            </span>
            <span className='text-white/40'>•</span>
            <span>{formatCount(game.ratings_count)} Ratings</span>
          </div>

          {/* Description */}
          {game.description && (
            <p className='mt-4 line-clamp-2 max-w-md text-sm leading-relaxed text-white/60 sm:text-base'>
              {game.description}
            </p>
          )}

          {/* Platform icons */}
          <PlatformIcons slugs={game.platformSlugs} />

          {/* CTAs */}
          {/* CTAs */}
          <div className='mt-7 flex flex-wrap items-center gap-3'>
            <Link
              href={`/games/${game.slug}`}
              // h-12 এবং border-transparent যোগ করা হয়েছে
              className='inline-flex h-12 items-center gap-2 rounded-xs border border-transparent border-r-0 bg-gradient-to-r from-blue-500 to-violet-600 px-6 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:brightness-110'
            >
              View Details
              <ArrowRight className='h-4 w-4' />
            </Link>

            <Link
              href={`/games/${game.slug}#trailer`}
              // h-12 যোগ করা হয়েছে
              className='inline-flex h-12 items-center gap-2 rounded-xs border border-white/20 px-6 text-sm font-semibold text-white transition hover:bg-white/10'
            >
              <span className='flex h-6 w-6 items-center justify-center rounded-full border border-white/40'>
                <Play className='h-3 w-3 fill-white text-white' />
              </span>
              Watch Trailer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Loading / Error states ───────────────────────────────────────────────

function HeroSkeleton() {
  return <Skeleton className='h-[65vh] min-h-[440px] w-full rounded-none sm:h-[75vh]' />;
}

// ─── Main Slider ──────────────────────────────────────────────────────────

export default function HeroSlider() {
  const [games, setGames] = useState<HeroGame[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/hero-games")
      .then((res) => {
        if (!res.ok) throw new Error("failed");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setGames(data.results ?? []);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return null; // হিরো ব্যর্থ হলে পুরো হোমপেজ ভাঙার দরকার নেই, চুপচাপ hide করি
  if (!games) return <HeroSkeleton />;
  if (games.length === 0) return null;

  return (
    <>
      <style>{`
        .hero-swiper .swiper-pagination {
          bottom: 20px;
        }
        .hero-swiper .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: rgba(255, 255, 255, 0.35);
          opacity: 1;
          transition: all 0.3s ease;
        }
        .hero-swiper .swiper-pagination-bullet-active {
          width: 26px;
          border-radius: 4px;
          background: linear-gradient(to right, #3b82f6, #8b5cf6);
        }
      `}</style>

      <Swiper
        className='hero-swiper w-full'
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop={games.length > 1}
        speed={600}
      >
        {games.map((game) => (
          <SwiperSlide key={game.id}>
            <HeroSlide game={game} />
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
}
