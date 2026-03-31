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

def todo(text, checked=False):
    return {"object": "block", "type": "to_do", "to_do": {
        "rich_text": [{"type": "text", "text": {"content": text}}], "checked": checked
    }}

# ============================================================
# Part 1: Analysis
# ============================================================
part1 = [
    h2("Audit Results"),
    p("Analysis date: 2026-03-26 | Dataset: 35.6M wallets | Dune Query 6576517", bold=True),
    divider(),

    h2("Problem: Current UI Lies About Our Data"),
    callout("We show 6 score breakdown bars (TX Volume, Protocol Diversity, Account Age, DeFi Activity, NFT Engagement, Governance) but our Dune query only scores on 5 factors across 2 categories. NFT Engagement and Governance are completely fabricated - 0 users in our dataset have NFT or governance protocol data.", "\u26a0\ufe0f"),
    p(""),
    h3("What Dune Actually Scores (from DATA-DICTIONARY.md)"),
    table(
        ["Category", "Factor", "Weight", "Dune Column", "Real Data?"],
        [
            ["Value (50%)", "Protocol Fees Paid", "30%", "protocol_fees_paid (USD)", "YES - rich data"],
            ["Value (50%)", "Network Fees Paid", "10%", "network_fees_paid (SOL)", "YES - rich data"],
            ["Value (50%)", "Current Holdings", "10%", "current_holdings (USD)", "YES - rich data"],
            ["Activity (50%)", "Protocol Diversity", "30%", "protocol_count + protocols_used", "YES - rich data"],
            ["Activity (50%)", "Consistency", "20%", "months_active (1-12)", "YES - rich data"],
        ]
    ),
    p(""),
    h3("What We Show in the UI vs Reality"),
    table(
        ["Current UI Bar", "Maps To Real Data?", "Verdict"],
        [
            ["Transaction Volume", "Partially - protocol_fees_paid + network_fees_paid", "REWORK - rename to 'Fees Paid'"],
            ["Protocol Diversity", "YES - protocol_count", "KEEP"],
            ["Account Age", "YES - months_active", "KEEP - rename to 'Consistency'"],
            ["DeFi Activity", "Partially - overlaps with fees/diversity", "REWORK - replace with Holdings"],
            ["NFT Engagement", "NO - zero NFT data in dataset", "CUT"],
            ["Governance", "NO - zero governance data in dataset", "CUT"],
        ]
    ),
    divider(),

    h2("Recommendation: New Score Breakdown (matches real Dune data)"),
    callout("Replace the 6 fake bars with 5 real ones that map 1:1 to the actual Dune scoring formula. Each bar shows the user's sub-score for that factor, computed from the raw data.", "\U0001f4a1"),
    p(""),
    table(
        ["New Bar Name", "Weight", "Source Column", "What It Measures", "Why It's Valuable"],
        [
            ["Protocol Fees", "30%", "protocol_fees_paid", "Total USD fees paid across protocols", "Direct measure of economic contribution - protocols care most about this"],
            ["Network Fees", "10%", "network_fees_paid", "SOL paid to validators", "Shows on-chain activity volume - sybils have very low network fees"],
            ["Holdings", "10%", "current_holdings", "Current USD token balances", "Skin in the game - commitment to ecosystem"],
            ["Protocol Diversity", "30%", "protocol_count", "# unique protocols used", "Organic vs bot behavior - real users explore multiple protocols"],
            ["Consistency", "20%", "months_active", "Months active (1-12)", "Longevity - filters out short-lived farm wallets"],
        ]
    ),
    p("This maps exactly to the 50/50 Value/Activity split in the Dune query. No fabricated data."),
    divider(),
]

