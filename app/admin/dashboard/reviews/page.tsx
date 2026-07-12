import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Review from "@/models/Review";
import Link from "next/link";
import { ArrowLeft, Star, MessageSquare } from "lucide-react";

export default async function AdminReviewsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }

  await connectDB();

  const reviews = await Review.find()
    .sort({ createdAt: -1 })
    .lean();

  const statusColors: Record<string, string> = {
    approved: "text-green-400",
    pending: "text-yellow-400",
    rejected: "text-red-400",
  };

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
            {reviews.length} total reviews on the platform.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="px-4 py-3 text-left font-medium">Game</th>
              <th className="px-4 py-3 text-left font-medium">User</th>
              <th className="px-4 py-3 text-center font-medium">Rating</th>
              <th className="px-4 py-3 text-left font-medium">Comment</th>
              <th className="px-4 py-3 text-center font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r._id.toString()} className="border-b border-border last:border-0 hover:bg-secondary/50">
                <td className="px-4 py-3">
                  <Link href={`/games/${r.gameId}`} className="font-medium hover:text-primary">
                    {r.gameName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{r.userName}</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center gap-1 text-yellow-400">
                    <Star className="h-3.5 w-3.5 fill-current" /> {r.rating}/5
                  </span>
                </td>
                <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">
                  {r.comment}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs font-medium capitalize ${statusColors[r.status] ?? "text-muted-foreground"}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(r.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No reviews yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
