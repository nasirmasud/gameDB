import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Review from "@/models/Review";
import { AdminReviewsTable } from "@/components/admin/AdminReviewsTable";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Reviews",
};
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AdminReviewsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }

  await connectDB();

  const reviews = await Review.find()
    .sort({ createdAt: -1 })
    .lean();

  const rows = reviews.map((r) => ({
    _id: r._id.toString(),
    gameId: r.gameId,
    gameName: r.gameName,
    userName: r.userName,
    rating: r.rating,
    comment: r.comment,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">All Reviews</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {rows.length} total reviews on the platform.
          </p>
        </div>
      </div>

      <AdminReviewsTable reviews={rows} />
    </div>
  );
}
