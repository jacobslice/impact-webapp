import { cookies } from "next/headers";

const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID!;
const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET!;

const TWITTER_AUTH_URL = "https://x.com/i/oauth2/authorize";
const TWITTER_TOKEN_URL = "https://api.x.com/2/oauth2/token";
const TWITTER_USER_URL = "https://api.x.com/2/users/me";

const COOKIE_SESSION = "twitter_session";
const COOKIE_VERIFIER = "twitter_code_verifier";

export interface TwitterUser {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  followers: number;
  following: number;
  verified: boolean;
}

function getCallbackUrl(): string {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  return `${base}/api/auth/twitter/callback`;
}

/** Generate a random string for PKCE code_verifier */
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** SHA-256 hash for PKCE code_challenge */
async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Build the Twitter OAuth 2.0 authorization URL */
export async function buildAuthUrl(): Promise<{ url: string; codeVerifier: string }> {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    response_type: "code",
    client_id: TWITTER_CLIENT_ID,
    redirect_uri: getCallbackUrl(),
    scope: "tweet.read users.read offline.access",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  return {
    url: `${TWITTER_AUTH_URL}?${params.toString()}`,
    codeVerifier,
  };
}

/** Exchange authorization code for access token */
export async function exchangeCodeForToken(code: string, codeVerifier: string): Promise<string> {
  const credentials = btoa(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`);

  const response = await fetch(TWITTER_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      code,
      grant_type: "authorization_code",
      redirect_uri: getCallbackUrl(),
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

/** Fetch the authenticated user's profile from Twitter */
export async function fetchTwitterUser(accessToken: string): Promise<TwitterUser> {
  const response = await fetch(
    `${TWITTER_USER_URL}?user.fields=profile_image_url,description,public_metrics,verified`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch user: ${error}`);
  }

  const { data } = await response.json();

  return {
    id: data.id,
    handle: data.username,
    displayName: data.name,
    avatarUrl: data.profile_image_url?.replace("_normal", "_200x200") || "",
    bio: data.description || "",
    followers: data.public_metrics?.followers_count || 0,
    following: data.public_metrics?.following_count || 0,
    verified: data.verified || false,
  };
}

/** Store the code verifier in a cookie for the callback */
export async function storeCodeVerifier(verifier: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_VERIFIER, verifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });
}

/** Retrieve and delete the code verifier cookie */
export async function getCodeVerifier(): Promise<string | null> {
  const cookieStore = await cookies();
  const verifier = cookieStore.get(COOKIE_VERIFIER)?.value || null;
  if (verifier) {
    cookieStore.delete(COOKIE_VERIFIER);
  }
  return verifier;
}

/** Store the Twitter user session in a cookie */
export async function storeSession(user: TwitterUser) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_SESSION, JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
}

/** Get the current Twitter session */
export async function getSession(): Promise<TwitterUser | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_SESSION)?.value;
  if (!session) return null;
  try {
    return JSON.parse(session);
  } catch {
    return null;
  }
}

/** Clear the Twitter session */
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_SESSION);
}
