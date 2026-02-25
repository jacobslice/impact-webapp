import { NextRequest, NextResponse } from "next/server";

const DUNE_API_KEY = process.env.DUNE_API_KEY;
const QUERY_ID = "6576517";

// In-memory cache to avoid redundant Dune API calls (credits are limited)
const cache = new Map<string, { data: ScoreData; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export interface ScoreData {
  wallet: string;
  score: number;
  protocol_fees_paid: number;
  network_fees_paid: number;
  current_holdings: number;
  protocol_count: number;
  protocols_used: string[] | string | null;
  months_active: number;
  is_sybil: string | null;
  jup_fees_paid: number;
  jup_staker: boolean;
  jup_perps_user: boolean;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json(
      { error: "Address parameter is required" },
      { status: 400 }
    );
  }

  // Basic Solana address validation (base58, 32-44 chars)
  const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  if (!solanaAddressRegex.test(address)) {
    return NextResponse.json(
      { error: "Invalid Solana address format" },
      { status: 400 }
    );
  }

  if (!DUNE_API_KEY) {
    return NextResponse.json(
      { error: "Dune API key not configured" },
      { status: 500 }
    );
  }

  // Check cache first
  const cached = cache.get(address);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json({ data: cached.data });
  }

  try {
    const filter = `wallet = '${address}'`;
    const url = `https://api.dune.com/api/v1/query/${QUERY_ID}/results?filters=${encodeURIComponent(filter)}&limit=1`;

    const response = await fetch(url, {
      headers: {
        "X-Dune-API-Key": DUNE_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Dune API error:", errorText);
      return NextResponse.json(
        { error: "Failed to fetch score from Dune" },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.result?.rows || data.result.rows.length === 0) {
      return NextResponse.json(
        { error: "Address not scored yet", notFound: true },
        { status: 404 }
      );
    }

    const scoreData: ScoreData = data.result.rows[0];

    // Cache the result
    cache.set(address, { data: scoreData, timestamp: Date.now() });

    return NextResponse.json({ data: scoreData });
  } catch (error) {
    console.error("Error fetching score:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
