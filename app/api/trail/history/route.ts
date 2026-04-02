import { NextRequest, NextResponse } from "next/server";
import { getPlayerGames, getPlayerStats } from "@/lib/trail-db";

export async function GET(request: NextRequest) {
  try {
    const wallet = request.nextUrl.searchParams.get("wallet");
    const twitter = request.nextUrl.searchParams.get("twitter");

    if (!wallet && !twitter) {
      return NextResponse.json({ error: "wallet or twitter param required" }, { status: 400 });
    }

    const [games, stats] = await Promise.all([
      getPlayerGames(wallet, twitter),
      getPlayerStats(wallet, twitter),
    ]);

    return NextResponse.json({ games, stats });
  } catch (error) {
    console.error("History error:", error);
    return NextResponse.json({ error: "Failed to load history" }, { status: 500 });
  }
}
