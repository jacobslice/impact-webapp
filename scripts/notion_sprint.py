import json
import urllib.request
import sys
sys.stdout.reconfigure(encoding='utf-8')

TOKEN = os.environ.get("NOTION_TOKEN", "")
PARENT_ID = "32eb6328-b169-80f1-86d5-d29905f9c960"  # Solana Score Webapp page
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

def h1(text):
    return {"object": "block", "type": "heading_1", "heading_1": {"rich_text": [{"type": "text", "text": {"content": text}}]}}

def h2(text):
    return {"object": "block", "type": "heading_2", "heading_2": {"rich_text": [{"type": "text", "text": {"content": text}}]}}

def h3(text):
    return {"object": "block", "type": "heading_3", "heading_3": {"rich_text": [{"type": "text", "text": {"content": text}}]}}

def p(text, bold=False):
    return {"object": "block", "type": "paragraph", "paragraph": {
        "rich_text": [{"type": "text", "text": {"content": text}, "annotations": {"bold": bold, "italic": False, "strikethrough": False, "underline": False, "code": False, "color": "default"}}] if text else []
    }}

def callout(text, emoji):
    return {"object": "block", "type": "callout", "callout": {
        "rich_text": [{"type": "text", "text": {"content": text}}],
        "icon": {"type": "emoji", "emoji": emoji}
    }}

def divider():
    return {"object": "block", "type": "divider", "divider": {}}

def table_row(cells):
    return {"type": "table_row", "table_row": {
        "cells": [[{"type": "text", "text": {"content": c}}] for c in cells]
    }}

def table(headers, rows):
    children = [table_row(headers)] + [table_row(r) for r in rows]
    return {"object": "block", "type": "table", "table": {
        "table_width": len(headers), "has_column_header": True, "has_row_header": False, "children": children
    }}

def todo(text, checked=False):
    return {"object": "block", "type": "to_do", "to_do": {
        "rich_text": [{"type": "text", "text": {"content": text}}], "checked": checked
    }}

def bullet(text):
    return {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {
        "rich_text": [{"type": "text", "text": {"content": text}}]
    }}

# ============================================================
# PAGE CREATION - Part 1
# ============================================================
part1 = [
    callout("Sprint plan derived from Feature Review decisions (2026-03-25). Two workstreams running in parallel.", "\U0001f3af"),
    p("Team: Jacob (design, UX, identity, infra, marketing) + Tom/DangyWing (API, x402 payments, Dune/database, leaderboard data)", bold=True),
    p("Claude assists Jacob on implementation. Tom works independently on backend/data."),
    divider(),

    # ============================================================
    # ACTION ITEMS SUMMARY
    # ============================================================
    h1("Action Items by Section"),

    h2("1. Core Scoring Engine"),
    callout("Owner: Tom (Dune query changes) + Jacob (UI updates)", "\U0001f4a1"),
    todo("1.2 Rework tier classification - Review current 7 tiers, simplify or adjust thresholds based on actual data distribution"),
    todo("1.3 Rework score breakdown - Audit which of the 6 factors we actually have Dune data for. Remove fake/placeholder factors, replace with real ones"),
    todo("1.4 Rework caching - Remove devtools cache editing. Keep 10-min in-memory cache but don't expose in devtools"),
    todo("1.6 Rework percentile/rank - Tom: Add rank and percentile columns to Dune query 6576517 so these are computed server-side, not estimated client-side"),
    todo("1.7 Rework per-protocol tracking - Replace with sector-specific scores (DeFi score, NFT score, etc.) instead of per-protocol fees"),
    p("CUT: 1.8 (7d/30d score deltas), 1.9 (persistent cache)"),
    divider(),

    h2("2. Pages & Routes"),
    callout("Owner: Jacob", "\U0001f4a1"),
    todo("2.3 Rework Dashboard slightly - TBD on specific changes, review with Tom after data rework"),
    todo("2.5 Rework For Protocols - Build out full Jupiter case study with real data and narrative"),
    todo("2.6 Cut Settings - Remove settings icon from sidebar nav entirely"),
    p("CUT: 2.7 (Rewards page). DEFER to V2: 2.8 (Protocol-specific pages)"),
    p("2.4 Leaderboard: TBD - decide after Section 6 rework"),
    divider(),

    h2("3. API Endpoints (Tom)"),
    callout("Owner: Tom", "\U0001f4a1"),
    todo("3.2 Rework OG scorecard - Update design/data shown on the generated PNG"),
    todo("3.3 x402 paid score endpoint - Build with Tom per Section 8 plan (P0)"),
    todo("3.4 Batch score lookup - Tom to investigate feasibility (POST /api/scores)"),
    p("CUT: 3.5 (IP rate limiting). MAYBE: 3.6 (API key auth)"),
    divider(),

    h2("4. Wallet & Identity (Jacob)"),
    callout("Owner: Jacob + Claude", "\U0001f4a1"),
    todo("4.1/4.2 Rework wallet connection - Replace @solana/wallet-adapter with Dynamic.xyz (or similar) for multi-wallet, better UX"),
    todo("4.4 Rework Twitter linking - Remove manual handle entry. Implement real Twitter/X OAuth connect"),
    todo("4.6 Add .sol domain resolution - Wire up SNS (Solana Name Service) resolution in search bar"),
    p("DEFER to V2: 4.7 (Multi-wallet aggregation)"),
    divider(),

    h2("5. Social & Sharing (Jacob)"),
    callout("Owner: Jacob + Claude", "\U0001f4a1"),
    todo("5.4 Add scorecard download - 'Save as PNG' button on dashboard/score page"),
    todo("5.5 Farcaster sharing - Evaluate, no decision yet"),
    p("KEEP as-is: 5.1 (Share on X), 5.2 (OG image), 5.3 (Twitter PFP)"),
    divider(),

    h2("6. Leaderboard & Analytics (Tom)"),
    callout("Owner: Tom (data) + Jacob (UI)", "\U0001f4a1"),
    todo("6.1 Rework leaderboard - Expand to top 50, add pagination (tab through pages). Cut leaderboard from individual score pages"),
    todo("6.2/6.3 Rework distribution + tiers - Update to match new tier system from Section 1"),
    todo("6.7 Add new wallet filtering - When a new wallet is queried, check if it passes threshold for scoring and placement in dataset"),
    p("DEFER to V2: 6.4 (real-time refresh), 6.5 (TX history), 6.6 (filters)"),
]

