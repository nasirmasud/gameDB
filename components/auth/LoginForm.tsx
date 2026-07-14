"use client";

import { Button } from "@/components/ui/button";
import { FieldTooltip } from "@/components/ui/field-tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import { toast } from "sonner";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FieldErrors {
  email?: string;
  password?: string;
}

interface Props {
  callbackUrl?: string;
}

function getDefaultRedirect(role?: string) {
  if (role === "admin") return "/admin/dashboard";
  return "/";
}

export function LoginForm({ callbackUrl: propCallbackUrl }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = propCallbackUrl || searchParams.get("callbackUrl") || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [quickLoading, setQuickLoading] = useState<string | null>(null);

  const validate = useCallback((): FieldErrors => {
    const errors: FieldErrors = {};
    if (!email.trim()) errors.email = "Email is required.";
    else if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";
    if (!password) errors.password = "Password is required.";
    else if (password.length < 6) errors.password = "Must be at least 6 characters.";
    return errors;
  }, [email, password]);

  const errors = validate();

  async function getRedirectPath(knownRole?: string) {
    if (callbackUrl) return callbackUrl;

    if (knownRole) return getDefaultRedirect(knownRole);

    for (let i = 0; i < 3; i++) {
      const res = await fetch("/api/auth/session");
      const session = await res.json();
      if (session?.user?.role) {
        return getDefaultRedirect(session.user.role);
      }
      if (i < 2) await new Promise((r) => setTimeout(r, 300));
    }
    return "/";
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) return;

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
    router.push(await getRedirectPath());
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
    router.push(await getRedirectPath(label === "Admin" ? "admin" : "user"));
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
          onBlur={() => setTouched((p) => ({ ...p, email: true }))}
          aria-invalid={touched.email && !!errors.email || undefined}
        />
        <FieldTooltip
          show={touched.email && !!errors.email}
          message={errors.email ?? ""}
          variant='error'
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
          onBlur={() => setTouched((p) => ({ ...p, password: true }))}
          aria-invalid={touched.password && !!errors.password || undefined}
        />
        <FieldTooltip
          show={touched.password && !!errors.password}
          message={errors.password ?? ""}
          variant='error'
        />
      </div>

      <Button type='submit' disabled={isLoading} className='mt-2'>
        {isLoading ? "Logging in..." : "Log In"}
      </Button>

      <p className='text-center text-sm text-muted-foreground'>
        Don&apos;t have an account?{" "}
        <Link
          href={callbackUrl ? `/register?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/register'}
          className='font-medium text-primary hover:underline'
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
