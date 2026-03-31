import json
import urllib.request

TOKEN = os.environ.get("NOTION_TOKEN", "")
PARENT_ID = "32eb6328-b169-80f1-86d5-d29905f9c960"
NOTION_VERSION = "2022-06-28"

def api(endpoint, data, method="POST"):
    req = urllib.request.Request(
        f"https://api.notion.com/v1/{endpoint}",
        data=json.dumps(data).encode(),
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Notion-Version": NOTION_VERSION,
            "Content-Type": "application/json"
        },
        method=method
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        print(f"Error {e.code}: {e.read().decode()}")
        raise

def heading(text, level=2):
    return {
        "object": "block",
        "type": f"heading_{level}",
        f"heading_{level}": {
            "rich_text": [{"type": "text", "text": {"content": text}}]
        }
    }

def paragraph(text, bold=False):
    return {
        "object": "block",
        "type": "paragraph",
        "paragraph": {
            "rich_text": [{"type": "text", "text": {"content": text}, "annotations": {"bold": bold, "italic": False, "strikethrough": False, "underline": False, "code": False, "color": "default"}}] if text else []
        }
    }

def callout(text, emoji="💡"):
    return {
        "object": "block",
        "type": "callout",
        "callout": {
            "rich_text": [{"type": "text", "text": {"content": text}}],
            "icon": {"type": "emoji", "emoji": emoji}
        }
    }

def divider():
    return {"object": "block", "type": "divider", "divider": {}}

def table_row(cells):
    return {
        "type": "table_row",
        "table_row": {
            "cells": [[{"type": "text", "text": {"content": c}}] for c in cells]
        }
    }

def table(headers, rows):
    children = [table_row(headers)] + [table_row(r) for r in rows]
    return {
        "object": "block",
        "type": "table",
        "table": {
            "table_width": len(headers),
            "has_column_header": True,
            "has_row_header": False,
            "children": children
        }
    }

def todo(text, checked=False):
    return {
        "object": "block",
        "type": "to_do",
        "to_do": {
            "rich_text": [{"type": "text", "text": {"content": text}}],
            "checked": checked
        }
    }

