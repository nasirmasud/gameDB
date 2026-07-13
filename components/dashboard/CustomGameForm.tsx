"use client";

import { useState, useRef, type FormEvent } from "react";
import { X, Upload, Plus } from "lucide-react";
import { uploadToImageBB } from "@/lib/imagebb";

const PLATFORM_OPTIONS = [
  "PC", "PlayStation 5", "PlayStation 4", "Xbox Series X", "Xbox One",
  "Nintendo Switch", "iOS", "Android", "Linux", "macOS",
];

interface FormData {
  title: string;
  shortDescription: string;
  fullDescription: string;
  releaseDate: string;
  genre: string;
  developer: string;
  publisher: string;
  platforms: string[];
  tags: string[];
  imageUrl: string;
  screenshots: string[];
}

interface Props {
  initial?: Partial<FormData>;
  gameId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function CustomGameForm({ initial, gameId, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [shortDescription, setShortDescription] = useState(initial?.shortDescription ?? "");
  const [fullDescription, setFullDescription] = useState(initial?.fullDescription ?? "");
  const [releaseDate, setReleaseDate] = useState(initial?.releaseDate ?? "");
  const [genre, setGenre] = useState(initial?.genre ?? "");
  const [developer, setDeveloper] = useState(initial?.developer ?? "");
  const [publisher, setPublisher] = useState(initial?.publisher ?? "");
  const [platforms, setPlatforms] = useState<string[]>(initial?.platforms ?? []);
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>(initial?.screenshots ?? []);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const screenshotsRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  function handleScreenshotsChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length) {
      setScreenshotFiles((prev) => [...prev, ...files]);
      files.forEach((f) => {
        setScreenshotPreviews((prev) => [...prev, URL.createObjectURL(f)]);
      });
    }
  }

  function removeScreenshot(index: number) {
    setScreenshotFiles((prev) => prev.filter((_, i) => i !== index));
    setScreenshotPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags((prev) => [...prev, t]);
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  function togglePlatform(p: string) {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim() || !shortDescription.trim() || !fullDescription.trim() || !releaseDate || !genre.trim()) {
      setError("Title, short description, full description, release date, and genre are required.");
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = initial?.imageUrl ?? "";
      if (imageFile) {
        imageUrl = await uploadToImageBB(imageFile);
      }

      const uploadedScreenshots: string[] = [];
      for (const file of screenshotFiles) {
        const url = await uploadToImageBB(file);
        uploadedScreenshots.push(url);
      }

      const keptOld = (initial?.screenshots ?? []).filter((s) =>
        screenshotPreviews.includes(s as string),
      );

      const allScreenshots = [...uploadedScreenshots, ...keptOld];

      const body = {
        title, shortDescription, fullDescription, releaseDate, genre,
        developer, publisher, platforms, tags,
        imageUrl,
        screenshots: allScreenshots,
      };

      const url = gameId
        ? `/api/user/custom-games/${gameId}`
        : "/api/user/custom-games";
      const method = gameId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      onSuccess();
    } catch {
      setError("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60">
      <div className="relative w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-5 text-lg font-bold">{gameId ? "Edit Custom Game" : "Add Custom Game"}</h2>

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
              <input type="text" value={developer} onChange={(e) => setDeveloper(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Publisher <span className="text-muted-foreground">(optional)</span></label>
              <input type="text" value={publisher} onChange={(e) => setPublisher(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Platforms <span className="text-muted-foreground">(optional)</span></label>
            <div className="flex flex-wrap gap-2">
              {PLATFORM_OPTIONS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlatform(p)}
                  className={`rounded border px-2.5 py-1 text-xs transition ${
                    platforms.includes(p)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Tags <span className="text-muted-foreground">(optional)</span></label>
            <div className="flex gap-2">
              <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="Type a tag and press Enter"
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              <button type="button" onClick={addTag}
                className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm hover:bg-secondary">
                <Plus className="h-4 w-4" /> Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="text-muted-foreground hover:text-foreground">&times;</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Cover Image <span className="text-muted-foreground">(optional)</span></label>
            <div onClick={() => fileRef.current?.click()}
              className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-background px-3 py-4 text-sm text-muted-foreground hover:border-primary hover:text-primary">
              {imagePreview ? (
                <img src={imagePreview} alt="" className="h-24 w-full rounded object-cover" />
              ) : initial?.imageUrl ? (
                <img src={initial.imageUrl} alt="" className="h-24 w-full rounded object-cover" />
              ) : (
                <><Upload className="h-6 w-6" /><span>Click to upload cover image</span></>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Screenshots <span className="text-muted-foreground">(optional, add multiple)</span></label>
            <div onClick={() => screenshotsRef.current?.click()}
              className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-background px-3 py-4 text-sm text-muted-foreground hover:border-primary hover:text-primary">
              <Upload className="h-6 w-6" />
              <span>Click to add screenshots</span>
            </div>
            <input ref={screenshotsRef} type="file" accept="image/*" multiple onChange={handleScreenshotsChange} className="hidden" />
            {screenshotPreviews.length > 0 && (
              <div className="mt-2 grid grid-cols-4 gap-2">
                {screenshotPreviews.map((src, i) => (
                  <div key={i} className="relative group">
                    <img src={src} alt="" className="h-20 w-full rounded object-cover" />
                    <button type="button" onClick={() => removeScreenshot(i)}
                      className="absolute right-0.5 top-0.5 hidden h-5 w-5 items-center justify-center rounded-full bg-background/80 text-xs group-hover:flex">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-secondary">Cancel</button>
            <button type="submit" disabled={submitting}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
              {submitting ? "Submitting..." : gameId ? "Save Changes" : "Create Game"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
