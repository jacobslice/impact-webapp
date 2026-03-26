# Solana Score — Feature Review & Decision Matrix

> **Purpose**: Walk through every feature (built, discussed, and proposed) and decide: **Keep**, **Cut**, **Add**, or **Rework**.
> **Date**: 2026-03-25

---

## Legend
| Status | Meaning |
|--------|---------|
| ✅ Built | Live in current codebase |
| 🟡 Partial | Started or stubbed, not complete |
| 🔲 Planned | Discussed/spec'd but not built |
| 💡 Proposed | New recommendation |

---

## 1. CORE SCORING ENGINE

| # | Feature | Status | Notes | Decision |
|---|---------|--------|-------|----------|
| 1.1 | **Dune Analytics score fetch** | ✅ Built | Query 6576517, returns 0-100 score per wallet | |
| 1.2 | **7-tier classification** | ✅ Built | Whale / Power User / Active / Average / Likely Human / Potential Sybil / Sybil | |
| 1.3 | **6-factor score breakdown** | ✅ Built | TX Volume, Protocol Diversity, Account Age, DeFi Activity, NFT Engagement, Governance | |
| 1.4 | **10-min in-memory cache** | ✅ Built | Preserves Dune API credits; resets on redeploy | |
| 1.5 | **Mock data fallback** | ✅ Built | Client falls back to mock data when API fails | |
| 1.6 | **Percentile & rank estimation** | ✅ Built | Calculated client-side from score value | |
| 1.7 | **Per-protocol fee tracking** | 🔲 Planned | Volume/TXN counts per protocol — in BUILD-SPEC | |
| 1.8 | **7d/30d score change metrics** | 🔲 Planned | Score delta tracking over time — in BUILD-SPEC | |
| 1.9 | **Persistent cache (Redis/KV)** | 💡 Proposed | Replace in-memory cache with Vercel KV so cache survives redeploys | |

---

## 2. PAGES & ROUTES

| # | Feature | Status | Notes | Decision |
|---|---------|--------|-------|----------|
| 2.1 | **Home (`/`)** | ✅ Built | Search bar + top-10 leaderboard preview + hero | |
| 2.2 | **Score lookup (`/score/[address]`)** | ✅ Built | Public view — score gauge, blurred breakdown, protocols, share button | |
| 2.3 | **Dashboard (`/dashboard`)** | ✅ Built | Connected wallet — full breakdown, stats cards, protocols, leaderboard, distribution chart | |
| 2.4 | **Leaderboard (`/leaderboard`)** | ✅ Built | Top 20 + tier descriptions sidebar + score distribution | |
| 2.5 | **For Protocols (`/for-protocols`)** | ✅ Built | B2B page — value props, Jupiter case study, API waitlist form | |
| 2.6 | **Settings page** | 🟡 Partial | Nav icon exists in sidebar, not wired to anything | |
| 2.7 | **Rewards/perks page** | 🔲 Planned | Mentioned in post-MVP roadmap | |
| 2.8 | **Protocol-specific score pages** | 🔲 Planned | Deep-dive per protocol (e.g., /protocol/jupiter) | |

---

## 3. API ENDPOINTS

| # | Feature | Status | Notes | Decision |
|---|---------|--------|-------|----------|
| 3.1 | **`GET /api/score?address=`** | ✅ Built | Proxies Dune, validates address, caches 10 min | |
| 3.2 | **`GET /api/og/[address]`** | ✅ Built | OG scorecard PNG (1200x630) via Vercel Edge + Satori | |
| 3.3 | **x402 paid score endpoint** | 🔲 **Priority Add** | AI agents & protocols pay micro-fee (SOL) to query wallet scores. See Section 8 below. | |
| 3.4 | **Batch score lookup** | 💡 Proposed | `POST /api/scores` — accept array of addresses, return array of scores (for protocol integrations) | |
| 3.5 | **IP-based rate limiting** | 🔲 Planned | Discussed in specs, not implemented | |
| 3.6 | **API key auth (free tier)** | 💡 Proposed | Issue API keys for protocols on waitlist, track usage | |

---

## 4. WALLET & IDENTITY

| # | Feature | Status | Notes | Decision |
|---|---------|--------|-------|----------|
| 4.1 | **Phantom wallet connect** | ✅ Built | Via @solana/wallet-adapter | |
| 4.2 | **Solflare wallet connect** | ✅ Built | Via @solana/wallet-adapter | |
| 4.3 | **Auto-connect on return** | ✅ Built | Remembers last wallet | |
| 4.4 | **Twitter/X linking (localStorage)** | ✅ Built | Manual handle entry, PFP via unavatar.io, persists locally | |
| 4.5 | **Twitter/X OAuth** | 🔲 Planned | Real OAuth flow — upgrade from localStorage approach | |
| 4.6 | **.sol domain resolution** | 🟡 Partial | Placeholder text in search bar, resolution not implemented | |
| 4.7 | **Multi-wallet support** | 💡 Proposed | Link multiple wallets to single identity, aggregate scores | |

---

## 5. SOCIAL & SHARING

| # | Feature | Status | Notes | Decision |
|---|---------|--------|-------|----------|
| 5.1 | **Share on X button** | ✅ Built | Pre-filled tweet + scorecard image URL | |
| 5.2 | **OG scorecard image** | ✅ Built | Dynamic PNG with score, tier, percentile, wallet | |
| 5.3 | **Twitter PFP display** | ✅ Built | Shows avatar + handle when X account linked | |
| 5.4 | **Scorecard download** | 💡 Proposed | "Save as PNG" button for offline sharing | |
| 5.5 | **Farcaster sharing** | 💡 Proposed | Frames integration for Warpcast | |

---

## 6. LEADERBOARD & ANALYTICS

