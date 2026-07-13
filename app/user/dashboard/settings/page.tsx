import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/dashboard/SettingsForm";
import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function UserSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
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
              <Settings className="h-6 w-6" /> Settings
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Appearance and notification preferences.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg space-y-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <SettingsForm />
        </div>
      </div>
    </div>
  );
}
