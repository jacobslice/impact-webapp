import json
import urllib.request
import sys
sys.stdout.reconfigure(encoding='utf-8')

TOKEN = os.environ.get("NOTION_TOKEN", "")
NOTION_VERSION = "2022-06-28"
PARENT_ID = "32eb6328-b169-80f1-86d5-d29905f9c960"

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
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())

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

def todo(text):
    return {"object": "block", "type": "to_do", "to_do": {
        "rich_text": [{"type": "text", "text": {"content": text}}], "checked": False
    }}

# Create page
page = api("pages", {
    "parent": {"page_id": PARENT_ID},
    "icon": {"type": "emoji", "emoji": "\U0001f4ca"},
    "properties": {
        "title": {"title": [{"text": {"content": "Data Gaps: Real vs Fake in Frontend"}}]}
    },
    "children": [
        callout("Audit of every data point shown to users. Goal: replace all estimated/mock data with real Dune data.", "\U0001f50d"),
        p("Audit date: 2026-03-30", bold=True),
        divider(),

        h2("What's REAL (no changes needed)"),
        p("These come directly from the Dune API response for each wallet:"),
        table(
            ["Data Point", "Source", "Component"],
            [
                ["Overall Score (0-100)", "Dune: score", "ScoreGauge"],
                ["Sybil Check (Pass/Fail)", "Dune: is_sybil", "StatsCards"],
                ["Network Fees", "Dune: network_fees_paid", "StatsCards"],
                ["Wallet Age", "Dune: months_active", "StatsCards"],
                ["Protocols Used (count)", "Dune: protocol_count", "StatsCards"],
                ["Protocol List", "Dune: protocols_used[]", "ProtocolGrid"],
                ["Tier (Whale/Power User/etc)", "Computed from score", "TierBadge"],
            ]
        ),
        divider(),

        h2("What's COMPUTED from real data (OK but verify)"),
        p("Calculated client-side from real Dune fields. Logic is sound but not validated against Dune's own scoring formula."),
        table(
            ["Data Point", "Formula", "Concern"],
            [
                ["Volume sub-score", "log10(protocol_fees + network_fees) / log10(500K) * 100", "Log scale max of 500K may not match Dune's bucketing"],
                ["Protocol Diversity sub-score", "protocol_count / 13 * 100", "Max of 13 is assumed, may need adjustment"],
                ["Activity sub-score", "months_active / 12 * 100", "Straightforward, should be accurate"],
                ["Holdings sub-score", "log10(current_holdings) / log10(100K) * 100", "Log scale max of 100K may not match Dune"],
                ["Sector scores (5 sectors)", "protocols in sector / total possible in sector * 100", "Based on protocol count only, doesn't factor fees per sector"],
            ]
        ),
        divider(),

        h2("What's ESTIMATED (needs real data from Dune)"),
        callout("These are formula-based guesses shown to users as if they're real. Must be replaced with actual data.", "\u26a0\ufe0f"),
        table(
            ["Data Point", "Current Source", "What It Shows", "What's Needed"],
            [
                ["Percentile", "estimatePercentile() formula", "Top X% (e.g. Top 2.1%)", "Tom: Add percent_rank() to Dune query, return as field"],
                ["Rank", "estimateRank() formula (assumes 30M wallets)", "#N (e.g. #630,000)", "Tom: Add row_number() to Dune query, return as field"],
            ]
        ),
        divider(),

        h2("What's FAKE (must replace with API data)"),
        callout("This is mock/hardcoded data displayed to users as real. Highest priority to fix.", "\U0001f6a8"),
        table(
            ["Data Point", "Current Source", "Where Shown", "What's Needed"],
            [
                ["Leaderboard (20 wallets)", "MOCK_LEADERBOARD in mock-data.ts", "Home, Dashboard, /leaderboard", "Tom: API endpoint returning top N wallets sorted by score"],
                ["Score Distribution (6 ranges)", "SCORE_DISTRIBUTION in mock-data.ts", "Dashboard, /leaderboard", "Tom: Dune query for count of wallets per score range"],
                ["Fallback Score Data", "MOCK_SCORE_DATA in mock-data.ts", "When API fails", "Keep as fallback but label clearly as demo data in UI"],
            ]
        ),
        divider(),

        h2("Tasks to close all gaps"),
        h3("Tom - Dune Query Changes"),
        todo("Add rank column to Dune query (row_number() ordered by score DESC)"),
        todo("Add percentile column to Dune query (percent_rank() ordered by score)"),
        todo("Create leaderboard endpoint or query: return top 50 wallets by score"),
        todo("Create score distribution query: count of wallets per score range (0-19, 20-39, 40-59, 60-79, 80-89, 90-100)"),
        todo("Optional: Add per-sector fee totals to query (dex_fees, launchpad_fees, etc.) for richer sector scores"),
        p(""),
        h3("Jacob - Frontend Wiring"),
        todo("Replace estimatePercentile() with real percentile from API response"),
        todo("Replace estimateRank() with real rank from API response"),
        todo("Replace MOCK_LEADERBOARD with API call to leaderboard endpoint"),
        todo("Replace SCORE_DISTRIBUTION with API call to distribution endpoint"),
        todo("Add loading states for leaderboard and distribution (currently instant from mock)"),
        todo("Add error/empty states if leaderboard API fails"),
    ]
})

print(f"Page created: {page['url']}")