| # | Feature | Status | Notes | Decision |
|---|---------|--------|-------|----------|
| 6.1 | **Top 20 leaderboard** | ✅ Built | Static data from Dune, medals for top 3, "YOU" badge | |
| 6.2 | **Score distribution chart** | ✅ Built | 6 score ranges, highlights user's range | |
| 6.3 | **Tier reference card** | ✅ Built | All 7 tiers with descriptions + score ranges | |
| 6.4 | **Real-time leaderboard refresh** | 🔲 Planned | Weekly/daily sync from Dune (currently static) | |
| 6.5 | **Activity transaction history** | 🔲 Planned | Per-wallet TX timeline — in BUILD-SPEC | |
| 6.6 | **Leaderboard filters** | 💡 Proposed | Filter by tier, protocol, time range | |

---

## 7. DESIGN & UX

| # | Feature | Status | Notes | Decision |
|---|---------|--------|-------|----------|
| 7.1 | **Clean Fusion dark theme** | ✅ Built | Purple glass cards, Solana gradients, backdrop blur | |
| 7.2 | **Stacked Bars logo** | ✅ Built | Concept 03 — ascending bars forming "S" | |
| 7.3 | **Sidebar navigation** | ✅ Built | Fixed left nav (56px) with active state indicators | |
| 7.4 | **Topbar with search** | ✅ Built | Branding, search, dashboard link, wallet button | |
| 7.5 | **Responsive/mobile layout** | 🟡 Partial | Grid is responsive, but not mobile-optimized | |
| 7.6 | **Light mode** | 🔲 Planned | In BUILD-SPEC but intentionally removed (dark-only) | |
| 7.7 | **Animated score gauge** | ✅ Built | SVG half-circle with gradient arc, 1s ease-out fill | |
| 7.8 | **Dune "Powered by" footer** | ✅ Built | Attribution logo in footer | |

---

## 8. x402 PAID API — PRIORITY FEATURE

> **Decision: ADD** — This is the monetization layer. Every AI agent or protocol with Solana users can hit our endpoint, pay a micro-fee in SOL, and get wallet score data back.

### Concept
- Standard: [x402 protocol](https://www.x402.org/) — HTTP 402 Payment Required
- Flow: Agent sends request → gets 402 response with payment details → pays via Solana → re-sends request with payment proof → receives score data
- Fee: Micro-payment in SOL (e.g., 0.0001 SOL per query, ~$0.01)

### What to build
| Sub-feature | Description | Priority |
|-------------|-------------|----------|
| 8.1 | **402 middleware** | Payment-gating layer that returns 402 + payment instructions for unauthenticated requests | P0 |
| 8.2 | **Solana payment verification** | Verify on-chain SOL transfer before serving response | P0 |
| 8.3 | **`GET /api/v1/score`** | Paid endpoint — same data as /api/score but behind x402 paywall | P0 |
| 8.4 | **`POST /api/v1/scores`** | Batch paid endpoint — multiple wallets in one request | P1 |
| 8.5 | **Payment receipt tracking** | Log payments + queries for analytics/billing | P1 |
| 8.6 | **Usage dashboard** | Protocol-facing dashboard showing API usage + spend | P2 |
| 8.7 | **Tiered pricing** | Volume discounts for high-usage protocols | P2 |
| 8.8 | **SDK / npm package** | `@slice-analytics/solana-score` — wrapper for easy integration | P2 |

### Open Questions
- [ ] What SOL amount per query? (needs to be low enough for agents to use freely)
- [ ] Do we also accept USDC via x402?
- [ ] Revenue split or treasury wallet address?
- [ ] Rate limits for paid tier vs free tier?
- [ ] Do we keep a free tier at all? (e.g., 100 queries/day free, then paid)

---

## 9. INFRASTRUCTURE & OPS

| # | Feature | Status | Notes | Decision |
|---|---------|--------|-------|----------|
| 9.1 | **Vercel hosting** | ✅ Built | Deployed on Vercel | |
| 9.2 | **Environment variables** | ✅ Built | DUNE_API_KEY in .env.local | |
| 9.3 | **Edge runtime (OG)** | ✅ Built | OG image gen runs on Vercel Edge | |
| 9.4 | **Error handling & fallbacks** | ✅ Built | 400/404/500 responses, mock data fallback | |
| 9.5 | **Persistent cache (Redis/KV)** | 💡 Proposed | Vercel KV to survive redeploys | |
| 9.6 | **Monitoring / logging** | 💡 Proposed | Track API usage, errors, cache hit rates | |
| 9.7 | **CI/CD pipeline** | 💡 Proposed | Automated tests + preview deploys on PR | |

---

## 10. PROTOCOLS & DATA

| # | Feature | Status | Notes | Decision |
|---|---------|--------|-------|----------|
| 10.1 | **24 protocols tracked** | ✅ Built | Across 6 sectors: DEX, Launchpad, Aggregator, Perps, Trading, Wallet | |
| 10.2 | **Protocol logos** | ✅ Built | PNG/JPG/SVG assets for all 24 protocols | |
| 10.3 | **Sector color coding** | ✅ Built | Purple (DEX), Green (Launchpad), Orange (Perps), etc. | |
| 10.4 | **Expand protocol coverage** | 💡 Proposed | Add Marinade, Tensor, Magic Eden, Jito, Sanctum, etc. | |

---

## How to Use This Doc

1. Walk through each section together
2. For each row, mark the **Decision** column:
   - **Keep** — ship as-is
   - **Cut** — remove from codebase
   - **Rework** — keep but change approach
   - **Add** — build it (assign priority: P0/P1/P2)
   - **Defer** — good idea, not now
3. After the review, we'll have a clear build plan for the next sprint
