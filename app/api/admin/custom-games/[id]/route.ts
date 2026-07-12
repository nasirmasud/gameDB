import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import CustomGame from "@/models/CustomGame";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await connectDB();

    const { status } = await req.json();

    if (!["published", "draft", "pending", "archived"].includes(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const game = await CustomGame.findByIdAndUpdate(id, { status }, { new: true });

    if (!game) {
      return NextResponse.json({ error: "Custom game not found." }, { status: 404 });
    }

    return NextResponse.json({ message: `Custom game ${status}.`, game });
  } catch (error) {
    console.error("Admin update custom game error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await connectDB();

    const game = await CustomGame.findByIdAndDelete(id);

    if (!game) {
      return NextResponse.json({ error: "Custom game not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Custom game deleted." });
  } catch (error) {
    console.error("Admin delete custom game error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
