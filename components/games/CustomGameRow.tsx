import { connectDB } from "@/lib/mongodb";
import CustomGame from "@/models/CustomGame";
import { CustomGamesClient } from "./CustomGamesClient";

export async function CustomGameRow() {
  await connectDB();

  const games = await CustomGame.find({ status: "published" })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  const rows = games.map((g) => ({
    _id: g._id.toString(),
    title: g.title,
    shortDescription: g.shortDescription,
    genre: g.genre,
    developer: g.developer ?? null,
    publisher: g.publisher ?? null,
    platforms: g.platforms ?? [],
    imageUrl: g.imageUrl ?? null,
    releaseDate: g.releaseDate.toISOString(),
  }));

  if (rows.length === 0) return null;

  return <CustomGamesClient games={rows} />;
}
