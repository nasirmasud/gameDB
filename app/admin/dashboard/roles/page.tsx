import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, User as UserIcon } from "lucide-react";

export default async function AdminRolesPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }

  await connectDB();

  const users = await User.find().sort({ role: 1, name: 1 }).lean();

  const admins = users.filter((u) => u.role === "admin");
  const regularUsers = users.filter((u) => u.role === "user");

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
          <h1 className="text-xl font-bold sm:text-2xl">Roles & Permissions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {users.length} total users &mdash; {admins.length} admins,{" "}
            {regularUsers.length} users.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <ShieldCheck className="h-5 w-5 text-purple-400" />
            Admins
          </h2>
          <div className="flex flex-col gap-2">
            {admins.length === 0 && (
              <p className="text-sm text-muted-foreground">No admin users.</p>
            )}
            {admins.map((a) => (
              <div
                key={a._id.toString()}
                className="flex items-center justify-between rounded-lg border border-border bg-secondary px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600/30 text-xs font-bold text-purple-400">
                    {a.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{a.email}</p>
                  </div>
                </div>
                <span className="rounded bg-purple-600/30 px-2 py-0.5 text-xs font-medium text-purple-400">
                  Admin
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <UserIcon className="h-5 w-5 text-blue-400" />
            Users
          </h2>
          <div className="flex flex-col gap-2">
            {regularUsers.length === 0 && (
              <p className="text-sm text-muted-foreground">No regular users.</p>
            )}
            {regularUsers.map((u) => (
              <div
                key={u._id.toString()}
                className="flex items-center justify-between rounded-lg border border-border bg-secondary px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600/30 text-xs font-bold text-blue-400">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </div>
                <span className="rounded bg-blue-600/30 px-2 py-0.5 text-xs font-medium text-blue-400">
                  User
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <h2 className="mb-3 text-lg font-bold">Permission Overview</h2>
        <div className="grid gap-4 text-sm md:grid-cols-2">
          <div className="rounded-lg border border-border bg-secondary p-4">
            <h3 className="mb-2 font-semibold">
              <ShieldCheck className="mr-1.5 inline h-4 w-4 text-purple-400" />
              Admin Permissions
            </h3>
            <ul className="list-inside list-disc space-y-1 text-muted-foreground">
              <li>Full access to admin dashboard</li>
              <li>View, approve, reject, delete all reviews</li>
              <li>View, ban, unban, delete users</li>
              <li>View all platform games and activity</li>
              <li>Manage roles and permissions</li>
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-secondary p-4">
            <h3 className="mb-2 font-semibold">
              <UserIcon className="mr-1.5 inline h-4 w-4 text-blue-400" />
              User Permissions
            </h3>
            <ul className="list-inside list-disc space-y-1 text-muted-foreground">
              <li>Browse and explore games</li>
              <li>Submit reviews and ratings</li>
              <li>Add games to favorites</li>
              <li>Submit custom games</li>
              <li>Manage personal profile</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
