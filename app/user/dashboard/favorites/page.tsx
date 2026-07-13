import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { getGameById } from "@/lib/rawg";
import Favorite from "@/models/Favorite";
import { UserFavoritesTable } from "@/components/dashboard/UserFavoritesTable";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function UserFavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  await connectDB();

  const favorites = await Favorite.find({ user: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  const rows = await Promise.all(
    favorites.map(async (f) => {
      let image = f.gameImage ?? null;
      let genre = null as string | null;
      let platforms = null as string | null;
      let publishers = null as string | null;
      try {
        const detail = await getGameById(f.gameId);
        if (!image) image = detail.background_image ?? null;
        if (detail.genres && detail.genres.length > 0) {
          genre = detail.genres.map((g) => g.name).join(", ");
        }
        if (detail.platforms && detail.platforms.length > 0) {
          platforms = detail.platforms.map((p) => p.platform.name).join(", ");
        }
        if (detail.publishers && detail.publishers.length > 0) {
          publishers = detail.publishers.map((p) => p.name).join(", ");
        }
      } catch {
        // use stored values
      }
      return {
        _id: f._id.toString(),
        gameId: f.gameId,
        gameName: f.gameName,
        gameImage: image,
        gameRating: f.gameRating ?? null,
        genre,
        platforms,
        publishers,
        createdAt: f.createdAt.toISOString(),
      };
    }),
  );

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/user/dashboard"
          className="flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">My Wishlist</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {rows.length} wishlisted games.
          </p>
        </div>
      </div>

      <UserFavoritesTable favorites={rows} />
    </div>
  );
}
