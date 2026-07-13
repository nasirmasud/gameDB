import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import CustomGame from "@/models/CustomGame";
import { AdminCustomGamesTable } from "@/components/admin/AdminCustomGamesTable";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Custom Games",
};
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AdminCustomGamesPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }

  await connectDB();

  const games = await CustomGame.find()
    .populate("submittedBy", "name email")
    .sort({ createdAt: -1 })
    .lean();

  const rows = games.map((g) => ({
    _id: g._id.toString(),
    title: g.title,
    shortDescription: g.shortDescription,
    genre: g.genre,
    status: g.status,
    submittedBy: g.submittedBy
      ? { name: (g.submittedBy as { name: string }).name, email: (g.submittedBy as { email: string }).email }
      : null,
    createdAt: g.createdAt.toISOString(),
  }));

  const counts = { published: 0, draft: 0, pending: 0, archived: 0 };
  for (const g of games) {
    if (g.status in counts) counts[g.status as keyof typeof counts]++;
  }

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
          <h1 className="text-xl font-bold sm:text-2xl">Custom Games</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {games.length} submissions &mdash;{" "}
            <span className="text-green-400">{counts.published} published</span>
            {", "}
            <span className="text-purple-400">{counts.draft} draft</span>
            {", "}
            <span className="text-yellow-400">{counts.pending} pending</span>
            {", "}
            <span className="text-red-400">{counts.archived} archived</span>
          </p>
        </div>
      </div>

      <AdminCustomGamesTable games={rows} />
    </div>
  );
}
