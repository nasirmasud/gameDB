"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

async function redirectAfterLogin() {
  const res = await fetch("/api/auth/session");
  const session = await res.json();
  if (session?.user?.role === "admin") {
    return "/admin/dashboard";
  }
  return "/user/dashboard";
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [quickLoading, setQuickLoading] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      toast.error("Invalid email or password. Please try again.");
      return;
    }

    toast.success("Welcome back!");
    router.push(await redirectAfterLogin());
    router.refresh();
  };

  const handleQuickLogin = async (email: string, password: string, label: string) => {
    setQuickLoading(label);
    const result = await signIn("credentials", { email, password, redirect: false });
    setQuickLoading(null);

    if (result?.error) {
      toast.error("Quick login failed!");
      return;
    }

    toast.success(`Logged in as ${label}!`);
    router.push(await redirectAfterLogin());
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
      <div className='grid grid-cols-2 gap-2'>
        <Button
          type='button'
          variant='outline'
          size='sm'
          disabled={!!quickLoading}
          onClick={() => handleQuickLogin("demo@gamedb.com", "demo1234", "User")}
        >
          {quickLoading === "User" ? "Loading..." : "Login as User"}
        </Button>
        <Button
          type='button'
          variant='outline'
          size='sm'
          disabled={!!quickLoading}
          onClick={() => handleQuickLogin("admin@gamedb.com", "admin1234", "Admin")}
        >
          {quickLoading === "Admin" ? "Loading..." : "Login as Admin"}
        </Button>
      </div>

      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t border-border' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-card px-2 text-muted-foreground'>Or login with email</span>
        </div>
      </div>

      <div className='flex flex-col gap-2'>
        <Label htmlFor='email'>Email</Label>
        <Input
          id='email'
          type='email'
          placeholder='you@example.com'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className='flex flex-col gap-2'>
        <Label htmlFor='password'>Password</Label>
        <Input
          id='password'
          type='password'
          placeholder='••••••••'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>

      <Button type='submit' disabled={isLoading} className='mt-2'>
        {isLoading ? "Logging in..." : "Log In"}
      </Button>

      <p className='text-center text-sm text-muted-foreground'>
        Don&apos;t have an account?{" "}
        <Link
          href='/register'
          className='font-medium text-primary hover:underline'
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
