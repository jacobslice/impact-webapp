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

# Step 1: Delete all existing blocks on the page
print("Clearing existing content...")
req = urllib.request.Request(
    f"https://api.notion.com/v1/blocks/{TASK_ID}/children?page_size=100",
    headers={"Authorization": f"Bearer {TOKEN}", "Notion-Version": NOTION_VERSION}
)
with urllib.request.urlopen(req) as resp:
    existing = json.loads(resp.read())

for block in existing["results"]:
    try:
        api(f"blocks/{block['id']}", {}, method="DELETE")
    except:
        pass

print(f"Deleted {len(existing['results'])} blocks")

# Step 2: Helper functions
def h2(text):
    return {"object": "block", "type": "heading_2", "heading_2": {"rich_text": [{"type": "text", "text": {"content": text}}]}}

def h3(text):
    return {"object": "block", "type": "heading_3", "heading_3": {"rich_text": [{"type": "text", "text": {"content": text}}]}}

def p(text, bold=False):
    return {"object": "block", "type": "paragraph", "paragraph": {
        "rich_text": [{"type": "text", "text": {"content": text}, "annotations": {"bold": bold, "italic": False, "strikethrough": False, "underline": False, "code": False, "color": "default"}}] if text else []
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

# Step 3: Write clean content
blocks = [
    h2("Stat Boxes"),
    p("4 cards showing raw values at the top of the dashboard/score page."),
    table(
        ["Stat", "Source", "Format"],
        [
            ["Sybil Check", "is_sybil", "PASS (green) / FAIL (red)"],
            ["Network Fees", "network_fees_paid", "X.XX SOL"],
            ["Wallet Age", "months_active", "X months"],
            ["Protocols Used", "protocol_count", "X protocols"],
        ]
    ),
    divider(),

    h2("Score Breakdown (4 bars, 0-100)"),
    table(
        ["Score", "Weight", "Source"],
        [
            ["Volume", "40%", "protocol_fees_paid + network_fees_paid"],
            ["Protocol Diversity", "30%", "protocol_count"],
            ["Activity", "20%", "months_active"],
            ["Holdings", "10%", "current_holdings"],
        ]
    ),
    divider(),

    h2("Sector Scores"),
    p("Displayed below the main breakdown. Each sector scored 0-100 based on protocols used + fees in that sector."),
    table(
        ["Sector", "Protocols"],
        [
            ["DEX / Spot", "Raydium, Orca, Meteora, PumpSwap, ByReal"],
            ["Launchpad", "Pump.fun, Moonshot, LaunchLab, Lets Bonk, Bags, Believe"],
            ["Aggregator", "Jupiter Ultra v6, Jupiter Limit Order, Jupiter DCA"],
            ["Perpetuals", "Jupiter Perps, Drift Perps"],
            ["Trading Tools", "Axiom, Photon, Moonshot.money"],
        ]
    ),
    divider(),

    h2("Tasks - Tom"),
    todo("Break fees out by sector in Dune query (or confirm we compute client-side from protocols_used)"),
    todo("Add rank + percentile columns to Dune query"),
    p(""),

    h2("Tasks - Jacob"),
    todo("Replace 6-bar breakdown with 4 bars: Volume, Protocol Diversity, Activity, Holdings"),
    todo("Replace stat cards with: Sybil Check, Network Fees, Wallet Age, Protocols Used"),
    todo("Add sector score visualization below main breakdown"),
    todo("Add Sybil Pass/Fail badge (green/red)"),
    todo("Update mock data to match new structure"),
]

api(f"blocks/{TASK_ID}/children", {"children": blocks})
print("Clean task written!")
print(f"View: https://www.notion.so/sliceanalytics/32eb6328b169814a8eb1e476808f6c23")
