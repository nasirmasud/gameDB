import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import CustomGame from "@/models/CustomGame";
import { UserCustomGamesTable } from "@/components/dashboard/UserCustomGamesTable";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Custom Games",
};
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

const STATUS_BADGE: Record<string, string> = {
  published: "bg-green-600/30 text-green-400",
  draft: "bg-purple-600/30 text-purple-400",
  pending: "bg-yellow-600/30 text-yellow-400",
  archived: "bg-red-600/30 text-red-400",
};

export default async function ManageItemsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  await connectDB();

  const games = await CustomGame.find({ submittedBy: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  const rows = games.map((g) => ({
    _id: g._id.toString(),
    title: g.title,
    shortDescription: g.shortDescription,
    genre: g.genre,
    status: g.status,
    createdAt: g.createdAt.toISOString(),
  }));

  const counts = { published: 0, draft: 0, pending: 0, archived: 0 };
  for (const g of games) {
    if (g.status in counts) counts[g.status as keyof typeof counts]++;
  }

  return (
    <div className='mx-auto max-w-7xl p-4 sm:p-6 lg:p-8'>
      <div className='mb-6 flex items-center gap-3'>
        <Link
          href='/user/dashboard'
          className='flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-secondary'
        >
          <ArrowLeft className='h-4 w-4' /> Back
        </Link>
        <div className='flex-1'>
          <h1 className='text-xl font-bold sm:text-2xl'>Manage Custom Games</h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            {rows.length} submissions &mdash;{" "}
            <span className='text-green-400'>{counts.published} published</span>
            {", "}
            <span className='text-purple-400'>{counts.draft} draft</span>
            {", "}
            <span className='text-yellow-400'>{counts.pending} pending</span>
            {", "}
            <span className='text-red-400'>{counts.archived} archived</span>
          </p>
        </div>
        <Link
          href='/items/add'
          className='flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90'
        >
          <Plus className='h-4 w-4' /> Add Game
        </Link>
      </div>

      <UserCustomGamesTable games={rows} />
    </div>
  );
}
