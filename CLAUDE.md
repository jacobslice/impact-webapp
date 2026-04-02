# Solana Score by Slice Analytics

## Git Workflow — CHECK-IN / CHECK-OUT RULE
**CRITICAL: Always follow this on EVERY session start and end.**

### Starting a session (CHECK-OUT):
1. Run `git pull` FIRST before doing anything else
2. Run `pnpm install` if dependencies changed
3. Read this CLAUDE.md to get up to speed on current state

### Ending a session (CHECK-IN):
1. Stage and commit all changes with a descriptive message
2. Run `git push` so the remote is always current
3. Update the "Current State" section below if significant changes were made

**Never start coding without pulling. Never end a session without pushing.**

---

## Project Overview
Wallet scoring platform for Solana. Users look up or connect their wallet to see a reputation score (0-100) measuring cross-protocol activity. Two audiences: users (flex scores, earn rewards) and protocols (sybil removal, user insights, acquisition).

**Solana Trail** (`/trail`) is a self-contained Oregon Trail parody game that markets Solana Score. It's the primary marketing vehicle — may eventually replace the homepage.

## Tech Stack
- Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- @solana/wallet-adapter (Phantom, Solflare) for wallet connection
- @vercel/og (Satori) for scorecard PNG generation
- @vercel/postgres (Neon) for trail game persistence
- Dune Analytics API (Query ID: 6576517) for score data
- Framer Motion for trail game animations
- Web Audio API for 8-bit sound effects (`lib/trail-audio.ts`)
- pnpm, hosted on Vercel
- Dark-only theme (no light mode)

## Environment Variables (.env.local)
```
DUNE_API_KEY=...
TWITTER_CLIENT_ID=...
TWITTER_CLIENT_SECRET=...
NEXTAUTH_URL=http://localhost:3000  # Set to https://impact-webapp.vercel.app on Vercel
POSTGRES_URL=postgresql://...       # Neon serverless Postgres
NOTION_TOKEN=...
```

---

## Main Site (Solana Score)

### Routes
| Route | Description |
|-------|-------------|
| `/` | Home — search bar + leaderboard |
| `/score/[address]` | Simplified view — score, blurred breakdown, protocols |
| `/dashboard` | Full dashboard — connected wallet, stats, breakdown, protocols |
| `/leaderboard` | Full leaderboard with tier descriptions + score distribution |
| `/for-protocols` | B2B page — case study, value props, API waitlist |
| `/api/score` | Dune API proxy with 10-min in-memory cache |
| `/api/og/[address]` | OG scorecard image (Vercel OG/Satori) |

### Design System
- Colors: #0c0b14 (bg), #9945FF (purple), #14F195 (green), #00D1FF (cyan)
- Font: Inter (weights 300-900)
- Glass cards: rgba(255,255,255,0.035) with backdrop-filter blur(12px)
- 7-tier scoring: Whale (95+), Power User (90+), Active (80+), Average (60+), Likely Human (40+), Potential Sybil (20+), Sybil (0+)
- Score breakdown: Volume (40%), Protocol Diversity (30%), Activity (20%), Holdings (10%)
- Sector scores: DEX/Spot, Launchpad, Aggregator, Perpetuals, Trading Tools

---

## Solana Trail Game (`/trail/*`)

### Overview
Oregon Trail x Crypto. Under 2 minutes, CRT green terminal aesthetic, real crypto KOL deaths, Duck Hunt mini-game, dramatic Solana Score reveal at end. Self-contained site with its own layout, nav, dashboard, and leaderboard.

### Architecture
- **State machine**: `useReducer` in `app/trail/page.tsx` (~1600 lines)
- **Game phases** (linear): boot → title → connect → loading → profession → party → sbf → travel → event → landmark → hunt → score_tombstones → score_tally → score_glitch → score_reveal
- **Fixed trail sequence**: event1 → landmark → event2 → hunt (no looping)
- **Database**: Neon Postgres via `@vercel/postgres` — two tables: `trail_games` + `trail_kol_deaths`
- **Layout**: `app/trail/layout.tsx` uses CSS to hide main site sidebar/topbar/footer

### Trail Routes
| Route | Description |
|-------|-------------|
| `/trail` | The game itself |
| `/trail/dashboard` | Player dashboard — Solana Score, stats, game history |
| `/trail/leaderboard` | High scores + KOL death board |
| `/api/trail/save` | POST — save game result + extract KOL deaths |
| `/api/trail/leaderboard` | GET — top scores + death rankings |
| `/api/trail/history` | GET — player game history + stats |

