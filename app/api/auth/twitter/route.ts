import { NextResponse } from "next/server";
import { buildAuthUrl, storeCodeVerifier } from "@/lib/twitter-auth";

export async function GET() {
  try {
    const { url, codeVerifier } = await buildAuthUrl();
    await storeCodeVerifier(codeVerifier);
    return NextResponse.redirect(url);
  } catch (error) {
    console.error("Twitter auth error:", error);
    return NextResponse.redirect(
      new URL("/dashboard?error=twitter_auth_failed", process.env.NEXTAUTH_URL || "http://localhost:3000")
    );
  }
}
