import { NextRequest, NextResponse } from "next/server";
import { buildAuthUrl, storeCodeVerifier } from "@/lib/twitter-auth";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    // Store returnTo so we can redirect back after auth
    const returnTo = request.nextUrl.searchParams.get("returnTo");
    if (returnTo) {
      const cookieStore = await cookies();
      cookieStore.set("twitter_return_to", returnTo, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 600,
        path: "/",
      });
    }

    const { url, codeVerifier } = await buildAuthUrl(request.url);
    await storeCodeVerifier(codeVerifier);
    return NextResponse.redirect(url);
  } catch (error) {
    console.error("Twitter auth error:", error);
    return NextResponse.redirect(
      new URL("/dashboard?error=twitter_auth_failed", process.env.NEXTAUTH_URL || "http://localhost:3000")
    );
  }
}
