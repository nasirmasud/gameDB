import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import CustomGame from "@/models/CustomGame";

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

    const game = await CustomGame.findById(id);
    if (!game) {
      return NextResponse.json({ error: "Custom game not found." }, { status: 404 });
    }

    const isAdmin = session.user.role === "admin";
    const isOwner = game.submittedBy.toString() === session.user.id;
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Not authorized to delete this game." }, { status: 403 });
    }

    await CustomGame.findByIdAndDelete(id);

    revalidatePath("/user/dashboard", "layout");

    return NextResponse.json({ message: "Custom game deleted." });
  } catch (error) {
    console.error("Delete custom game error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await connectDB();

    const game = await CustomGame.findById(id);
    if (!game) {
      return NextResponse.json({ error: "Custom game not found." }, { status: 404 });
    }

    const isAdmin = session.user.role === "admin";
    const isOwner = game.submittedBy.toString() === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Not authorized to edit this game." }, { status: 403 });
    }

    const body = await req.json();
    console.log("PATCH body:", JSON.stringify(body, null, 2));

    const update: Record<string, unknown> = {
      title: body.title?.trim(),
      shortDescription: body.shortDescription?.trim(),
      fullDescription: body.fullDescription?.trim(),
      releaseDate: body.releaseDate ? new Date(body.releaseDate) : undefined,
      genre: body.genre?.trim(),
      developer: body.developer?.trim() || null,
      publisher: body.publisher?.trim() || null,
      imageUrl: body.imageUrl?.trim() || null,
      platforms: Array.isArray(body.platforms) ? body.platforms.filter(Boolean) : [],
      screenshots: Array.isArray(body.screenshots) ? body.screenshots.filter(Boolean) : [],
      tags: Array.isArray(body.tags) ? body.tags.filter(Boolean) : [],
    };

    Object.keys(update).forEach((k) => {
      if (update[k] === undefined) delete update[k];
    });

    const updated = await CustomGame.findByIdAndUpdate(id, update, { new: true, runValidators: true }).lean();

    revalidatePath("/user/dashboard", "layout");

    return NextResponse.json({
      _id: updated._id.toString(),
      title: updated.title,
      shortDescription: updated.shortDescription,
      fullDescription: updated.fullDescription,
      releaseDate: updated.releaseDate.toISOString(),
      genre: updated.genre,
      developer: updated.developer ?? null,
      publisher: updated.publisher ?? null,
      platforms: updated.platforms ?? [],
      screenshots: updated.screenshots ?? [],
      tags: updated.tags ?? [],
      imageUrl: updated.imageUrl ?? null,
      status: updated.status,
    });
  } catch (error) {
    console.error("Update custom game error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
