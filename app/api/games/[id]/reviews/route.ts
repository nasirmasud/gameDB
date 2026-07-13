import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import Review from "@/models/Review";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const gameId = parseInt(id, 10);
  if (isNaN(gameId)) {
    return NextResponse.json({ error: "Invalid game ID" }, { status: 400 });
  }

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") ?? "10", 10)));

    const filter = { gameId, status: "approved" };

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      Review.countDocuments(filter),
    ]);

    const rows = reviews.map((r) => ({
      _id: r._id.toString(),
      userName: r.userName,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
    }));

    return NextResponse.json({ reviews: rows, total, page, pageSize });
  } catch (error) {
    console.error("Game reviews error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const gameId = parseInt(id, 10);
  if (isNaN(gameId)) {
    return NextResponse.json({ error: "Invalid game ID" }, { status: 400 });
  }

  try {
    await connectDB();

    const body = await req.json();
    const { rating, comment, gameName, gameImage } = body;

    if (!rating || !comment?.trim()) {
      return NextResponse.json({ error: "Rating and comment are required." }, { status: 400 });
    }

    const numRating = parseInt(rating, 10);
    if (numRating < 1 || numRating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
    }

    if (comment.length > 1000) {
      return NextResponse.json({ error: "Comment must be 1000 characters or less." }, { status: 400 });
    }

    const existing = await Review.findOne({ gameId, user: session.user.id });
    if (existing) {
      return NextResponse.json({ error: "You have already reviewed this game." }, { status: 409 });
    }

    const review = await Review.create({
      gameId,
      gameName: gameName ?? "Unknown Game",
      gameImage: gameImage ?? null,
      user: session.user.id,
      userName: session.user.name ?? "Anonymous",
      rating: numRating,
      comment: comment.trim(),
      status: "approved",
    });

    return NextResponse.json({
      _id: review._id.toString(),
      userName: review.userName,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