part2 = [
    h2("Sector Breakdown: The Real Differentiator"),
    callout("Break Protocol Diversity into sector-level scores. Every protocol in the Dune dataset already has a sector tag. This lets individual protocols target power users in THEIR vertical.", "\U0001f680"),
    p(""),
    h3("Proposed Sectors (from current protocol data)"),
    table(
        ["Sector", "Protocols in Dataset", "Count", "What It Tells Protocols"],
        [
            ["DEX / Spot", "Raydium, Orca, Meteora, PumpSwap, ByReal", "7 variants", "Active spot trader - cares about liquidity, slippage"],
            ["Launchpad / Memecoins", "Pump.fun, Moonshot, LaunchLab, Lets Bonk, Bags, Believe", "6", "Early adopter, risk-taker, memecoin degen"],
            ["Aggregator", "Jupiter Ultra v6, Jupiter Limit Order, Jupiter DCA", "3", "Sophisticated trader - uses routing for best execution"],
            ["Perpetuals", "Jupiter Perps, Drift Perps", "2", "Derivatives trader - higher sophistication + risk tolerance"],
            ["Trading Tools", "Axiom, Photon, Moonshot.money", "3", "Uses frontends/bots - tech-savvy, likely higher volume"],
        ]
    ),
    p(""),
    h3("How Sector Scores Work"),
    bullet("Each user gets a sector score (0-100) based on: number of protocols used in that sector + fees paid to that sector"),
    bullet("A user who used Raydium + Orca + Meteora gets a high DEX score"),
    bullet("A user who only used Pump.fun gets a high Launchpad score but low everything else"),
    bullet("Protocols see: 'This wallet is a Perps power user (score: 85) who also trades spot (score: 60)'"),
    p(""),
    h3("What This Unlocks for the x402 API"),
    bullet("Jupiter can query: 'Give me all wallets with Aggregator score > 70 that have never used Perps' -> targeted Perps onboarding"),
    bullet("Drift can query: 'Show me Perps users with high Holdings score' -> whale outreach"),
    bullet("Pump.fun can query: 'Find Launchpad power users who are also active on DEX' -> cross-sell"),
    bullet("Any protocol can find their power users AND adjacent users who might convert"),
    divider(),

    h2("Sybil Data: Hidden Asset"),
    callout("182 out of 200 sampled wallets have sybil flags. The is_sybil field has 4 classifications (A, B, C, C-Atomic). Currently we ignore this - but it's one of our most valuable data points for protocols and agents.", "\U0001f50d"),
    table(
        ["Sybil Class", "Definition", "Dataset Frequency", "Value to Protocols"],
        [
            ["A", "Didn't transact across 3+ weeks with >$5", "Most common", "Low engagement filter"],
            ["B", "Failure rate >50% across all transactions", "Moderate", "Bot/spam detection"],
            ["C", "90%+ of txs are A->B->A loops (10min window)", "Low", "Wash trading detection"],
            ["C (Atomic)", "90%+ of txs are same-token-in/out in single tx", "Low", "Atomic arb bot detection"],
            ["NULL", "Passed all sybil checks", "~10% of wallets", "Verified organic user"],
        ]
    ),
    bullet("Recommendation: Expose sybil classification in the x402 API response. Protocols will pay extra for this."),
    bullet("In the UI: Show a 'Verified Human' or 'Organic Activity' badge for NULL sybil wallets"),
    divider(),

    h2("Jupiter-Specific Data"),
    p("We have 3 Jupiter-specific columns that most users DON'T have data for:", bold=True),
    table(
        ["Column", "Has Data", "Recommendation"],
        [
            ["jup_fees_paid", "27/200 (13.5%)", "Keep in API, don't show in UI breakdown"],
            ["jup_staker", "2/200 (1%)", "Keep in API response, useful for Jupiter specifically"],
            ["jup_perps_user", "2/200 (1%)", "Keep in API, feeds into Perps sector score"],
        ]
    ),
    bullet("These are valuable for Jupiter's own use case via x402 but shouldn't clutter the general UI"),
    divider(),

    h2("Data Quality Notes"),
    bullet("35.6M wallets in dataset - massive coverage"),
    bullet("Score distribution is heavily bottom-weighted: median score is 0, mean is ~5. Most wallets are low-activity."),
    bullet("Top scorers (99+) have 10-13 protocols, $100K-500K+ in fees, 12 months active"),
    bullet("Jupiter Ultra v6 appears in 99% of sampled wallets (it's the default aggregator route)"),
    bullet("Holdings data may miss some low-cap memecoins (noted in DATA-DICTIONARY)"),
    divider(),

    h2("Action Items for Tom"),
    todo("Keep the 5-factor Dune scoring formula as-is (it's solid)"),
    todo("Add per-sector protocol counts + fees to the query output (new columns: dex_count, launchpad_count, aggregator_count, perps_count, tools_count + corresponding _fees columns)"),
    todo("Add rank column (computed in Dune - row_number by score DESC)"),
    todo("Add percentile column (computed in Dune - percent_rank by score)"),
    todo("Consider: Should sector scores be computed in Dune or client-side from protocols_used?"),
    p(""),
    h2("Action Items for Jacob"),
    todo("Replace 6-bar breakdown with 5 real bars: Protocol Fees, Network Fees, Holdings, Protocol Diversity, Consistency"),
    todo("Add sector breakdown visualization below the main 5 bars (radar chart or horizontal bars per sector)"),
    todo("Add 'Verified Human' badge for wallets with is_sybil = NULL"),
    todo("Remove NFT Engagement and Governance from all UI references"),
    todo("Update mock data to reflect real data shapes"),
]

# Write to Notion task page
result = api(f"blocks/{TASK_ID}/children", {"children": part1})
print("Part 1 written")

result = api(f"blocks/{TASK_ID}/children", {"children": part2})
print("Part 2 written")

# Update task status to In Progress
api(f"pages/{TASK_ID}", {
    "properties": {
        "Status": {"status": {"name": "In progress"}}
    }
})
print("Task status: In progress")
print(f"\nDone! View: https://www.notion.so/Audit-score-breakdown-map-real-Dune-data-to-6-factors-32eb6328b169814a8eb1e476808f6c23")
