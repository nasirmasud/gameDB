import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { getGameById } from "@/lib/rawg";
import Review from "@/models/Review";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Reviews",
};
import { UserReviewsTable } from "@/components/dashboard/UserReviewsTable";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function UserReviewsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  await connectDB();

  const reviews = await Review.find({ user: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  const rows = await Promise.all(
    reviews.map(async (r) => {
      let image = r.gameImage ?? null;
      let genre = null as string | null;
      let platforms = null as string | null;
      let publishers = null as string | null;
      try {
        const detail = await getGameById(r.gameId);
        if (!image) image = detail.background_image ?? null;
        if (detail.genres?.length) genre = detail.genres.map((g) => g.name).join(", ");
        if (detail.platforms?.length) platforms = detail.platforms.map((p) => p.platform.name).join(", ");
        if (detail.publishers?.length) publishers = detail.publishers.map((p) => p.name).join(", ");
      } catch {
        // use stored values
      }
      return {
        _id: r._id.toString(),
        gameId: r.gameId,
        gameName: r.gameName,
        gameImage: image,
        rating: r.rating,
        comment: r.comment,
        status: r.status,
        genre,
        platforms,
        publishers,
        createdAt: r.createdAt.toISOString(),
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
          <h1 className="text-xl font-bold sm:text-2xl">My Reviews</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {rows.length} total reviews.
          </p>
        </div>
      </div>

      <UserReviewsTable reviews={rows} />
    </div>
  );
}
