import type { Metadata } from "next";
import { connectDB } from "@/lib/mongodb";
import CustomGame from "@/models/CustomGame";
import { Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Community",
  description: "Discover custom games created by the community.",
};
import { FaWindows, FaPlaystation, FaXbox, FaApple, FaLinux, FaAndroid } from "react-icons/fa";
import { BsNintendoSwitch, BsGlobe } from "react-icons/bs";
import { MdPhoneIphone } from "react-icons/md";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ page?: string }>;
}

const PAGE_SIZE = 24;

function PlatformIcons({ platforms }: { platforms: string[] }) {
  if (platforms.length === 0) return null;
  return (
    <div className="flex items-center gap-1.5">
      {platforms.map((name) => {
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
        return <Icon key={name} className="h-3.5 w-3.5 text-muted-foreground" title={name} />;
      })}
    </div>
  );
}

export default async function CommunityPage({ searchParams }: Props) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1") || 1);

  await connectDB();

  const [games, total] = await Promise.all([
    CustomGame.find({ status: "published" })
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
    CustomGame.countDocuments({ status: "published" }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-10 xl:px-16">
      <div className="mb-8">
        <h1 className="mb-1 text-3xl font-bold text-foreground">Community Games</h1>
        <p className="text-sm text-muted-foreground">
          {total.toLocaleString()} community-created games
        </p>
      </div>

      {games.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-card py-20 text-center">
          <p className="text-lg font-semibold text-foreground">No community games yet</p>
          <p className="text-sm text-muted-foreground">
            Be the first to submit a custom game!
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {games.map((g) => {
              const game = {
                _id: g._id.toString(),
                title: g.title,
                shortDescription: g.shortDescription,
                genre: g.genre,
                developer: g.developer ?? null,
                publisher: g.publisher ?? null,
                platforms: g.platforms ?? [],
                imageUrl: g.imageUrl ?? null,
                releaseDate: g.releaseDate.toISOString(),
              };
              return (
                <Link
                  key={game._id}
                  href={`/games/custom/${game._id}`}
                  className="group relative flex w-full shrink-0 flex-col overflow-hidden rounded-sm border border-border bg-card transition-transform hover:-translate-y-1"
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-secondary">
                    {game.imageUrl ? (
                      <img
                        src={game.imageUrl}
                        alt={game.title}
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
                      {game.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">{game.genre}</p>
                    <PlatformIcons platforms={game.platforms} />
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(game.releaseDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                      })}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              {page > 1 && (
                <Link
                  href={`/community?page=${page - 1}`}
                  className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
                >
                  Previous
                </Link>
              )}
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/community?page=${page + 1}`}
                  className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
                >
                  Next
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
