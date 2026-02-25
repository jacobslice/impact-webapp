# Solana Score by Slice Analytics

## Project Overview
Wallet scoring platform for Solana. Users look up or connect their wallet to see a reputation score (0-100) measuring cross-protocol activity. Two audiences: users (flex scores, earn rewards) and protocols (sybil removal, user insights, acquisition).

## Tech Stack
- Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- @solana/wallet-adapter (Phantom, Solflare) for wallet connection
- @vercel/og (Satori) for scorecard PNG generation
- next-themes for dark/light theme toggle
- Dune Analytics API (Query ID: 6576517) for score data
- pnpm, hosted on Vercel

## Key Docs
- `docs/BUILD-SPEC.md` - Complete MVP build specification (design system, pages, data model, file structure)
- `docs/MVP-SPEC.md` - Original MVP specification
- `docs/DATA-DICTIONARY.md` - Dune query columns, scoring methodology, test addresses

## Design Reference
- `mockups/25-site-clean-fusion.html` - PRIMARY site design (purple glass, Solana gradients)
- `mockups/16-scorecard-twitter-personal.html` - Scorecard design for Twitter sharing

## Current Status
- MVP fully implemented with Clean Fusion design
- 5 routes: Home (/), Score (/score/[address]), Dashboard (/dashboard), Leaderboard (/leaderboard), For Protocols (/for-protocols)
- Wallet connection via Solana Wallet Adapter
- OG image generation at /api/og/[address]
- Dynamic OG meta tags for Twitter sharing
- Dark + light theme toggle
- Mock data fallback when Dune API unavailable

## Routes
| Route | Description |
|-------|-------------|
| `/` | Home — search bar + leaderboard |
| `/score/[address]` | Simplified view — score, breakdown, protocols (lookup) |
| `/dashboard` | Full dashboard — connected wallet, stats, leaderboard, distribution |
| `/leaderboard` | Full leaderboard page |
| `/for-protocols` | B2B page — case study, value props, API waitlist |
| `/api/score` | Dune API proxy |
| `/api/og/[address]` | OG scorecard image (Vercel OG/Satori) |

## Open Questions
- Dune API key: stored in .env.local as DUNE_API_KEY
- Domain name: TBD
- Rate limiting: future post-MVP

## Conventions
- Package manager: pnpm
- Dark theme default with light mode toggle (Clean Fusion aesthetic)
- Colors: #0c0b14 (bg), #9945FF (purple), #14F195 (green), #00D1FF (cyan)
- Font: Inter (weights 300-900)
- Glass cards: rgba(255,255,255,0.035) with backdrop-filter blur(12px)
