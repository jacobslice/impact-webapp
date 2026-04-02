import { NextRequest, NextResponse } from "next/server";
import { saveGame } from "@/lib/trail-db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Basic validation
    if (!body.player_name || !body.profession || typeof body.final_score !== "number") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (body.final_score > 10000 || body.final_score < 0) {
      return NextResponse.json({ error: "Invalid score" }, { status: 400 });
    }

    const gameId = await saveGame({
      wallet: body.wallet || null,
      twitter_handle: body.twitter_handle || null,
      player_name: body.player_name,
      profession: body.profession,
      multiplier: body.multiplier || 1,
      game_score: body.game_score || 0,
      final_score: body.final_score,
      solana_score: body.solana_score ?? null,
      hunt_score: body.hunt_score || 0,
      survivors: body.survivors || 0,
      party_size: body.party_size || 3,
      events_log: body.events_log || [],
      party_data: body.party_data || [],
    });

    return NextResponse.json({ id: gameId });
  } catch (error) {
    console.error("Failed to save game:", error);
    return NextResponse.json({ error: "Failed to save game" }, { status: 500 });
  }
}
