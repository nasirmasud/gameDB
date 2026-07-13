"use client";

import { CustomGameForm } from "./CustomGameForm";

interface GameData {
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

interface Props {
  game: GameData;
  onClose: () => void;
  onSaved: () => void;
}

export function EditCustomGameModal({ game, onClose, onSaved }: Props) {
  return (
    <CustomGameForm
      gameId={game._id}
      initial={{
        title: game.title,
        shortDescription: game.shortDescription,
        fullDescription: game.fullDescription,
        releaseDate: game.releaseDate.split("T")[0],
        genre: game.genre,
        developer: game.developer ?? "",
        publisher: game.publisher ?? "",
        platforms: game.platforms ?? [],
        screenshots: game.screenshots ?? [],
        tags: game.tags ?? [],
        imageUrl: game.imageUrl ?? "",
      }}
      onClose={onClose}
      onSuccess={onSaved}
    />
  );
}
