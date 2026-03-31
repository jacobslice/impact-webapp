import json
import urllib.request
import sys
sys.stdout.reconfigure(encoding='utf-8')

TOKEN = os.environ.get("NOTION_TOKEN", "")
NOTION_VERSION = "2022-06-28"
PAGE_ID = "333b6328-b169-8167-9475-f5f4bdb202b1"

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
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())

def h1(t):
    return {"object": "block", "type": "heading_1", "heading_1": {"rich_text": [{"type": "text", "text": {"content": t}}]}}
def h2(t):
    return {"object": "block", "type": "heading_2", "heading_2": {"rich_text": [{"type": "text", "text": {"content": t}}]}}
def h3(t):
    return {"object": "block", "type": "heading_3", "heading_3": {"rich_text": [{"type": "text", "text": {"content": t}}]}}
def p(t, bold=False):
    return {"object": "block", "type": "paragraph", "paragraph": {
        "rich_text": [{"type": "text", "text": {"content": t}, "annotations": {"bold": bold, "italic": False, "strikethrough": False, "underline": False, "code": False, "color": "default"}}] if t else []
    }}
def callout(t, emoji):
    return {"object": "block", "type": "callout", "callout": {
        "rich_text": [{"type": "text", "text": {"content": t}}],
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
def bullet(t):
    return {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {
        "rich_text": [{"type": "text", "text": {"content": t}}]
    }}

# Append updates section at the bottom
updates = [
    divider(),
    h1("UPDATES (2026-03-30)"),
    callout("Changes from Jacob's review. These override the sections above.", "\u270f\ufe0f"),
    p(""),

    h2("Supplies - REVISED"),
    table(
        ["Supply", "Original", "Updated Crypto Version", "Effect"],
        [
            ["Bulls", "Oxen", "Bulls (pull the wagon)", "Positive crypto correlation. Lose a bull = slower progress. 'One of your bulls got spooked by a red candle.'"],
            ["Food", "Food", "McDonald's Burgers", "Keeps party alive. 'Your party is surviving on Big Macs and McFlurries.' Running low: 'Down to the dollar menu.'"],
            ["Ammunition", "Ammunition", "SOL for Gas", "Needed for hunting/trading. Same as before."],
            ["Spare Parts", "Wagon parts", "Seed Phrases", "Same as before. Lose them = catastrophic."],
            ["Clothing", "Clothing", "Protocol Merch", "Wear your favorite protocol's merch. Jupiter hoodie, Phantom cap, Drift tee. Keeps morale up."],
            ["Medicine", "Medicine", "Carnivore Diet (Raw Meat, Steaks, Eggs)", "'Your party switches to raw steak and eggs. Health restored.' 'The carnivore diet cured what McDonald's caused.'"],
        ]
    ),
    p(""),

    h2("SBF Jail Scene - NEW"),
    callout("At the start of the journey (Independence), the party passes a jail cell. Inside: Sam Bankman-Fried (SBF). He calls out to your party.", "\U0001f6d1"),
    bullet("Visual: Pixel art jail cell with SBF character behind bars"),
    bullet("SBF: 'Hey traveler... I can get you 20% APY on your stablecoins if you leave them with me...'"),
    bullet("Player choice: 'Trust SBF' (lose all stablecoins) or 'Keep walking' (nothing happens)"),
    bullet("If you trust him: 'SBF has absconded with your McDonald's money. Your party is hungry.'"),
    bullet("Tombstone reference: 'Here lies your stablecoins. FTX'd.'"),
    p(""),

    h2("Journey Length - REVISED"),
    callout("Game must be 3-5 minutes max. Plus a SKIP button to go directly to score.", "\u23e9"),
    bullet("Reduce to 4-5 landmark stops total (not 12)"),
    bullet("Pick the best landmarks: Independence (start + SBF jail) -> Jupiter Crossing -> Pump.fun Gulch -> Drift Canyon -> Willamette Valley (score reveal)"),
    bullet("1 hunting mini-game session"),
    bullet("1-2 river crossings"),
    bullet("3-4 random events max"),
    bullet("SKIP BUTTON: Always visible in corner. 'Skip to Score' takes user directly to the score reveal screen"),
    p(""),

    h2("Revised Game Flow"),
    bullet("1. Title screen - 'SOLANA TRAIL' CRT aesthetic"),
    bullet("2. Connect wallet - Score pre-loaded, hidden until end"),
    bullet("3. Enter Twitter handle + up to 4 party members"),
    bullet("4. Choose profession"),
    bullet("5. Buy supplies at Sol's General Store (bulls, McDonald's, SOL gas, seed phrases, protocol merch, raw meat)"),
    bullet("6. Pass SBF's jail cell - trust him or keep walking"),
    bullet("7. Landmark 1: Jupiter Crossing (river crossing decision)"),
    bullet("8. Random event + Hunting mini-game"),
    bullet("9. Landmark 2: Pump.fun Gulch (ape or pass)"),
    bullet("10. Random event"),
    bullet("11. Landmark 3: Drift Canyon (leverage decision)"),
    bullet("12. Arrival - Score reveal + share on X"),
    bullet("SKIP: Available at any point -> jumps to step 12"),
    p(""),
    p("Total playtime: ~3-5 minutes for full run, instant for skip.", bold=True),
]

api(f"blocks/{PAGE_ID}/children", {"children": updates})
print("Updates added to Notion!")
print(f"View: https://www.notion.so/Solana-Trail-Game-Design-Doc-333b6328b16981679475f5f4bdb202b1")
