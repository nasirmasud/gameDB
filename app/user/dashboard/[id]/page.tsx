import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Review from "@/models/Review";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Star, MessageSquare, Calendar } from "lucide-react";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  await connectDB();
  const profileUser = await User.findById(id).lean();

  if (!profileUser) {
    notFound();
  }

  const reviews = await Review.find({ user: id })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  const isOwnProfile = session?.user?.id === id;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="rounded-xl border border-border bg-card p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-secondary text-xl font-bold">
            {(profileUser.name ?? "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{profileUser.name}</h1>
            <p className="text-sm text-muted-foreground">
              Member since{" "}
              {new Date(profileUser.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
              })}
            </p>
            {profileUser.role === "admin" && (
              <span className="mt-1 inline-block rounded bg-purple-600/30 px-2 py-0.5 text-xs font-medium text-purple-400">
                Admin
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-bold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Recent Reviews
        </h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {reviews.map((review) => (
              <div
                key={review._id.toString()}
                className="border-b border-border pb-4 last:border-0"
              >
                <div className="flex items-start justify-between mb-1">
                  <Link
                    href={`/games/${review.gameId}`}
                    className="font-medium hover:text-primary"
                  >
                    {review.gameName}
                  </Link>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span className="text-sm font-medium">{review.rating}/5</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{review.comment}</p>
                <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {isOwnProfile && (
        <div className="mt-4 text-center">
          <Link
            href="/user/dashboard"
            className="text-sm text-blue-400 hover:underline"
          >
            Go to your Dashboard →
          </Link>
        </div>
      )}
    </div>
  );
}
