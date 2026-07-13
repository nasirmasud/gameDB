import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import CustomGame from "@/models/CustomGame";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const body = await req.json();
    console.log("CREATE body:", JSON.stringify(body, null, 2));

    const { title, shortDescription, fullDescription, releaseDate, genre, developer, publisher, platforms, screenshots, tags, imageUrl } = body;

    if (!title?.trim() || !shortDescription?.trim() || !fullDescription?.trim() || !releaseDate || !genre?.trim()) {
      return NextResponse.json({ error: "Title, short description, full description, release date, and genre are required." }, { status: 400 });
    }

    if (title.length > 100) {
      return NextResponse.json({ error: "Title must be 100 characters or less." }, { status: 400 });
    }
    if (shortDescription.length > 200) {
      return NextResponse.json({ error: "Short description must be 200 characters or less." }, { status: 400 });
    }
    if (fullDescription.length > 3000) {
      return NextResponse.json({ error: "Full description must be 3000 characters or less." }, { status: 400 });
    }

    const game = await CustomGame.create({
      title: title.trim(),
      shortDescription: shortDescription.trim(),
      fullDescription: fullDescription.trim(),
      releaseDate: new Date(releaseDate),
      genre: genre.trim(),
      developer: developer?.trim() || null,
      publisher: publisher?.trim() || null,
      platforms: Array.isArray(platforms) ? platforms.filter(Boolean) : [],
      screenshots: Array.isArray(screenshots) ? screenshots.filter(Boolean) : [],
      tags: Array.isArray(tags) ? tags.filter(Boolean) : [],
      imageUrl: imageUrl?.trim() || null,
      submittedBy: session.user.id,
      status: "pending",
    });

    return NextResponse.json({
      _id: game._id.toString(),
      title: game.title,
      shortDescription: game.shortDescription,
      genre: game.genre,
      platforms: game.platforms ?? [],
      screenshots: game.screenshots ?? [],
      tags: game.tags ?? [],
      status: game.status,
      createdAt: game.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Create custom game error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

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
    const status = searchParams.get("status") ?? "all";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") ?? "20", 10)));

    const filter: Record<string, unknown> = { submittedBy: userId };
    if (status !== "all") {
      filter.status = status;
    }
    if (search.trim()) {
      filter.title = { $regex: search.trim(), $options: "i" };
    }

    const [games, total] = await Promise.all([
      CustomGame.find(filter).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).lean(),
      CustomGame.countDocuments(filter),
    ]);

    const rows = games.map((g) => ({
      _id: g._id.toString(),
      title: g.title,
      shortDescription: g.shortDescription,
      genre: g.genre,
      status: g.status,
      createdAt: g.createdAt.toISOString(),
    }));

    return NextResponse.json({ games: rows, total, page, pageSize });
  } catch (error) {
    console.error("User custom games error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