### Trail Files
| File | Purpose |
|------|---------|
| `app/trail/page.tsx` | Main game — reducer, all phase renderers, hunt mini-game |
| `app/trail/layout.tsx` | Full-screen CRT layout, hides main site nav |
| `app/trail/dashboard/page.tsx` | CRT-themed player dashboard with full Solana Score data |
| `app/trail/leaderboard/page.tsx` | Two tabs: High Scores + KOL Death Board |
| `lib/trail-data.ts` | Game data: professions, KOLs, landmarks, events, death messages |
| `lib/trail-audio.ts` | Web Audio 8-bit SFX (12 effects + theme melody) |
| `lib/trail-db.ts` | Postgres helpers: saveGame, getLeaderboard, getDeathBoard, getPlayerGames, getPlayerStats |
| `components/trail/CRTWrapper.tsx` | CRT frame: scanlines, vignette, flicker, wallet button |
| `components/trail/TrailNav.tsx` | CRT nav bar: Play / Dashboard / Leaderboard |
| `components/trail/PixelPFP.tsx` | Canvas-based pixelated avatar from unavatar.io |
| `scripts/trail-schema.sql` | Postgres schema for manual setup |

### CRT Design System
- Background: #001a00, Text: #33ff33, Error: #ff4444
- Scanlines: repeating-linear-gradient overlay
- Vignette: radial-gradient edge darkening
- Flicker: subtle opacity animation
- Font: monospace (system), all caps headers with ═══ borders
- Borders: border-[#33ff33]/20, hover states at /40 or /80
- Images: `imageRendering: pixelated` on all sprites

### Game Data
- **7 professions**: VC Partner → Crypto Poor, assigned by `protocol_fees_paid` tier
- **~20 KOLs**: Real Twitter handles with 2-6 unique death messages each
- **Featured KOLs**: @blknoiz06 (Ansem) and @aaboronkov_sol (Toly) always appear first
- **15 protocol-based landmarks**: Mapped from wallet's `protocols_used`
- **~30 random events**: catastrophic/bad/good/neutral with stat changes
- **Duck Hunt**: 8 targets, 5 bullets, 10-second timer with pause-aware refs
- **SBF jail scene**: Multi-line typed dialogue, trust/walk choice

### Key Patterns & Bug Fixes Applied
- **All hooks before conditional returns** — React Error #310 fix. Every useEffect, useRef, useCallback must be declared before the first `if (state.phase === "...")` return.
- **Deep copy party members** — `state.party.map(m => ({ ...m }))` not `[...state.party]`. Shallow spread caused mutation bleed where one KOL's death killed others.
- **Ref-based hunt timer** — `huntStartRef`, `huntPausedAtRef`, `huntPausedTotalRef` survive phase transitions and pause during Trump popup.
- **SBF dialogue guard** — `sbfAdvancedRef` tracks which line was already advanced to prevent double-fire from re-renders.
- **Sound effects in useEffect** — Never call sfx in render body. Use useEffect with ref guards.
- **Game save on score_reveal** — `gameSavedRef` prevents double-POST. Silent fail if DB unavailable.
- **Twitter auth returnTo** — Cookie-based redirect so auth from `/trail` returns to `/trail`, not `/dashboard`.

### Sprites (`public/images/trail/`)
- `wagon.png` (32x32) — Game Boy green palette, needs full color redo
- `bear.png`, `bull.png` (48x48) — Full color, created via Aseprite MCP
- `trump_cropped.png` (28x34) — Photo-downsampled, used in hunt miss
- `sbf.png` (64x64) — Needs complete redo (low quality)
- `tombstone.png`, `bullet.png`, `mcdonalds.png`, `medicine.png` — Game Boy green, need color redo
- `slice-logo-pixel.png` (400x92) — Downsampled Slice Analytics logo, colorful icon + white text
- `cart.png` (32x32) — Shopping cart for Crypto Poor profession

### Known Issues / TODO
- **SBF sprite**: Needs complete pixel art redo
- **Old sprites**: wagon, tombstone, burger, medicine, bullet still in Game Boy green palette — should be full color
- **Trump sprite**: Photo downsample works but user wants higher quality pixel art
- **Twitter/X OAuth**: Works locally but production needs `NEXTAUTH_URL` set to Vercel domain + callback URL registered in Twitter Developer Portal (`https://impact-webapp.vercel.app/api/auth/twitter/callback`)
- **Mobile optimization**: Not yet done for trail pages
- **Vercel Postgres env**: Must be set in Vercel Dashboard for production deployment

---

## Main Site Pending Tasks
- Replace wallet-adapter with Dynamic.xyz
- Wire up .sol domain resolution (SNS)
- Mobile-optimize layout
- Set up Vercel Analytics
- Tom: Add rank + percentile to Dune query, break fees by sector, x402 middleware, expand leaderboard

## Conventions
- Package manager: pnpm
- Never commit .env.local (contains API keys)
- Limit Dune API pings — uses `get_latest_result` (cached) + 10-min in-memory cache
- `protocols_used` from Dune is an **array**, not a string — code handles both
- Scores should display with `.toFixed(2)` for consistent formatting
