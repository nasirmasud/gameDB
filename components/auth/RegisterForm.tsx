"use client";

import { Button } from "@/components/ui/button";
import { FieldTooltip } from "@/components/ui/field-tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";
import { uploadToImageBB } from "@/lib/imagebb";
import { ImagePlus, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface Props {
  callbackUrl?: string;
}

export function RegisterForm({ callbackUrl: propCallbackUrl }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = propCallbackUrl || searchParams.get("callbackUrl") || "";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validate = useCallback((): FieldErrors => {
    const errors: FieldErrors = {};
    if (!name.trim()) errors.name = "Name is required.";
    if (!email.trim()) errors.email = "Email is required.";
    else if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";
    if (!password) errors.password = "Password is required.";
    else if (password.length < 6) errors.password = "Must be at least 6 characters.";
    if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match.";
    return errors;
  }, [name, email, password, confirmPassword]);

  const errors = validate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImage(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({ name: true, email: true, password: true, confirmPassword: true });

    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) return;

    setIsLoading(true);

    try {
      let imageUrl: string | undefined;
      if (image) {
        try {
          imageUrl = await uploadToImageBB(image);
        } catch {
          toast.warning("Image upload failed, continuing without profile image.");
        }
      }

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, image: imageUrl }),
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
        const loginUrl = callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/login";
        router.push(loginUrl);
        return;
      }

      toast.success("Account created successfully!");
      router.push(callbackUrl || "/");
      router.refresh();
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
          onBlur={() => setTouched((p) => ({ ...p, name: true }))}
          aria-invalid={touched.name && !!errors.name || undefined}
        />
        <FieldTooltip
          show={touched.name && !!errors.name}
          message={errors.name ?? ""}
          variant='error'
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
          placeholder='At least 6 characters'
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

      <div className='flex flex-col gap-2'>
        <Label htmlFor='confirmPassword'>Confirm Password</Label>
        <Input
          id='confirmPassword'
          type='password'
          placeholder='Re-enter your password'
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onBlur={() => setTouched((p) => ({ ...p, confirmPassword: true }))}
          aria-invalid={touched.confirmPassword && !!errors.confirmPassword || undefined}
        />
        <FieldTooltip
          show={touched.confirmPassword && !!errors.confirmPassword}
          message={errors.confirmPassword ?? ""}
          variant='error'
        />
      </div>

      <div className='flex flex-col gap-2'>
        <Label htmlFor='image'>Profile Image (optional)</Label>
        <div className='flex items-center gap-3'>
          <div className='relative size-14 shrink-0'>
            {imagePreview ? (
              <div className='relative size-full rounded-full overflow-hidden border border-border'>
                <img
                  src={imagePreview}
                  alt='Preview'
                  className='size-full object-cover'
                />
                <button
                  type='button'
                  onClick={clearImage}
                  className='absolute top-0 right-0 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs'
                >
                  <X className='size-3' />
                </button>
              </div>
            ) : (
              <div className='flex size-full items-center justify-center rounded-full border border-border bg-secondary text-muted-foreground'>
                <ImagePlus className='size-6' />
              </div>
            )}
          </div>
          <Input
            ref={fileInputRef}
            id='image'
            type='file'
            accept='image/*'
            onChange={handleImageChange}
            className='flex-1'
          />
        </div>
      </div>

      <Button type='submit' disabled={isLoading} className='mt-2'>
        {isLoading ? "Creating account..." : "Sign Up"}
      </Button>

      <p className='text-center text-sm text-muted-foreground'>
        Already have an account?{" "}
        <Link
          href={callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/login'}
          className='font-medium text-primary hover:underline'
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
