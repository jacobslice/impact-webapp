# Solana Score — MVP Build Specification

> Last updated: 2026-02-25
> Reference mockup (site): `mockups/25-site-clean-fusion.html`
> Reference mockup (scorecard): `mockups/16-scorecard-twitter-personal.html`

---

## Project Overview

Solana Score by Slice Analytics is a wallet scoring platform for Solana. Users look up or connect their wallet to see a reputation score (0-100) measuring cross-protocol activity. The platform serves two audiences:

1. **Users** — Flex their score, earn rewards based on onchain history, share on Twitter
2. **Protocols** — Use scores for sybil removal, understanding users, acquiring ideal customers

### Validated via Case Study
- Analyzed 30M Jupiter users
- Higher Solana Score correlates with: increased staking %, better retention, more fees paid on Jupiter/individual protocols, passing sybil checks
- Score is weighted entirely across cross-protocol activity

---

## Pages (4 Routes)

### 1. Home (`/`)
- **Search bar** — accepts Solana wallet addresses + .sol domain names
- **Global leaderboard** — static/placeholder data for MVP (future: weekly/daily refresh from Dune)
- **Footer** — Slice Analytics logo (`mockups/Slice Analytics Logo.png` or `mockups/Slice Analytics full name.png`) + "Powered by Dune" with Dune logo
- This is the landing page before any wallet is searched

### 2. Dashboard (`/dashboard` or `/score/[address]`)
- **Two modes:**

#### Simplified View (wallet lookup, no connection)
- Score number + tier badge (e.g., 87/100, Diamond)
- Score breakdown bars (Transaction Volume, Protocol Diversity, Account Age, DeFi Activity, NFT Engagement, Governance)
- Protocol logos used (circular row with real images)
- CTA to connect wallet for full details

