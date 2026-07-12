"use client";

import { useState } from "react";

interface GameImageProps {
  src: string | null;
  alt: string;
}

export function GameImage({ src, alt }: GameImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span className="flex h-full w-full items-center justify-center text-lg">
        🎮
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}
