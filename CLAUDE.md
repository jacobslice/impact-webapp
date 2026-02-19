# Solana Score by Slice Analytics

## Project Overview
Web app that lets users paste a Solana wallet address and see their Solana Score (0-100), measuring value contribution and organic activity. Built in collaboration with Jupiter.

## Tech Stack
- Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui
- Dune Analytics API (Query ID: 6576517) for score data
- pnpm, hosted on Vercel

## Key Docs
- `docs/MVP-SPEC.md` - Full MVP specification
- `docs/DATA-DICTIONARY.md` - Dune query columns, scoring methodology, test addresses

## Current Status
- MVP spec finalized
- Data dictionary finalized
- Next.js project scaffolded (default template)
- **Next: Build the actual app**

## Next Steps
1. Set up project structure (app routes, components, lib folders)
2. Build the score lookup UI (dark theme, Solana vibes, address input)
3. Create API route to query Dune Analytics
4. Build score display component (score graphic + protocol list)
5. Add "not scored yet" state for unknown wallets
6. Add IP-based rate limiting
7. Set up shadcn/ui components

## Open Questions
- Dune API key needed (not yet provided)
- Score graphic design TBD
- Rate limit thresholds TBD
- Domain name TBD

## Conventions
- Package manager: pnpm
- Dark theme with Solana ecosystem colors
- Reference design: https://www.impactscore.xyz/
