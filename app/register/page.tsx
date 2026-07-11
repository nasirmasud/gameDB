import { RegisterForm } from "@/components/auth/RegisterForm";
import { Gamepad2 } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className='flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12'>
      <div className='w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm'>
        <Link href='/' className='mb-6 flex items-center justify-center gap-2'>
          <Gamepad2 className='h-6 w-6 text-primary' />
          <span className='text-lg font-bold tracking-tight'>GameDB</span>
        </Link>

        <h1 className='mb-1 text-center text-xl font-bold text-foreground'>
          Create your account
        </h1>
        <p className='mb-6 text-center text-sm text-muted-foreground'>
          Join GameDB to save favorites and write reviews.
        </p>

        <RegisterForm />
      </div>
    </div>
  );
}
