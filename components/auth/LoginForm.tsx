"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const DEMO_EMAIL = "demo@gamedb.com";
const DEMO_PASSWORD = "demo1234";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    router.push("/");
    router.refresh();
  };

  const fillDemoCredentials = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    toast.info("Demo credentials filled — click Log In to continue.");
  };

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
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

      <Button
        type='button'
        variant='outline'
        onClick={fillDemoCredentials}
        disabled={isLoading}
      >
        Use Demo Account
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
