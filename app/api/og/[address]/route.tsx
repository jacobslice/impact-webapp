import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

function getTierName(score: number): string {
  if (score >= 80) return "Diamond";
  if (score >= 60) return "Platinum";
  if (score >= 40) return "Gold";
  if (score >= 20) return "Silver";
  return "Bronze";
}

function getTierIcon(score: number): string {
  if (score >= 80) return "💎";
  if (score >= 60) return "✦";
  if (score >= 40) return "🥇";
  if (score >= 20) return "🥈";
  return "🥉";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;
  const searchParams = request.nextUrl.searchParams;
  const score = Number(searchParams.get("score") || "87");
  const tier = searchParams.get("tier") || getTierName(score);
  const tierIcon = getTierIcon(score);
  const percentile = searchParams.get("percentile") || "4";

  const truncatedAddress =
    address.length > 12
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : address;

  // Score arc calculation for the ring
  const circumference = 2 * Math.PI * 70;
  const filledLength = (score / 100) * circumference;
  const dashOffset = circumference - filledLength;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0c0b14 0%, #1a0f2e 50%, #0c0b14 100%)",
          fontFamily: "Inter, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow effects */}
        <div
          style={{
            position: "absolute",
            top: -100,
            left: "30%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(153,69,255,0.15) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -100,
            right: "20%",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(20,241,149,0.1) 0%, transparent 70%)",
          }}
        />

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, #9945FF, #14F195)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 900,
              fontSize: 18,
            }}
          >
            S
          </div>
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              background: "linear-gradient(90deg, #9945FF, #00D1FF)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Solana Score
          </span>
          <span style={{ fontSize: 14, color: "rgba(240,238,246,0.35)", marginLeft: 4 }}>
            by Slice Analytics
          </span>
        </div>

        {/* Score ring */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
            marginBottom: 30,
          }}
        >
          <svg width="200" height="200" viewBox="0 0 200 200">
            {/* Track */}
            <circle
              cx="100"
              cy="100"
              r="70"
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="10"
            />
            {/* Filled arc */}
            <circle
              cx="100"
              cy="100"
              r="70"
              fill="none"
              stroke="url(#ogGrad)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${filledLength} ${circumference}`}
              strokeDashoffset={circumference * 0.25}
              transform="rotate(-90 100 100)"
            />
            <defs>
              <linearGradient id="ogGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9945FF" />
                <stop offset="50%" stopColor="#14F195" />
                <stop offset="100%" stopColor="#00D1FF" />
              </linearGradient>
            </defs>
          </svg>
          {/* Score number centered in ring */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: 56,
                fontWeight: 900,
                color: "#fff",
                lineHeight: 1,
              }}
            >
              {Math.round(score)}
            </span>
            <span style={{ fontSize: 14, color: "rgba(240,238,246,0.4)" }}>
              / 100
            </span>
          </div>
        </div>

        {/* Tier + Percentile */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "linear-gradient(135deg, rgba(153,69,255,0.15), rgba(20,241,149,0.1))",
              border: "1px solid rgba(153,69,255,0.2)",
              borderRadius: 20,
              padding: "6px 16px",
              fontSize: 14,
              fontWeight: 700,
              color: "#14F195",
            }}
          >
            {tierIcon} {tier}
          </div>
          <span style={{ fontSize: 14, color: "rgba(240,238,246,0.55)" }}>
            Top {percentile}%
          </span>
        </div>

        {/* Address */}
        <div
          style={{
            fontSize: 16,
            fontFamily: "monospace",
            color: "rgba(240,238,246,0.45)",
            background: "rgba(255,255,255,0.04)",
            padding: "8px 20px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {truncatedAddress}
        </div>

        {/* Footer branding */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            color: "rgba(240,238,246,0.25)",
          }}
        >
          solana-score.xyz
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
