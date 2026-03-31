import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

function getTierName(score: number): string {
  if (score >= 95) return "Whale";
  if (score >= 90) return "Power User";
  if (score >= 80) return "Active User";
  if (score >= 60) return "Average User";
  if (score >= 40) return "Likely Human";
  if (score >= 20) return "Potential Sybil";
  return "Sybil";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  let score: number | null = null;
  let tier = "";

  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/score?address=${address}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (data.score != null) {
        score = Math.round(data.score);
        tier = getTierName(score);
      }
    }
  } catch {
    // fall through to no-score state
  }

  const truncatedAddress =
    address.length > 12
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : address;

  const green = "#33ff33";
  const dimGreen = "rgba(51,255,51,0.4)";
  const bg = "#001a00";

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
          background: bg,
          fontFamily: "monospace",
          position: "relative",
          overflow: "hidden",
          color: green,
        }}
      >
        {/* Scanline overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 2px, transparent 2px, transparent 4px)",
            zIndex: 2,
            pointerEvents: "none",
            display: "flex",
          }}
        />

        {/* CRT vignette */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)",
            zIndex: 1,
            display: "flex",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3,
            gap: 0,
          }}
        >
          {/* Title */}
          <div
            style={{
              fontSize: 64,
              fontWeight: 900,
              letterSpacing: 12,
              marginBottom: 8,
              textShadow: `0 0 20px ${green}, 0 0 40px rgba(51,255,51,0.3)`,
              display: "flex",
            }}
          >
            SOLANA TRAIL
          </div>

          {/* Divider */}
          <div
            style={{
              width: 600,
              height: 2,
              background: dimGreen,
              marginBottom: 40,
              display: "flex",
            }}
          />

          {score !== null ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {/* Score label */}
              <div
                style={{
                  fontSize: 24,
                  color: dimGreen,
                  letterSpacing: 6,
                  marginBottom: 8,
                  display: "flex",
                }}
              >
                SCORE
              </div>

              {/* Score number */}
              <div
                style={{
                  fontSize: 120,
                  fontWeight: 900,
                  lineHeight: 1,
                  textShadow: `0 0 30px ${green}, 0 0 60px rgba(51,255,51,0.4)`,
                  marginBottom: 16,
                  display: "flex",
                }}
              >
                {score}
              </div>

              {/* Tier */}
              <div
                style={{
                  fontSize: 28,
                  letterSpacing: 4,
                  color: dimGreen,
                  border: `1px solid ${dimGreen}`,
                  padding: "8px 32px",
                  display: "flex",
                }}
              >
                {tier.toUpperCase()}
              </div>

              {/* Address */}
              <div
                style={{
                  fontSize: 16,
                  color: "rgba(51,255,51,0.3)",
                  marginTop: 24,
                  display: "flex",
                }}
              >
                {truncatedAddress}
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {/* Unknown score */}
              <div
                style={{
                  fontSize: 72,
                  fontWeight: 900,
                  textShadow: `0 0 30px ${green}`,
                  marginBottom: 24,
                  display: "flex",
                }}
              >
                SCORE: ???
              </div>

              <div
                style={{
                  fontSize: 24,
                  color: dimGreen,
                  letterSpacing: 2,
                  display: "flex",
                }}
              >
                Play Solana Trail to find out
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            fontSize: 14,
            color: "rgba(51,255,51,0.25)",
            letterSpacing: 4,
            display: "flex",
            zIndex: 3,
          }}
        >
          POWERED BY SLICE ANALYTICS
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
