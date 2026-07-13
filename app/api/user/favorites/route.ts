import { revalidatePath } from "next/cache";
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

    const gameIdParam = searchParams.get("gameId");

    if (gameIdParam) {
      const gameId = parseInt(gameIdParam, 10);
      const existing = await Favorite.findOne({ gameId, user: userId }).lean();
      return NextResponse.json({ isFavorited: !!existing, favorite: existing ?? null });
    }

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

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const { gameId, gameName, gameImage, gameRating } = await req.json();

    if (!gameId || !gameName) {
      return NextResponse.json({ error: "gameId and gameName are required." }, { status: 400 });
    }

    const existing = await Favorite.findOne({ gameId, user: session.user.id });
    if (existing) {
      return NextResponse.json({ message: "Already in wishlist.", favorite: existing });
    }

    const favorite = await Favorite.create({
      gameId,
      gameName,
      gameImage: gameImage ?? undefined,
      gameRating: gameRating ?? undefined,
      user: session.user.id,
    });

    revalidatePath("/user/dashboard", "layout");

    return NextResponse.json({
      favorite: {
        _id: favorite._id.toString(),
        gameId: favorite.gameId,
        gameName: favorite.gameName,
        gameImage: favorite.gameImage ?? null,
        gameRating: favorite.gameRating ?? null,
        createdAt: favorite.createdAt.toISOString(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Add favorite error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get("gameId");

    if (!gameId) {
      return NextResponse.json({ error: "gameId query param is required." }, { status: 400 });
    }

    const deleted = await Favorite.findOneAndDelete({ gameId: parseInt(gameId, 10), user: session.user.id });

    revalidatePath("/user/dashboard", "layout");

    if (!deleted) {
      return NextResponse.json({ error: "Favorite not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Removed from wishlist." });
  } catch (error) {
    console.error("Delete favorite error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