part2 = [
    divider(),

    h2("7. Design & UX (Jacob)"),
    callout("Owner: Jacob + Claude. No specific decisions marked yet - review during sprint.", "\U0001f4a1"),
    todo("7.5 Mobile-optimize layout - Make responsive design work properly on mobile"),
    todo("Review all design elements after data/tier rework to ensure consistency"),
    p("KEEP as-is: Theme, logo, sidebar, topbar, gauge, footer"),
    divider(),

    h2("8. x402 Paid API (Tom)"),
    callout("Owner: Tom/DangyWing leads. This is the revenue engine.", "\U0001f680"),
    p("Key decisions made:", bold=True),
    bullet("Tom to lead pricing proposal (SOL amount per query)"),
    bullet("Accept both USDC and SOL"),
    bullet("No free tier - all queries are paid ('pay us')"),
    bullet("No rate limits for paid tier"),
    p(""),
    todo("8.1 Build 402 middleware (P0)"),
    todo("8.2 Solana payment verification (P0)"),
    todo("8.3 GET /api/v1/score - paid endpoint (P0)"),
    todo("8.4 POST /api/v1/scores - batch endpoint (P1)"),
    todo("8.5 Payment receipt tracking (P1)"),
    p("DEFER to V2: 8.6 (Usage dashboard), 8.7 (Tiered pricing), 8.8 (SDK)"),
    divider(),

    h2("9. Infrastructure (Jacob starts, Tom reviews)"),
    callout("Owner: Jacob + Claude, Tom reviews", "\U0001f4a1"),
    todo("9.6 Set up monitoring in Vercel - Use Vercel Analytics/Logs for API usage and error tracking"),
    p("KEEP as-is: 9.1-9.4 (Vercel, env vars, Edge runtime, error handling)"),
    p("DEFER to V2: 9.5 (Redis/KV cache), 9.7 (CI/CD)"),
    divider(),

    h2("10. Protocols & Data (Jacob)"),
    callout("Owner: Jacob + Claude", "\U0001f4a1"),
    todo("10.3 Rework sector color coding - Update colors/categorization"),
    p("KEEP as-is: 10.1 (24 protocols), 10.2 (logos)"),
    p("DEFER to V2: 10.4 (expand coverage)"),
    divider(),

    h2("11. Marketing (Jacob)"),
    callout("Owner: Jacob + Claude", "\U0001f4a1"),
    todo("11.1 List on agentic marketplaces - Research and list on Bazaar and similar platforms"),
    todo("Identify other AI agent marketplaces and directories to list on"),
    todo("Prepare marketing copy and assets for marketplace listings"),
    divider(),

    # ============================================================
    # SPRINT TIMELINE
    # ============================================================
    h1("Sprint Timeline"),
    callout("2-week sprint: March 26 - April 8, 2026", "\U0001f4c5"),
    p(""),

    h2("Week 1: March 26-31 (Foundation)"),
    h3("Tom / DangyWing - Week 1"),
    table(
        ["Day", "Task", "Priority", "Status"],
        [
            ["Mar 26-27", "1.6 Add rank + percentile columns to Dune query", "P0", ""],
            ["Mar 26-27", "1.3 Audit score breakdown factors - document which have real data", "P0", ""],
            ["Mar 27-28", "1.2 Propose new tier thresholds based on actual data distribution", "P0", ""],
            ["Mar 28-29", "1.7 Design sector-specific scoring (DeFi, NFT, etc.)", "P1", ""],
            ["Mar 28-31", "8.1-8.2 x402 middleware + Solana payment verification (P0)", "P0", ""],
            ["Mar 29-31", "6.7 New wallet filtering logic - threshold + placement", "P1", ""],
            ["Mar 31", "x402 pricing proposal (SOL + USDC amounts)", "P0", ""],
        ]
    ),
    p(""),
    h3("Jacob + Claude - Week 1"),
    table(
        ["Day", "Task", "Priority", "Status"],
        [
            ["Mar 26", "2.6 Remove settings icon from sidebar", "P0", ""],
            ["Mar 26-27", "4.1/4.2 Research + implement Dynamic.xyz wallet connection", "P0", ""],
            ["Mar 27-28", "4.4/4.5 Implement Twitter/X OAuth (replace localStorage)", "P0", ""],
            ["Mar 28-29", "4.6 Wire up .sol domain resolution (SNS)", "P1", ""],
            ["Mar 29-31", "7.5 Mobile-optimize layout", "P1", ""],
            ["Mar 31", "9.6 Set up Vercel Analytics monitoring", "P1", ""],
        ]
    ),
    p(""),

    h2("Week 2: April 1-8 (Features + Polish)"),
    h3("Tom / DangyWing - Week 2"),
    table(
        ["Day", "Task", "Priority", "Status"],
        [
            ["Apr 1-2", "8.3 GET /api/v1/score - paid endpoint behind x402", "P0", ""],
            ["Apr 2-3", "6.1 Expand leaderboard to top 50 + pagination data", "P0", ""],
            ["Apr 3-4", "3.4 Batch score lookup endpoint (if feasible)", "P1", ""],
            ["Apr 4-5", "8.4 POST /api/v1/scores - batch paid endpoint", "P1", ""],
            ["Apr 5-7", "8.5 Payment receipt tracking/logging", "P1", ""],
            ["Apr 7-8", "Review Jacob's infra changes + integration testing", "P1", ""],
        ]
    ),
    p(""),
    h3("Jacob + Claude - Week 2"),
    table(
        ["Day", "Task", "Priority", "Status"],
        [
            ["Apr 1-2", "6.1 UI: Leaderboard pagination + remove from individual pages", "P0", ""],
            ["Apr 2-3", "2.5 Rework For Protocols page - full Jupiter case study", "P1", ""],
            ["Apr 3-4", "5.4 Add scorecard download (Save as PNG)", "P1", ""],
            ["Apr 4-5", "3.2 Rework OG scorecard design", "P1", ""],
            ["Apr 5-6", "10.3 Rework sector color coding", "P2", ""],
            ["Apr 6-7", "11.1 List on Bazaar + research other agentic marketplaces", "P1", ""],
            ["Apr 7-8", "Update dashboard (2.3) after Tom's data changes land", "P1", ""],
            ["Apr 8", "End-of-sprint review + polish pass", "P1", ""],
        ]
    ),
    divider(),

    h2("Dependencies"),
    callout("These tasks have cross-team dependencies - coordinate timing.", "\u26a0\ufe0f"),
    bullet("Jacob's dashboard rework (2.3) BLOCKED BY Tom's tier + score breakdown rework (1.2, 1.3)"),
    bullet("Jacob's leaderboard UI (6.1) BLOCKED BY Tom's leaderboard data expansion (6.1 data)"),
    bullet("Jacob's tier/distribution UI updates (6.2/6.3) BLOCKED BY Tom's new tier definitions (1.2)"),
    bullet("x402 endpoint (8.3) BLOCKED BY x402 middleware + payment verification (8.1, 8.2)"),
    bullet("Batch paid endpoint (8.4) BLOCKED BY single endpoint working first (8.3)"),
    divider(),

    h2("V2 Backlog (Post-Sprint)"),
    table(
        ["#", "Feature", "Notes"],
        [
            ["2.8", "Protocol-specific pages", "/protocol/jupiter deep-dives"],
            ["4.7", "Multi-wallet aggregation", "Link wallets, aggregate scores"],
            ["6.4", "Real-time leaderboard refresh", "Daily/weekly Dune sync"],
            ["6.5", "Activity transaction history", "Per-wallet TX timeline"],
            ["6.6", "Leaderboard filters", "By tier, protocol, time range"],
            ["8.6", "Usage dashboard", "Protocol-facing API analytics"],
            ["8.7", "Tiered pricing", "Volume discounts"],
            ["8.8", "SDK / npm package", "@slice-analytics/solana-score"],
            ["9.5", "Persistent cache (Redis/KV)", "Vercel KV"],
            ["9.7", "CI/CD pipeline", "Automated tests + preview deploys"],
            ["10.4", "Expand protocol coverage", "Marinade, Tensor, Magic Eden, Jito, Sanctum"],
        ]
    ),
]

# Create page
page = api("pages", {
    "parent": {"page_id": PARENT_ID},
    "icon": {"type": "emoji", "emoji": "\U0001f680"},
    "properties": {
        "title": {"title": [{"text": {"content": "Sprint Plan: March 26 - April 8"}}]}
    },
    "children": part1
})

page_id = page["id"]
print(f"Page created: {page['url']}")

# Append part 2
api(f"blocks/{page_id}/children", {"children": part2}, method="PATCH")
print("Sprint plan complete!")
