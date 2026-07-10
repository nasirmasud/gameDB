// app/api/games/route.ts
import { getGames } from "@/lib/rawg";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await getGames({ page_size: 5 });
  return NextResponse.json(data);
}