# --- Build page children (first 100 blocks max per request) ---
children_part1 = [
    callout("Walk through each section with your colleague. For every row, decide: Keep / Cut / Rework / Add / Defer.", "\U0001f3af"),
    paragraph("Date: 2026-03-25 | Status: Ready for Review", bold=True),
    divider(),
    heading("Legend", 2),
    table(
        ["Status", "Meaning"],
        [
            ["\u2705 Built", "Live in current codebase"],
            ["\U0001f7e1 Partial", "Started or stubbed, not complete"],
            ["\U0001f532 Planned", "Discussed or specced but not built"],
            ["\U0001f4a1 Proposed", "New recommendation"],
        ]
    ),
    divider(),
    heading("1. Core Scoring Engine", 2),
    table(
        ["#", "Feature", "Status", "Notes", "Decision"],
        [
            ["1.1", "Dune Analytics score fetch", "\u2705 Built", "Query 6576517, returns 0-100 per wallet", ""],
            ["1.2", "7-tier classification", "\u2705 Built", "Whale / Power User / Active / Average / Likely Human / Potential Sybil / Sybil", ""],
            ["1.3", "6-factor score breakdown", "\u2705 Built", "TX Vol, Protocol Diversity, Acct Age, DeFi, NFT, Governance", ""],
            ["1.4", "10-min in-memory cache", "\u2705 Built", "Preserves Dune credits; resets on redeploy", ""],
            ["1.5", "Mock data fallback", "\u2705 Built", "Client falls back when API fails", ""],
            ["1.6", "Percentile and rank estimation", "\u2705 Built", "Calculated client-side from score", ""],
            ["1.7", "Per-protocol fee tracking", "\U0001f532 Planned", "Volume/TXN counts per protocol (BUILD-SPEC)", ""],
            ["1.8", "7d/30d score change metrics", "\U0001f532 Planned", "Score delta tracking over time (BUILD-SPEC)", ""],
            ["1.9", "Persistent cache (Redis/KV)", "\U0001f4a1 Proposed", "Vercel KV so cache survives redeploys", ""],
        ]
    ),
    divider(),
    heading("2. Pages and Routes", 2),
    table(
        ["#", "Feature", "Status", "Notes", "Decision"],
        [
            ["2.1", "Home (/)", "\u2705 Built", "Search bar + top-10 leaderboard + hero", ""],
            ["2.2", "Score lookup (/score/[addr])", "\u2705 Built", "Public view: gauge, blurred breakdown, protocols", ""],
            ["2.3", "Dashboard (/dashboard)", "\u2705 Built", "Connected wallet: full breakdown, stats, protocols", ""],
            ["2.4", "Leaderboard (/leaderboard)", "\u2705 Built", "Top 20 + tier sidebar + score distribution", ""],
            ["2.5", "For Protocols (/for-protocols)", "\u2705 Built", "B2B page: value props, case study, API waitlist", ""],
            ["2.6", "Settings page", "\U0001f7e1 Partial", "Nav icon in sidebar, not wired", ""],
            ["2.7", "Rewards/perks page", "\U0001f532 Planned", "Post-MVP roadmap", ""],
            ["2.8", "Protocol-specific pages", "\U0001f532 Planned", "Deep-dive per protocol (e.g. /protocol/jupiter)", ""],
        ]
    ),
    divider(),
    heading("3. API Endpoints", 2),
    table(
        ["#", "Feature", "Status", "Notes", "Decision"],
        [
            ["3.1", "GET /api/score?address=", "\u2705 Built", "Proxies Dune, validates address, caches 10 min", ""],
            ["3.2", "GET /api/og/[address]", "\u2705 Built", "OG scorecard PNG (1200x630) via Satori", ""],
            ["3.3", "x402 paid score endpoint", "\U0001f532 Priority Add", "AI agents pay micro-fee (SOL) per query. See Section 8.", ""],
            ["3.4", "Batch score lookup", "\U0001f4a1 Proposed", "POST /api/scores: array of addresses", ""],
            ["3.5", "IP-based rate limiting", "\U0001f532 Planned", "Discussed in specs, not implemented", ""],
            ["3.6", "API key auth (free tier)", "\U0001f4a1 Proposed", "Issue keys for waitlist protocols, track usage", ""],
        ]
    ),
    divider(),
    heading("4. Wallet and Identity", 2),
    table(
        ["#", "Feature", "Status", "Notes", "Decision"],
        [
            ["4.1", "Phantom wallet connect", "\u2705 Built", "Via @solana/wallet-adapter", ""],
            ["4.2", "Solflare wallet connect", "\u2705 Built", "Via @solana/wallet-adapter", ""],
            ["4.3", "Auto-connect on return", "\u2705 Built", "Remembers last wallet", ""],
            ["4.4", "Twitter/X linking (localStorage)", "\u2705 Built", "Manual handle entry, PFP via unavatar.io", ""],
            ["4.5", "Twitter/X OAuth", "\U0001f532 Planned", "Real OAuth flow upgrade", ""],
            ["4.6", ".sol domain resolution", "\U0001f7e1 Partial", "Placeholder in search, not implemented", ""],
            ["4.7", "Multi-wallet support", "\U0001f4a1 Proposed", "Link multiple wallets, aggregate scores", ""],
        ]
    ),
    divider(),
    heading("5. Social and Sharing", 2),
    table(
        ["#", "Feature", "Status", "Notes", "Decision"],
        [
            ["5.1", "Share on X button", "\u2705 Built", "Pre-filled tweet + scorecard image URL", ""],
            ["5.2", "OG scorecard image", "\u2705 Built", "Dynamic PNG with score, tier, percentile", ""],
            ["5.3", "Twitter PFP display", "\u2705 Built", "Avatar + handle when linked", ""],
            ["5.4", "Scorecard download", "\U0001f4a1 Proposed", "Save as PNG button for offline sharing", ""],
            ["5.5", "Farcaster sharing", "\U0001f4a1 Proposed", "Frames integration for Warpcast", ""],
        ]
    ),
    divider(),
    heading("6. Leaderboard and Analytics", 2),
    table(
        ["#", "Feature", "Status", "Notes", "Decision"],
        [
            ["6.1", "Top 20 leaderboard", "\u2705 Built", "Static Dune data, medals, YOU badge", ""],
            ["6.2", "Score distribution chart", "\u2705 Built", "6 score ranges, highlights user", ""],
            ["6.3", "Tier reference card", "\u2705 Built", "All 7 tiers with descriptions", ""],
            ["6.4", "Real-time leaderboard refresh", "\U0001f532 Planned", "Weekly/daily Dune sync", ""],
            ["6.5", "Activity transaction history", "\U0001f532 Planned", "Per-wallet TX timeline (BUILD-SPEC)", ""],
            ["6.6", "Leaderboard filters", "\U0001f4a1 Proposed", "Filter by tier, protocol, time range", ""],
        ]
    ),
]

