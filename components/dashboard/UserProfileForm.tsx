"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Save, ImagePlus, X } from "lucide-react";
import { uploadToImageBB } from "@/lib/imagebb";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function UserProfileForm() {
  const { update: updateSession } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.name) setName(data.name);
        if (data.email) setEmail(data.email);
        if (data.image) {
          setCurrentImage(data.image);
          setImagePreview(data.image);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
    setCurrentImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let imageUrl = currentImage;
      if (image) {
        try {
          imageUrl = await uploadToImageBB(image);
        } catch {
          toast.warning("Image upload failed, profile image not updated.");
          setSaving(false);
          return;
        }
      }

      const body: Record<string, string> = { name: name.trim() };

      if (imageUrl !== currentImage) {
        body.image = imageUrl ?? "";
      }

      if (currentPassword && newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }

      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Update failed.");
        return;
      }

      if (imageUrl) setCurrentImage(imageUrl);
      setCurrentPassword("");
      setNewPassword("");
      await updateSession({ name: name.trim(), image: imageUrl ?? undefined });
      router.refresh();
      router.push("/user/dashboard");
      toast.success(data.message);
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-1.5 block text-sm font-medium">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Email</label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full cursor-not-allowed rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-muted-foreground"
        />
        <p className="mt-1 text-xs text-muted-foreground">Email cannot be changed.</p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Profile Image</label>
        <div className="flex items-center gap-3">
          <div className="relative size-16 shrink-0">
            {imagePreview ? (
              <div className="relative size-full rounded-full overflow-hidden border border-border">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="size-full object-cover"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-0 right-0 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs"
                >
                  <X className="size-3" />
                </button>
              </div>
            ) : (
              <div className="flex size-full items-center justify-center rounded-full border border-border bg-secondary text-muted-foreground">
                <ImagePlus className="size-6" />
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="flex-1 rounded-lg border border-border bg-card px-4 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1 file:text-xs file:font-medium file:text-white"
          />
        </div>
      </div>

      <hr className="border-border" />

      <div>
        <label className="mb-1.5 block text-sm font-medium">Current Password</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Leave blank to keep current"
          className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="At least 6 characters"
          minLength={6}
          className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {saving ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
        ) : (
          <><Save className="h-4 w-4" /> Save Changes</>
        )}
      </button>
    </form>
  );
}
