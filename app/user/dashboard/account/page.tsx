import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { AccountOverview } from "@/components/dashboard/AccountOverview";
import Link from "next/link";
import { ArrowLeft, User as UserIcon } from "lucide-react";

export default async function UserAccountPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  await connectDB();
  const dbUser = await User.findById(session.user.id).select("name email role createdAt").lean();

  if (!dbUser) {
    redirect("/user/dashboard");
  }

  return (
    <div className="pt-20 pb-40 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/user/dashboard"
            className="flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
              <UserIcon className="h-6 w-6" /> Account
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your account details and management.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg space-y-6">
        <AccountOverview
          name={dbUser.name}
          email={dbUser.email}
          role={dbUser.role}
          createdAt={dbUser.createdAt.toISOString()}
        />
      </div>
    </div>
  );
}
