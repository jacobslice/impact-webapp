import json
import urllib.request
import sys
sys.stdout.reconfigure(encoding='utf-8')

TOKEN = os.environ.get("NOTION_TOKEN", "")
NOTION_VERSION = "2022-06-28"
TASK_ID = "32eb6328-b169-814a-8eb1-e476808f6c23"

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

def bullet(text):
    return {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {
        "rich_text": [{"type": "text", "text": {"content": text}}]
    }}

blocks = [
    divider(),
    h2("FINAL DECISION: Score Layout (2026-03-26)"),
    callout("Approved by Jacob. This replaces ALL prior score breakdown proposals above.", "\u2705"),
    p(""),

    h3("Stat Boxes (top of dashboard - raw values)"),
    p("4 quick-glance cards showing raw data, not scores:"),
    table(
        ["Stat Box", "Source Column", "Display Format", "Why Include"],
        [
            ["Sybil Check", "is_sybil", "PASS (green) / FAIL (red)", "Instant credibility signal - #1 thing protocols and agents care about"],
            ["Network Fees", "network_fees_paid", "X.XX SOL", "Raw on-chain commitment in native SOL"],
            ["Wallet Age", "months_active", "X months", "Quick glance at longevity"],
            ["Protocols Used", "protocol_count", "X protocols", "Simple count, easy flex"],
        ]
    ),
    p(""),

    h3("Score Breakdown Bars (4 bars, each 0-100)"),
    p("Each bar is a sub-score derived directly from Dune data. No fabricated data."),
    table(
        ["Score Name", "Weight", "Source Column(s)", "What It Measures"],
        [
            ["Volume", "40%", "protocol_fees_paid + network_fees_paid", "Total fees spent on-chain (protocol + network combined)"],
            ["Protocol Diversity", "30%", "protocol_count + protocols_used", "How many unique protocols the user has touched"],
            ["Activity", "20%", "months_active", "How consistently active over time"],
            ["Holdings", "10%", "current_holdings", "Current wallet balance in USD"],
        ]
    ),
    p(""),

    h3("Sector Scores (below main breakdown)"),
    p("Each sector gets its own score (0-100) based on protocols used + fees paid within that sector. Displayed as a second tier below the main 4 bars."),
    table(
        ["Sector", "Protocols", "Target Audience"],
        [
            ["DEX / Spot", "Raydium (CPMM/AMM/CLMM), Orca, Meteora, PumpSwap, ByReal", "Spot traders, liquidity-focused users"],
            ["Launchpad", "Pump.fun, Moonshot, LaunchLab, Lets Bonk, Bags, Believe", "Early adopters, memecoin degens, risk-takers"],
            ["Aggregator", "Jupiter Ultra v6, Jupiter Limit Order, Jupiter DCA", "Sophisticated traders who optimize execution"],
            ["Perpetuals", "Jupiter Perps, Drift Perps", "Derivatives traders, higher risk tolerance"],
            ["Trading Tools", "Axiom, Photon, Moonshot.money", "Tech-savvy users, likely use bots/frontends"],
        ]
    ),
    p(""),
    h3("How Sector Scores Are Used"),
    bullet("UI: Shown as a visual breakdown below the main 4 score bars (e.g. horizontal bars or radar chart per sector)"),
    bullet("x402 API: Protocols can filter/query by sector score - e.g. 'all wallets with Perps score > 70'"),
    bullet("Marketing: Users see which sectors they're strongest in - 'You're a DEX power user'"),
    p(""),

    h3("What's NOT Shown in UI (but available via API)"),
    table(
        ["Field", "Reason to Exclude from UI", "Available in x402 API?"],
        [
            ["jup_fees_paid", "Jupiter-specific, clutters general UI", "Yes"],
            ["jup_staker", "Only 1% of users have this", "Yes"],
            ["jup_perps_user", "Feeds into Perps sector score instead", "Yes"],
            ["is_sybil classification (A/B/C)", "Users see Pass/Fail, not the raw code", "Yes - full classification"],
        ]
    ),
    divider(),

    h3("Action Items"),
    p("Tom:", bold=True),
    bullet("Confirm Dune query can break fees out by sector (or if we compute client-side from protocols_used)"),
    bullet("Add rank + percentile columns to Dune query"),
    p("Jacob + Claude:", bold=True),
    bullet("Update UI: Replace 6-bar breakdown with 4 real bars (Volume, Protocol Diversity, Activity, Holdings)"),
    bullet("Update UI: Replace stat cards with Sybil Check, Network Fees, Wallet Age, Protocols Used"),
    bullet("Add sector score visualization below main breakdown"),
    bullet("Add Sybil Pass/Fail badge styling (green/red)"),
    bullet("Update mock data to match new structure"),
]

api(f"blocks/{TASK_ID}/children", {"children": blocks})
print("Task updated with final decisions!")
print(f"View: https://www.notion.so/sliceanalytics/32eb6328b169814a8eb1e476808f6c23")
