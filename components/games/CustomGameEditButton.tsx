"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { EditCustomGameModal } from "@/components/dashboard/EditCustomGameModal";

export interface GameData {
  _id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  releaseDate: string;
  genre: string;
  developer: string | null;
  publisher: string | null;
  platforms?: string[];
  screenshots?: string[];
  tags?: string[];
  imageUrl: string | null;
}

export function CustomGameEditButton({ game }: { game: GameData }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        <Pencil className="h-4 w-4" /> Edit
      </button>
      {open && (
        <EditCustomGameModal
          game={game}
          onClose={() => setOpen(false)}
          onSaved={() => {
            setOpen(false);
            window.location.reload();
          }}
        />
      )}
    </>
  );
}
