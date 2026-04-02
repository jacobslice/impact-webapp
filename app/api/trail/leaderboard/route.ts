import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard, getDeathBoard } from "@/lib/trail-db";

export async function GET(request: NextRequest) {
  try {
    const type = request.nextUrl.searchParams.get("type") || "score";
    const limit = Math.min(parseInt(request.nextUrl.searchParams.get("limit") || "25"), 100);

    if (type === "deaths") {
      const deaths = await getDeathBoard();
      return NextResponse.json({ deaths });
    }

    const leaderboard = await getLeaderboard(limit);
    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json({ error: "Failed to load leaderboard" }, { status: 500 });
  }
}