children_part2 = [
    divider(),
    heading("7. Design and UX", 2),
    table(
        ["#", "Feature", "Status", "Notes", "Decision"],
        [
            ["7.1", "Clean Fusion dark theme", "\u2705 Built", "Purple glass cards, Solana gradients", ""],
            ["7.2", "Stacked Bars logo", "\u2705 Built", "Concept 03: ascending bars", ""],
            ["7.3", "Sidebar navigation", "\u2705 Built", "Fixed left nav (56px)", ""],
            ["7.4", "Topbar with search", "\u2705 Built", "Branding, search, wallet button", ""],
            ["7.5", "Responsive/mobile layout", "\U0001f7e1 Partial", "Grid responsive, not mobile-optimized", ""],
            ["7.6", "Light mode", "\U0001f532 Planned", "In BUILD-SPEC, intentionally removed", ""],
            ["7.7", "Animated score gauge", "\u2705 Built", "SVG half-circle, 1s ease-out fill", ""],
            ["7.8", "Dune Powered-by footer", "\u2705 Built", "Attribution logo", ""],
        ]
    ),
    divider(),
    heading("8. x402 Paid API \u2014 PRIORITY FEATURE", 2),
    callout("This is the monetization layer. Every AI agent or protocol with Solana users hits our endpoint, pays a micro-fee in SOL, and gets wallet score data back.", "\U0001f680"),
    paragraph(""),
    heading("Concept", 3),
    paragraph("Standard: x402 protocol (HTTP 402 Payment Required)"),
    paragraph("Flow: Agent sends request -> gets 402 with payment details -> pays via Solana -> re-sends with payment proof -> receives score data"),
    paragraph("Fee: Micro-payment in SOL (e.g. 0.0001 SOL per query, ~$0.01)"),
    paragraph(""),
    heading("What to Build", 3),
    table(
        ["#", "Sub-feature", "Description", "Priority"],
        [
            ["8.1", "402 middleware", "Payment-gating layer, returns 402 + payment instructions", "P0"],
            ["8.2", "Solana payment verification", "Verify on-chain SOL transfer before serving response", "P0"],
            ["8.3", "GET /api/v1/score", "Paid endpoint: same data as /api/score behind x402", "P0"],
            ["8.4", "POST /api/v1/scores", "Batch paid endpoint: multiple wallets", "P1"],
            ["8.5", "Payment receipt tracking", "Log payments + queries for analytics", "P1"],
            ["8.6", "Usage dashboard", "Protocol-facing dashboard: API usage + spend", "P2"],
            ["8.7", "Tiered pricing", "Volume discounts for high-usage protocols", "P2"],
            ["8.8", "SDK / npm package", "@slice-analytics/solana-score wrapper", "P2"],
        ]
    ),
    paragraph(""),
    heading("Open Questions", 3),
    todo("What SOL amount per query? (low enough for agents to use freely)"),
    todo("Accept USDC via x402 as well?"),
    todo("Revenue split / treasury wallet address?"),
    todo("Rate limits for paid tier vs free tier?"),
    todo("Keep a free tier? (e.g. 100 queries/day free, then paid)"),
    divider(),
    heading("9. Infrastructure and Ops", 2),
    table(
        ["#", "Feature", "Status", "Notes", "Decision"],
        [
            ["9.1", "Vercel hosting", "\u2705 Built", "Deployed on Vercel", ""],
            ["9.2", "Environment variables", "\u2705 Built", "DUNE_API_KEY in .env.local", ""],
            ["9.3", "Edge runtime (OG)", "\u2705 Built", "OG images on Vercel Edge", ""],
            ["9.4", "Error handling and fallbacks", "\u2705 Built", "400/404/500 + mock fallback", ""],
            ["9.5", "Persistent cache (Redis/KV)", "\U0001f4a1 Proposed", "Vercel KV to survive redeploys", ""],
            ["9.6", "Monitoring / logging", "\U0001f4a1 Proposed", "Track API usage, errors, cache hits", ""],
            ["9.7", "CI/CD pipeline", "\U0001f4a1 Proposed", "Automated tests + preview deploys", ""],
        ]
    ),
    divider(),
    heading("10. Protocols and Data", 2),
    table(
        ["#", "Feature", "Status", "Notes", "Decision"],
        [
            ["10.1", "24 protocols tracked", "\u2705 Built", "6 sectors: DEX, Launchpad, Aggregator, Perps, Trading, Wallet", ""],
            ["10.2", "Protocol logos", "\u2705 Built", "PNG/JPG/SVG for all 24", ""],
            ["10.3", "Sector color coding", "\u2705 Built", "Purple=DEX, Green=Launchpad, Orange=Perps, etc.", ""],
            ["10.4", "Expand protocol coverage", "\U0001f4a1 Proposed", "Add Marinade, Tensor, Magic Eden, Jito, Sanctum", ""],
        ]
    ),
    divider(),
    heading("How to Use This Doc", 2),
    callout("1. Walk through each section together\n2. Fill the Decision column: Keep / Cut / Rework / Add (P0/P1/P2) / Defer\n3. Use the checkboxes in Section 8 for x402 open questions\n4. After review = clear build plan for next sprint", "\U0001f4dd"),
]

# Create page with first batch
page = api("pages", {
    "parent": {"page_id": PARENT_ID},
    "icon": {"type": "emoji", "emoji": "\U0001f4cb"},
    "properties": {
        "title": {"title": [{"text": {"content": "Feature Review & Decision Matrix"}}]}
    },
    "children": children_part1
})

page_id = page["id"]
print(f"Page created: {page['url']}")

# Append second batch
api(f"blocks/{page_id}/children", {"children": children_part2}, method="PATCH")
print("All sections added successfully!")
