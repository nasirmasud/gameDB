import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Review from "@/models/Review";
import Favorite from "@/models/Favorite";
import { AdminUsersTable } from "@/components/admin/AdminUsersTable";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }

  await connectDB();

  const users = await User.find().sort({ createdAt: -1 }).lean();

  const usersWithCounts = await Promise.all(
    users.map(async (u) => {
      const [reviewCount, favoriteCount] = await Promise.all([
        Review.countDocuments({ user: u._id }),
        Favorite.countDocuments({ user: u._id }),
      ]);
      return {
        _id: u._id.toString(),
        name: u.name,
        email: u.email,
        role: u.role,
        isBanned: u.isBanned,
        createdAt: u.createdAt.toISOString(),
        reviewCount,
        favoriteCount,
      };
    }),
  );

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
          <h1 className="text-xl font-bold sm:text-2xl">All Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {usersWithCounts.length} total users on the platform.
          </p>
        </div>
      </div>

      <AdminUsersTable users={usersWithCounts} />
    </div>
  );
}
