import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getCodeVerifier,
  exchangeCodeForToken,
  fetchTwitterUser,
  storeSession,
} from "@/lib/twitter-auth";

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  try {
    const code = request.nextUrl.searchParams.get("code");
    const error = request.nextUrl.searchParams.get("error");

    // Read returnTo cookie
    const cookieStore = await cookies();
    const returnTo = cookieStore.get("twitter_return_to")?.value || "/dashboard";
    cookieStore.delete("twitter_return_to");

    if (error || !code) {
      return NextResponse.redirect(
        new URL(`${returnTo}?error=${error || "no_code"}`, baseUrl)
      );
    }

    const codeVerifier = await getCodeVerifier();
    if (!codeVerifier) {
      return NextResponse.redirect(
        new URL(`${returnTo}?error=missing_verifier`, baseUrl)
      );
    }

    const accessToken = await exchangeCodeForToken(code, codeVerifier, request.url);
    const user = await fetchTwitterUser(accessToken);
    await storeSession(user);

    return NextResponse.redirect(new URL(`${returnTo}?twitter=connected`, baseUrl));
  } catch (error) {
    console.error("Twitter callback error:", error);
    return NextResponse.redirect(
      new URL("/dashboard?error=twitter_callback_failed", baseUrl)
    );
  }
}