#### Full Dashboard (connected wallet)
- Score gauge (half-circle SVG, 0-100, Solana gradient arc)
- Tier badge (Diamond/Platinum/Gold/Silver/Bronze)
- Rank + percentile (e.g., #12,847, Top 4%)
- Score breakdown bars (6 factors, NO change-over-time data)
- Stats cards: Protocol Fees paid, Holdings, Months Active — **NO** 7d/30d changes
- Protocol grid (real logos, 32px circular): show protocol name, sector tag, fees paid — **NO** volume, TXN counts, or last active timestamps
- Leaderboard (static placeholder for MVP, user's position highlighted)
- Score distribution chart (horizontal bars, user's range highlighted)
- **NOT included:** Activity table, change-over-time metrics, volume, TXN counts per protocol
- "Share on X" button (generates scorecard image via Vercel OG)

### 3. Leaderboard (`/leaderboard`)
- Full-page dedicated leaderboard view
- Static/placeholder data for MVP
- Future: updated weekly or daily from Dune data

### 4. For Protocols (`/protocols` or `/for-protocols`)
- **Value proposition** — explain how Solana Score helps protocols with sybil removal, user understanding, customer acquisition
- **Case study section** — Jupiter data: 30M users analyzed, correlation charts/stats showing score vs staking %, retention, fees, sybil detection
- **"API Coming Soon" section** — brief description of what the API will offer (score lookup, sybil checks, user segments), mention x402 standard for pay-per-query, email capture waitlist for early access
- Static page, no dynamic data needed

---

## Wallet Flow

1. User lands on Home (`/`) — sees search + leaderboard
2. **Lookup path:** User pastes address or .sol domain → redirected to `/score/[address]` → sees simplified view
3. **Connect path:** User clicks "Connect Wallet" → Solana Wallet Adapter modal → Phantom/Solflare/etc → redirected to full dashboard
4. Connected users can also look up other wallets (get simplified view for those)

---

## Sharing / Viral Loop

- **Vercel OG (Satori)** generates scorecard PNG at an API route (e.g., `/api/og/[address]`)
- **Dynamic OG meta tags** on `/score/[address]` pages — when URL is shared on Twitter, the card preview automatically shows the scorecard image
- **"Share on X" button** opens Twitter with pre-filled text + the scorecard image
- **Scorecard design** based on mockup 16 (Twitter Personal): PFP, score ring, tier, breakdown, protocol logos, "solana-score.xyz" branding

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Package Manager | pnpm |
| Wallet | @solana/wallet-adapter (Phantom, Solflare, Backpack, etc.) |
| Image Gen | @vercel/og (Satori) for scorecard PNGs |
| Data API | Dune Analytics (Query ID: 6576517) |
| Hosting | Vercel |
| Domain | TBD (use placeholder in code) |

---

## Design System

### Aesthetic
- Based on **Clean Fusion** (mockup 25): purple glass, Solana gradients
- Font: **Inter** (Google Fonts) — weights 300-900
- Dark default theme + **light mode toggle**

### Colors (Dark Theme)
- Body: `#0c0b14`
- Card backgrounds: `rgba(255,255,255,0.035)` with `backdrop-filter: blur(12px)`
- Borders: `rgba(139,92,246,0.15)` (purple-tinted)
- Sidebar: `#08080c`
- Accents: Solana gradient `#9945FF` (purple), `#14F195` (green), `#00D1FF` (cyan)
- Text primary: `#e8e8e8`
- Text secondary: `#999`
- Text muted: `#666`

### Layout
- Fixed left sidebar (56px) — collapses on mobile
- Fixed top bar with search
- Main content: max-width ~1300px
- Desktop-first, basic mobile responsiveness

### Branding Assets
- Slice Analytics logo: `mockups/Slice Analytics Logo.png`
- Slice Analytics full name: `mockups/Slice Analytics full name.png`
- "Powered by Dune" — need Dune logo (to be sourced)
- Protocol logos: `public/images/protocols/` (jupiter.svg, raydium.jpg, meteora.jpg, drift.png, orca.jpg, phantom.jpg, pumpfun.png, axiom.png, + bags, believe, byreal, dextools, launchlab, letsbonk, moonshot)

---

## Data Model (from Dune Query 6576517)

### Score Fields Available
- `overall_score` (0-100)
- `tier` (Diamond/Platinum/Gold/Silver/Bronze)
- `rank` (global position)
- `percentile` (Top X%)
- Score breakdown sub-scores (Transaction Volume, Protocol Diversity, Account Age, DeFi Activity, NFT Engagement, Governance)
- Protocol fees paid (total + per protocol)
- Holdings value
- Account age / months active
- Protocols used (list)

### Fields NOT Available (remove from UI)
- 7d/30d score changes
- Volume per protocol
- TXN count per protocol
- Last active time per protocol
- Recent activity/transaction history

### Mock Data (for MVP until Dune key is wired)
- Use realistic placeholder data matching the Dune query structure
- Example wallet: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
- Example score: 87, Diamond, #12,847, Top 4%

---

## Navigation Structure

| Sidebar Icon | Page | Route |
|-------------|------|-------|
| Dashboard (active) | Home / Dashboard | `/` or `/dashboard` |
| Trophy | Leaderboard | `/leaderboard` |
| Building | For Protocols | `/for-protocols` |
| Settings | Settings (future) | — |

---

## MVP Scope vs Future

### MVP (Build Now)
- [x] Home page with search + placeholder leaderboard
- [ ] Simplified score view (lookup)
- [ ] Full dashboard (connected wallet)
- [ ] Wallet connect via Solana Wallet Adapter
- [ ] Scorecard image generation (Vercel OG)
- [ ] Dynamic OG meta tags for Twitter sharing
- [ ] For Protocols page (static, case study, API waitlist)
- [ ] Leaderboard full page (static data)
- [ ] Dark + light theme toggle
- [ ] Footer with Slice Analytics + Powered by Dune
- [ ] Mock data fallback

### Future (Post-MVP)
- Real-time Dune data integration (weekly/daily leaderboard refresh)
- x402 pay-per-query API
- Rewards/perks page for high-score users
- .sol domain resolution
- Protocol-specific score pages
- Mobile-optimized views
- Rate limiting (IP-based)

---

## File Structure (Planned)

```
impact-webapp/
├── app/
│   ├── layout.tsx              # Root layout (sidebar, topbar, theme)
│   ├── page.tsx                # Home (search + leaderboard)
│   ├── dashboard/
│   │   └── page.tsx            # Full dashboard (connected wallet)
│   ├── score/
│   │   └── [address]/
│   │       └── page.tsx        # Simplified score view (lookup)
│   ├── leaderboard/
│   │   └── page.tsx            # Full leaderboard page
│   ├── for-protocols/
│   │   └── page.tsx            # B2B page (case study + API waitlist)
│   └── api/
│       ├── score/
│       │   └── route.ts        # Dune API proxy (existing)
│       └── og/
│           └── [address]/
│               └── route.tsx   # Vercel OG scorecard image
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   └── Footer.tsx
│   ├── score/
│   │   ├── ScoreGauge.tsx      # Half-circle SVG gauge
│   │   ├── ScoreBreakdown.tsx  # Breakdown bars
│   │   ├── TierBadge.tsx
│   │   └── ScoreRing.tsx       # Circular ring (for scorecard)
│   ├── dashboard/
│   │   ├── StatsCards.tsx
│   │   ├── ProtocolGrid.tsx
│   │   └── ScoreDistribution.tsx
│   ├── leaderboard/
│   │   └── LeaderboardTable.tsx
│   ├── wallet/
│   │   └── WalletButton.tsx    # Connect wallet button
│   └── share/
│       └── ShareOnX.tsx        # Share button + tweet generation
├── lib/
│   ├── protocols.ts            # Protocol definitions (existing)
│   ├── dune.ts                 # Dune API client
│   ├── mock-data.ts            # Mock/placeholder data
│   └── types.ts                # TypeScript interfaces
├── public/
│   └── images/
│       └── protocols/          # Protocol logos (existing)
├── docs/
│   ├── MVP-SPEC.md
│   ├── DATA-DICTIONARY.md
│   └── BUILD-SPEC.md           # This file
└── mockups/                    # HTML mockups (reference only)
```

---

## Mockup Reference

| # | File | Purpose |
|---|------|---------|
| 05 | `05-dashboard-dense.html` | Layout reference (grid structure, data density) |
| 16 | `16-scorecard-twitter-personal.html` | Scorecard design for Twitter sharing |
| 25 | `25-site-clean-fusion.html` | **PRIMARY** — Full site design (layout + aesthetic) |
| 26-28 | `26-28-*.html` | Alternative site layouts (for reference) |
