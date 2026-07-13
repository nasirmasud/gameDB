"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface WishlistButtonProps {
  gameId: number;
  gameName: string;
  gameImage?: string;
  gameRating?: number;
}

export function WishlistButton({ gameId, gameName, gameImage, gameRating }: WishlistButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) {
      setChecking(false);
      return;
    }
    fetch(`/api/user/favorites?gameId=${gameId}`)
      .then((res) => res.json())
      .then((data) => {
        setIsFavorited(data.isFavorited ?? false);
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [gameId, session]);

  async function handleToggle() {
    if (!session?.user?.id) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      if (isFavorited) {
        const res = await fetch(`/api/user/favorites?gameId=${gameId}`, { method: "DELETE" });
        if (!res.ok) throw new Error();
        setIsFavorited(false);
        toast.success("Removed from wishlist");
      } else {
        const res = await fetch("/api/user/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameId, gameName, gameImage, gameRating }),
        });
        if (!res.ok) throw new Error();
        setIsFavorited(true);
        toast.success("Added to wishlist");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (checking) return null;

  return (
    <Button
      variant={isFavorited ? "default" : "outline"}
      onClick={handleToggle}
      disabled={loading}
      className='w-full flex items-center justify-center gap-2 cursor-pointer'
      size='lg'
    >
      <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
      {isFavorited ? "In Wishlist" : "Add to Wishlist"}
    </Button>
  );
}
