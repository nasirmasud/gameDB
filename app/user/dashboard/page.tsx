import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function UserDashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  await connectDB();
  const dbUser = await User.findById(session.user.id).select("createdAt").lean();

  return (
    <DashboardContent
      user={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        createdAt: dbUser?.createdAt?.toISOString() ?? null,
      }}
    />
  );
}
