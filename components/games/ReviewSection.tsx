"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

interface ReviewItem {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface Props {
  gameId: number;
  gameName: string;
  gameImage?: string;
}

export function ReviewSection({ gameId, gameName, gameImage }: Props) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  async function fetchReviews(p: number) {
    setLoading(true);
    try {
      const res = await fetch(`/api/games/${gameId}/reviews?page=${p}&pageSize=${pageSize}`);
      const data = await res.json();
      if (res.ok) {
        setReviews(data.reviews);
        setTotal(data.total);
        setPage(data.page);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReviews(page);
  }, [page]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }
    if (!comment.trim()) {
      setError("Please write a comment.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/games/${gameId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment.trim(), gameName, gameImage }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setSuccess("Review submitted!");
      setRating(0);
      setComment("");
      setPage(1);
      fetchReviews(1);
    } catch {
      setError("Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>
      <h2 className='mb-4 text-xl font-bold'>
        User Reviews {total > 0 && <span className='text-muted-foreground'>({total})</span>}
      </h2>

      {/* Review Form */}
      {session?.user ? (
        <form onSubmit={handleSubmit} className='mb-6 rounded-xs border border-border bg-card p-4'>
          <p className='mb-3 text-sm font-medium'>
            Review as <span className='text-primary'>{session.user.name ?? session.user.email}</span>
          </p>

          <div className='mb-3'>
            <label className='mb-1 block text-sm text-muted-foreground'>Rating</label>
            <div className='flex items-center gap-1'>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type='button'
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className='cursor-pointer transition-colors'
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= (hoverRating || rating)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className='mb-3'>
            <label className='mb-1 block text-sm text-muted-foreground'>Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder='Share your thoughts about this game...'
              className='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary'
            />
          </div>

          {error && <p className='mb-2 text-sm text-red-400'>{error}</p>}
          {success && <p className='mb-2 text-sm text-green-400'>{success}</p>}

          <button
            type='submit'
            disabled={submitting}
            className='rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50'
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      ) : (
        <div className='mb-6 rounded-xs border border-border bg-card p-4 text-center text-sm text-muted-foreground'>
          <a href='/login' className='text-primary hover:underline'>
            Log in
          </a>{" "}
          to leave a review.
        </div>
      )}

      {/* Review List */}
      {loading ? (
        <div className='space-y-3'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className='rounded-xs border border-border bg-card p-4'>
              <Skeleton className='mb-2 h-4 w-24' />
              <Skeleton className='mb-2 h-3 w-16' />
              <Skeleton className='h-8 w-full' />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className='text-sm text-muted-foreground'>
          No reviews yet. Be the first to review!
        </p>
      ) : (
        <div className='space-y-3'>
          {reviews.map((r) => (
            <div
              key={r._id}
              className='rounded-xs border border-border bg-card p-4'
            >
              <div className='mb-1 flex items-center justify-between'>
                <span className='text-sm font-medium'>{r.userName}</span>
                <span className='text-xs text-muted-foreground'>
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className='mb-2 flex items-center gap-1'>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < r.rating
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <p className='text-sm leading-relaxed text-muted-foreground'>
                {r.comment}
              </p>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='flex items-center justify-center gap-2 pt-2'>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className='rounded-lg border border-border p-1.5 text-muted-foreground transition hover:bg-secondary disabled:opacity-30'
              >
                <ChevronLeft className='h-4 w-4' />
              </button>
              <span className='text-sm text-muted-foreground'>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className='rounded-lg border border-border p-1.5 text-muted-foreground transition hover:bg-secondary disabled:opacity-30'
              >
                <ChevronRight className='h-4 w-4' />
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
