import json
import urllib.request
import sys
sys.stdout.reconfigure(encoding='utf-8')

TOKEN = os.environ.get("NOTION_TOKEN", "")
NOTION_VERSION = "2022-06-28"
DB_ID = "32eb6328-b169-80d4-8b8f-d81d896c22ed"
JACOB = "1dc83e3d-7cf1-4844-9ccb-b151d15ebee2"

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

def bullet(text):
    return {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {
        "rich_text": [{"type": "text", "text": {"content": text}}]
    }}

def numbered(text):
    return {"object": "block", "type": "numbered_list_item", "numbered_list_item": {
        "rich_text": [{"type": "text", "text": {"content": text}}]
    }}

def todo(text):
    return {"object": "block", "type": "to_do", "to_do": {
        "rich_text": [{"type": "text", "text": {"content": text}}], "checked": False
    }}

# Create the task in the timeline DB
page = api("pages", {
    "parent": {"database_id": DB_ID},
    "icon": {"type": "emoji", "emoji": "\U0001f3a8"},
    "properties": {
        "Name": {"title": [{"text": {"content": "Final UI Review - Score Display Polish"}}]},
        "Date": {"date": {"start": "2026-03-26", "end": "2026-03-27"}},
        "Assign": {"people": [{"id": JACOB}]},
        "Status": {"status": {"name": "In progress"}}
    }
})

page_id = page["id"]
print(f"Task created: {page['url']}")

part1 = [
    callout("Jacob to pick one option per section. Fixed: gauge number overlap. Pending: sector display + color coding.", "\U0001f3a8"),
    p("Bug fix applied: Score gauge 0/50/100 labels repositioned outside the arc.", bold=True),
    divider(),

    h2("A. Sector Scores Display - Pick One"),
    p("Current: 5 small cards in a horizontal row with tiny progress bars. Feels cramped, hard to read at a glance."),
    p(""),

    numbered("Radar Chart - Single polygon on a 5-axis web chart. Each axis is a sector. Filled area shows your profile shape. Classic 'character stats' feel. Pros: instantly shows strengths vs weaknesses, visually distinct from the bar charts above. Cons: harder to read exact values."),

    numbered("Stacked Ring - 5 concentric half-rings (like nested gauges), each a different sector color. Thicker = higher score. Compact, works in the same card width as the score gauge. Legend below with sector names. Pros: compact, visually striking. Cons: less precise."),

    numbered("Horizontal Bars with Icons - Similar to the main score breakdown but styled differently: each sector gets an icon/emoji, a colored bar, the score number, and a small 'top protocols' tag below the bar (e.g. 'Raydium, Orca'). Full-width card. Pros: easy to read, consistent with breakdown. Cons: looks similar to section above."),

    numbered("Heat Map Grid - 5 cells in a single row, each cell filled with color intensity based on score (0=dark/empty, 100=fully saturated). Sector name + score number centered in each cell. Like a GitHub contribution chart but for sectors. Pros: minimal, scannable. Cons: less visual impact."),

    numbered("Pill Badges - 5 horizontal pills/tags, each with sector name + score. Color-coded by sector. Sorted by score (highest first). Active protocols shown as tiny dots below each pill. Compact, fits inline. Pros: lightest weight, works on mobile. Cons: least visual."),
    divider(),

    h2("B. Score Bar Color Coding - Pick One"),
    p("Current: Bars turn red below 50, which feels punishing. Low scores look like failures even though many users legitimately have low protocol diversity or are new."),
    p(""),

    numbered("Single Gradient (Purple to Cyan) - All bars use the same purple-to-cyan gradient regardless of score. Lower scores just have shorter bars. The number beside the bar stays white/light gray. No color judgment. Pros: clean, no negative feeling. Cons: less information at a glance."),

    numbered("Warm to Cool Progression - Low scores use a warm amber/gold (not red), mid-range use the brand purple, high scores use cyan/green. Feels like a temperature scale rather than pass/fail. 0-40: amber, 41-70: purple, 71-100: cyan. Pros: still informative but not alarming. Cons: amber might still feel 'warning'."),

    numbered("Opacity Scale - All bars use the brand purple-to-green gradient, but low scores have lower opacity (more transparent). High scores are fully vivid. Score numbers stay white regardless. Bars feel 'building up' rather than 'failing down'. Pros: subtle, elegant. Cons: very low scores might be hard to see."),

    numbered("Tier-Matched Colors - Each bar color matches the user's overall tier color (Whale=cyan, Power User=violet, Active=emerald, etc.). All 4 bars are the same color for a given user. Score numbers also match. Pros: consistent with tier system, feels cohesive. Cons: loses per-bar differentiation."),

    numbered("Sector-Tinted Bars - Each of the 4 main bars gets its own fixed color identity: Volume=purple, Diversity=blue, Activity=green, Holdings=cyan. These never change based on score value. Low scores just have short bars in their assigned color. Pros: each metric has identity, no judgment. Cons: 4 different colors might feel busy."),
    divider(),

    h2("Other Notes"),
    todo("Sector score display - pick option A1-A5"),
    todo("Color coding - pick option B1-B5"),
    todo("Review gauge fix on localhost:3000"),
]

api(f"blocks/{page_id}/children", {"children": part1}, method="PATCH")
print("Content written!")
print(f"View: {page['url']}")
