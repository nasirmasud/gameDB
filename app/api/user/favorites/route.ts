import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import Favorite from "@/models/Favorite";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") ?? "20", 10)));

    const filter: Record<string, unknown> = { user: userId };
    if (search.trim()) {
      filter.gameName = { $regex: search.trim(), $options: "i" };
    }

    const [favorites, total] = await Promise.all([
      Favorite.find(filter).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).lean(),
      Favorite.countDocuments(filter),
    ]);

    const rows = favorites.map((f) => ({
      _id: f._id.toString(),
      gameId: f.gameId,
      gameName: f.gameName,
      gameImage: f.gameImage ?? null,
      gameRating: f.gameRating ?? null,
      createdAt: f.createdAt.toISOString(),
    }));

    return NextResponse.json({ favorites: rows, total, page, pageSize });
  } catch (error) {
    console.error("User favorites error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
