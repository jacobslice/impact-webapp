# Session Handoff

> When switching devices, update this file with current status then commit+push.
> On the new device, pull and tell Claude: "Read HANDOFF.md and pick up where I left off"

---

## Last Updated
2026-02-19

## Current Status
MVP is functional and tested. Working on UI polish.

## What's Working
- Score lookup via Dune API (Query ID: 6576517)
- Score display with circular ring, tier badges, percentile ranking
- Score breakdown (collapsible, shows Value/Activity components)
- Protocol logos with hover tooltips (sector color-coded)
- Jupiter activity badges (Staker/Perps)
- Recent lookups (localStorage)
- Copy address button
- Leaderboard on landing page (top 10 by score)
- "Not scored yet" state for unknown wallets

## What's In Progress
- UI visual polish and design refinement
- User wants to add frontend design skills/prompts (found on GitHub, not yet shared)

## Next Steps
- [ ] Continue UI polish (sleek & minimal, Solana gradient colors)
- [ ] Frontend design skills integration
- [ ] Rate limiting (IP-based)
- [ ] Caching layer for Dune responses
- [ ] Share/export score feature
- [ ] Wallet connect (future)

## Key Files
- `app/page.tsx` - Main page (search + leaderboard + score display)
- `app/api/score/route.ts` - Dune API route
- `lib/protocols.ts` - Protocol logos and sector mapping
- `lib/score-utils.ts` - Tiers, percentiles, recent lookups
- `lib/leaderboard-data.ts` - Static top 20 leaderboard
- `components/score-breakdown.tsx` - Score breakdown bars
- `.env.local` - Dune API key (not committed, must create on each device)

## Environment Setup (New Device)
```bash
git clone <repo-url>
cd impact-webapp
pnpm install
# Create .env.local with: DUNE_API_KEY=<your-key>
pnpm dev
```

## Important Notes
- Dune API key has usage limits per billing cycle - be mindful of queries
- .env.local.example shows required env vars
- Leaderboard data is static (hardcoded top 20)
