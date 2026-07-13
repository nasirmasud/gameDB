import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import Review from "@/models/Review";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await connectDB();

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json({ error: "Review not found." }, { status: 404 });
    }

    if (review.user.toString() !== session.user.id) {
      return NextResponse.json({ error: "Not authorized to delete this review." }, { status: 403 });
    }

    await Review.findByIdAndDelete(id);

    return NextResponse.json({ message: "Review deleted." });
  } catch (error) {
    console.error("Delete review error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
