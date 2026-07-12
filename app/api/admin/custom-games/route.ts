import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import CustomGame from "@/models/CustomGame";
import User from "@/models/User";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const games = await CustomGame.find()
      .populate("submittedBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ games });
  } catch (error) {
    console.error("Admin custom games error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
