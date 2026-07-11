"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong.");
        setIsLoading(false);
        return;
      }

      // Auto sign-in right after successful registration
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        toast.success("Account created! Please log in.");
        router.push("/login");
        return;
      }

      toast.success("Account created successfully!");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
      <div className='flex flex-col gap-2'>
        <Label htmlFor='name'>Full Name</Label>
        <Input
          id='name'
          type='text'
          placeholder='Your name'
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
          placeholder='At least 6 characters'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>

      <div className='flex flex-col gap-2'>
        <Label htmlFor='confirmPassword'>Confirm Password</Label>
        <Input
          id='confirmPassword'
          type='password'
          placeholder='Re-enter your password'
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      <Button type='submit' disabled={isLoading} className='mt-2'>
        {isLoading ? "Creating account..." : "Sign Up"}
      </Button>

      <p className='text-center text-sm text-muted-foreground'>
        Already have an account?{" "}
        <Link
          href='/login'
          className='font-medium text-primary hover:underline'
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
