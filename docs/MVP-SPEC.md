# Solana Score MVP Specification

**Project**: Solana Score by Slice Analytics
**Date**: 2026-02-12
**Status**: Approved for development

---

## Overview

A web application that allows users to check their Solana Score - a reputation metric that quantifies a wallet's value and organic activity on Solana. Created by Slice Analytics in collaboration with Jupiter.

---

## MVP Scope

### Core Feature
**Address Lookup** - User pastes a Solana address and sees their score. No wallet connection required.

### What's NOT in MVP
- Wallet connect (MetaMask-style connection)
- Score minting/NFTs
- Protocol API access
- User accounts/authentication
- New wallet scoring (wallets not in Dune show "not scored yet")

---

## Scoring Methodology

**Score Range**: 0-100

### Value (50%)
| Component | Weight | Description |
|-----------|--------|-------------|
| Protocol Fees Paid | 30% | Monetary investment into Solana protocols |
| Network Fees Paid | 10% | Monetary investment into overall Solana ecosystem |
| Current Solana Holdings | 10% | Wallet value of all Solana tokens |

### Activity (50%)
| Component | Weight | Description |
|-----------|--------|-------------|
| Protocol Diversity | 30% | Number of protocols interacted with |
| Consistency | 20% | Transactions over time (X months active) |

---

## Protocols Tracked

| Protocol | Sector |
|----------|--------|
| PumpSwap | Dex |
| Raydium CPMM | Dex |
| Raydium AMM | Dex |
| Raydium CLMM | Dex |
| Orca | Dex |
| Meteora DAMM v2 | Dex |
| ByReal CLMM | Dex |
| Moonshot Create | Launchpad |
| LaunchLab | Launchpad |
| Pump.fun | Launchpad |
| Lets Bonk | Launchpad |
| Bags | Launchpad |
| Believe | Launchpad |
| Jupiter Aggregator Ultra (v6) | Dex Aggregator |
| Jupiter Aggregator Limit Order | Dex Aggregator |
| Jupiter DCA | Dex Aggregator |
| Jupiter Perps | Perps |
| Drift Perps | Perps |
| Axiom | Trading App |
| moonshot.money | Trading App |
| Photon | Trading App |
| Phantom | Wallet |
| Dex Screener | Other |
| Dex Tools | Other |

---

## Technical Architecture

### Stack
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Language**: TypeScript
- **Data**: Dune Analytics API (direct queries per address)
- **Hosting**: Vercel
- **Package Manager**: pnpm

### Data Flow
1. User enters Solana address
2. API route queries Dune Analytics
3. Dune returns score data + protocol interactions
4. Frontend displays score graphic + protocol list

### Rate Limiting
- No user authentication
- IP-based rate limiting to prevent abuse
- Minimal Dune queries during testing phase

---

## UI Requirements

### Design Direction
- Dark theme (matching impactscore.xyz aesthetic)
- Solana ecosystem color vibes
- Slice Analytics branding/logo
- Clean, minimalist layout

### Score Display
- Score graphic (style TBD - will explore options)
- Protocol list showing which of the 24 protocols the user has interacted with
- "Not scored yet" state for unknown wallets

### Reference
- Existing EVM version: https://www.impactscore.xyz/

---

## Future Phases (Post-MVP)

1. **Wallet Connect** - Connect wallet instead of pasting address
2. **Score Minting** - Mint score as on-chain attestation
3. **Protocol API** - Allow protocols to query scores programmatically
4. **Protocol Dashboard** - Visualizations for protocol user bases
5. **New Wallet Scoring** - Queue + compute scores for unknown wallets
6. **Addressable Market Analysis** - Market size visualizations

---

## Open Questions

- [ ] Dune query structure/endpoint details
- [ ] Specific score graphic design (will explore options)
- [ ] Exact rate limit thresholds
- [ ] Domain name for Solana Score

---

## Assets Needed

- [ ] Slice Analytics logo
- [ ] Dune API key
- [ ] Dune query/endpoint for score data
