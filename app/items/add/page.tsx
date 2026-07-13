"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CustomGameForm } from "@/components/dashboard/CustomGameForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AddItemPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className='flex min-h-[60vh] items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent' />
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <div className='mx-auto max-w-2xl p-4 sm:p-6 lg:p-8'>
      <div className='mb-6 flex items-center gap-3'>
        <Link
          href='/items/manage'
          className='flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-secondary'
        >
          <ArrowLeft className='h-4 w-4' /> Back
        </Link>
        <div>
          <h1 className='text-xl font-bold sm:text-2xl'>Add Custom Game</h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Submit a new game to the community catalog.
          </p>
        </div>
      </div>

      <div className='rounded-xl border border-border bg-card p-6'>
        <CustomGameForm
          onClose={() => router.push("/items/manage")}
          onSuccess={() => router.push("/items/manage")}
        />
      </div>
    </div>
  );
}
