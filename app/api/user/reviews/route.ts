import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import Review from "@/models/Review";

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

    const filter: Record<string, unknown> = { user: userId };
    if (status !== "all") {
      filter.status = status;
    }
    if (search.trim()) {
      const q = search.trim();
      filter.$or = [
        { gameName: { $regex: q, $options: "i" } },
        { comment: { $regex: q, $options: "i" } },
      ];
    }

    const [reviews, total] = await Promise.all([
      Review.find(filter).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).lean(),
      Review.countDocuments(filter),
    ]);

    const rows = reviews.map((r) => ({
      _id: r._id.toString(),
      gameId: r.gameId,
      gameName: r.gameName,
      rating: r.rating,
      comment: r.comment,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
    }));

    return NextResponse.json({ reviews: rows, total, page, pageSize });
  } catch (error) {
    console.error("User reviews error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
