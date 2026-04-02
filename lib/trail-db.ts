import { sql } from "@vercel/postgres";

// ============================================================
// TYPES
// ============================================================
export interface GameResult {
  id: number;
  wallet: string | null;
  twitter_handle: string | null;
  player_name: string;
  profession: string;
  multiplier: number;
  game_score: number;
  final_score: number;
  solana_score: number | null;
  hunt_score: number;
  survivors: number;
  party_size: number;
  events_log: string[];
  created_at: string;
}

export interface SaveGameInput {
  wallet: string | null;
  twitter_handle: string | null;
  player_name: string;
  profession: string;
  multiplier: number;
  game_score: number;
  final_score: number;
  solana_score: number | null;
  hunt_score: number;
  survivors: number;
  party_size: number;
  events_log: string[];
  party_data: { handle: string; alive: boolean; isKOL: boolean }[];
}

export interface PlayerStats {
  games_played: number;
  best_score: number;
  avg_score: number;
  total_kols_killed: number;
  favorite_profession: string | null;
}

export interface LeaderboardEntry {
  id: number;
  player_name: string;
  twitter_handle: string | null;
  wallet: string | null;
  profession: string;
  final_score: number;
  solana_score: number | null;
  survivors: number;
  party_size: number;
  created_at: string;
}

export interface KOLDeathEntry {
  kol_handle: string;
  death_count: number;
  top_death: string;
}

// ============================================================
// SAVE GAME
// ============================================================
export async function saveGame(input: SaveGameInput): Promise<number> {
  // Insert game
  const result = await sql`
    INSERT INTO trail_games (
      wallet, twitter_handle, player_name, profession, multiplier,
      game_score, final_score, solana_score, hunt_score,
      survivors, party_size, events_log
    ) VALUES (
      ${input.wallet}, ${input.twitter_handle}, ${input.player_name},
      ${input.profession}, ${input.multiplier}, ${input.game_score},
      ${input.final_score}, ${input.solana_score}, ${input.hunt_score},
      ${input.survivors}, ${input.party_size}, ${JSON.stringify(input.events_log)}
    ) RETURNING id
  `;
  const gameId = result.rows[0].id;

  // Extract and insert KOL deaths
  const deadKols = input.party_data.filter(m => !m.alive && m.isKOL);
  for (const kol of deadKols) {
    // Find death message from events log
    const deathEvent = input.events_log.find(e =>
      e.includes(`@${kol.handle}`) &&
      (e.includes("died") || e.includes("Died") || e.includes("DEAD") ||
       e.includes("killed") || e.startsWith(`@${kol.handle}`))
    ) || `@${kol.handle} perished on the trail.`;

    await sql`
      INSERT INTO trail_kol_deaths (game_id, kol_handle, death_message)
      VALUES (${gameId}, ${kol.handle}, ${deathEvent})
    `;
  }

  return gameId;
}

// ============================================================
// LEADERBOARD
// ============================================================
export async function getLeaderboard(limit = 25): Promise<LeaderboardEntry[]> {
  const result = await sql`
    SELECT id, player_name, twitter_handle, wallet, profession,
           final_score, solana_score, survivors, party_size, created_at
    FROM trail_games
    ORDER BY final_score DESC
    LIMIT ${limit}
  `;
  return result.rows as LeaderboardEntry[];
}

// ============================================================
// KOL DEATH BOARD
// ============================================================
export async function getDeathBoard(): Promise<KOLDeathEntry[]> {
  const result = await sql`
    SELECT
      kol_handle,
      COUNT(*)::int as death_count,
      (
        SELECT d2.death_message
        FROM trail_kol_deaths d2
        WHERE d2.kol_handle = d.kol_handle
        GROUP BY d2.death_message
        ORDER BY COUNT(*) DESC
        LIMIT 1
      ) as top_death
    FROM trail_kol_deaths d
    GROUP BY kol_handle
    ORDER BY death_count DESC
  `;
  return result.rows as KOLDeathEntry[];
}

// ============================================================
// PLAYER HISTORY
// ============================================================
export async function getPlayerGames(
  wallet?: string | null,
  twitterHandle?: string | null,
  limit = 50
): Promise<GameResult[]> {
  if (wallet) {
    const result = await sql`
      SELECT * FROM trail_games
      WHERE wallet = ${wallet}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return result.rows as GameResult[];
  }
  if (twitterHandle) {
    const result = await sql`
      SELECT * FROM trail_games
      WHERE twitter_handle = ${twitterHandle}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return result.rows as GameResult[];
  }
  return [];
}

// ============================================================
// PLAYER STATS
// ============================================================
export async function getPlayerStats(
  wallet?: string | null,
  twitterHandle?: string | null
): Promise<PlayerStats> {
  const empty: PlayerStats = { games_played: 0, best_score: 0, avg_score: 0, total_kols_killed: 0, favorite_profession: null };

  const whereClause = wallet
    ? sql`wallet = ${wallet}`
    : twitterHandle
    ? sql`twitter_handle = ${twitterHandle}`
    : null;

  if (!whereClause) return empty;

  // Game stats
  const stats = wallet
    ? await sql`
        SELECT COUNT(*)::int as games_played,
               COALESCE(MAX(final_score), 0)::int as best_score,
               COALESCE(AVG(final_score), 0)::int as avg_score
        FROM trail_games WHERE wallet = ${wallet}
      `
    : await sql`
        SELECT COUNT(*)::int as games_played,
               COALESCE(MAX(final_score), 0)::int as best_score,
               COALESCE(AVG(final_score), 0)::int as avg_score
        FROM trail_games WHERE twitter_handle = ${twitterHandle}
      `;

  // Favorite profession
  const prof = wallet
    ? await sql`
        SELECT profession FROM trail_games
        WHERE wallet = ${wallet}
        GROUP BY profession ORDER BY COUNT(*) DESC LIMIT 1
      `
    : await sql`
        SELECT profession FROM trail_games
        WHERE twitter_handle = ${twitterHandle}
        GROUP BY profession ORDER BY COUNT(*) DESC LIMIT 1
      `;

  // KOLs killed
  const kills = wallet
    ? await sql`
        SELECT COUNT(*)::int as total
        FROM trail_kol_deaths d
        JOIN trail_games g ON d.game_id = g.id
        WHERE g.wallet = ${wallet}
      `
    : await sql`
        SELECT COUNT(*)::int as total
        FROM trail_kol_deaths d
        JOIN trail_games g ON d.game_id = g.id
        WHERE g.twitter_handle = ${twitterHandle}
      `;

  return {
    games_played: stats.rows[0]?.games_played || 0,
    best_score: stats.rows[0]?.best_score || 0,
    avg_score: stats.rows[0]?.avg_score || 0,
    total_kols_killed: kills.rows[0]?.total || 0,
    favorite_profession: prof.rows[0]?.profession || null,
  };
}
