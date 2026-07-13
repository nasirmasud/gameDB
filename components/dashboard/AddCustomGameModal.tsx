"use client";

import { useState, useRef, type FormEvent } from "react";
import { X, Upload } from "lucide-react";
import { uploadToImageBB } from "@/lib/imagebb";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export function AddCustomGameModal({ onClose, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [genre, setGenre] = useState("");
  const [developer, setDeveloper] = useState("");
  const [publisher, setPublisher] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim() || !shortDescription.trim() || !fullDescription.trim() || !releaseDate || !genre.trim()) {
      setError("All fields except image are required.");
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = "";
      if (imageFile) {
        imageUrl = await uploadToImageBB(imageFile);
      }

      const res = await fetch("/api/user/custom-games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, shortDescription, fullDescription, releaseDate, genre, developer, publisher, imageUrl }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      onCreated();
    } catch {
      setError("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60">
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg">
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-5 text-lg font-bold">Add Custom Game</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Short Description</label>
            <input type="text" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} maxLength={200}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Full Description</label>
            <textarea rows={4} value={fullDescription} onChange={(e) => setFullDescription(e.target.value)} maxLength={3000}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Release Date</label>
              <input type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Genre</label>
              <input type="text" value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="e.g. RPG, Strategy"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Developer <span className="text-muted-foreground">(optional)</span></label>
              <input type="text" value={developer} onChange={(e) => setDeveloper(e.target.value)} placeholder="e.g. Naughty Dog"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Publisher <span className="text-muted-foreground">(optional)</span></label>
              <input type="text" value={publisher} onChange={(e) => setPublisher(e.target.value)} placeholder="e.g. Sony"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Image <span className="text-muted-foreground">(optional)</span></label>
            <div
              onClick={() => fileRef.current?.click()}
              className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-background px-3 py-4 text-sm text-muted-foreground hover:border-primary hover:text-primary"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="h-24 w-full rounded object-cover" />
              ) : (
                <>
                  <Upload className="h-6 w-6" />
                  <span>Click to upload image</span>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            {imageFile && (
              <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="mt-1 text-xs text-red-400 hover:underline">
                Remove
              </button>
            )}
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
              {submitting ? "Submitting..." : "Create Game"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
