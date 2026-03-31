import json
import urllib.request

TOKEN = os.environ.get("NOTION_TOKEN", "")
PAGE_ID = "32eb6328-b169-81bd-879d-ee9520527f21"
NOTION_VERSION = "2022-06-28"

def api(endpoint, data, method="PATCH"):
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

def callout(text, emoji):
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

children = [
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

result = api(f"blocks/{PAGE_ID}/children", {"children": children})
print("All remaining sections appended successfully!")
