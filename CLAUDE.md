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

## Project Overview
Wallet scoring platform for Solana. Users look up or connect their wallet to see a reputation score (0-100) measuring cross-protocol activity. Two audiences: users (flex scores, earn rewards) and protocols (sybil removal, user insights, acquisition).

## Tech Stack
- Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- @solana/wallet-adapter (Phantom, Solflare) for wallet connection
- @vercel/og (Satori) for scorecard PNG generation
- Dune Analytics API (Query ID: 6576517) for score data
- pnpm, hosted on Vercel
- Dark-only theme (no light mode)

## Key Docs
- `docs/BUILD-SPEC.md` - Complete MVP build specification (design system, pages, data model, file structure)
- `docs/MVP-SPEC.md` - Original MVP specification
- `docs/DATA-DICTIONARY.md` - Dune query columns, scoring methodology, test addresses

## Design Reference
- `mockups/25-site-clean-fusion.html` - PRIMARY site design (purple glass, Solana gradients)
- `mockups/27-site-no-sidebar.html` - Reference for score breakdown colors + Twitter/profile section
- `mockups/29-logo-mockups.html` - 8 logo concepts for platform symbol (pending user selection)
- `mockups/16-scorecard-twitter-personal.html` - Scorecard design for Twitter sharing

## Current State (last updated: 2026-02-26)
- MVP fully implemented with Clean Fusion design, dark-only theme
- Dune API connected with 10-min in-memory cache (key in .env.local)
- `protocols_used` from Dune is an **array**, not a string — code handles both
- 7-tier scoring system: Whale (95+), Power User (90+), Active User (80+), Average User (60+), Likely Human (40+), Potential Sybil (20+), Sybil (0+)
- Twitter/X linking via localStorage — replaces profile bubble with PFP + handle when linked (uses unavatar.io for avatars)
- "My Dashboard" button in Topbar when wallet connected
- Score breakdown bars color-coded by value (green/cyan/yellow/red)
- Simplified view (/score/[address]) has blurred breakdown with "Connect to view" CTA
- Slice Analytics brand logo in topbar (replaces grey text)
- Dune "Powered by" logo in footer
- Leaderboard has tier descriptions sidebar card
- **Pending**: User needs to pick a logo from mockups/29-logo-mockups.html

## Routes
| Route | Description |
|-------|-------------|
| `/` | Home — search bar + leaderboard |
| `/score/[address]` | Simplified view — score, blurred breakdown, protocols (lookup) |
| `/dashboard` | Full dashboard — connected wallet, stats, breakdown, protocols, leaderboard |
| `/leaderboard` | Full leaderboard with tier descriptions + score distribution |
| `/for-protocols` | B2B page — case study, value props, API waitlist |
| `/api/score` | Dune API proxy with 10-min cache |
| `/api/og/[address]` | OG scorecard image (Vercel OG/Satori) |

## Key Architecture Decisions
- Dune API key: stored in .env.local as `DUNE_API_KEY` (value: `qol67syR25CGcihzKvS2sU8CKFIKQPox`)
- **Limit Dune API pings** — team has limited credits. Uses `get_latest_result` (cached, no re-execution) + 10-min in-memory cache
- Twitter/X linking is localStorage-based (no OAuth yet) — upgrade path is real OAuth when Twitter API credentials are available
- Mock data fallback when API unavailable
- CSS variables on `:root` directly (no `.dark` class) — light mode removed entirely

## Conventions
- Package manager: pnpm
- Dark-only theme (Clean Fusion aesthetic)
- Colors: #0c0b14 (bg), #9945FF (purple), #14F195 (green), #00D1FF (cyan)
- Font: Inter (weights 300-900)
- Glass cards: rgba(255,255,255,0.035) with backdrop-filter blur(12px)
- Tier colors use Tailwind: cyan (Whale), violet (Power User), emerald (Active), yellow (Average), orange (Likely Human), red (Potential Sybil/Sybil)
