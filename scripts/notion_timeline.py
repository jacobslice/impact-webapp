import json
import urllib.request
import sys
sys.stdout.reconfigure(encoding='utf-8')

TOKEN = os.environ.get("NOTION_TOKEN", "")
NOTION_VERSION = "2022-06-28"
DB_ID = "32eb6328-b169-80d4-8b8f-d81d896c22ed"

TOM = "a1296e95-8794-4e79-9dd6-2d4ba2f17983"
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

def delete_page(page_id):
    api(f"pages/{page_id}", {"archived": True}, method="PATCH")

def create_task(name, start, end, assignees, status="Not started"):
    people = [{"id": uid} for uid in assignees]
    return api("pages", {
        "parent": {"database_id": DB_ID},
        "properties": {
            "Name": {"title": [{"text": {"content": name}}]},
            "Date": {"date": {"start": start, "end": end}},
            "Assign": {"people": people},
            "Status": {"status": {"name": status}}
        }
    })

# Delete placeholder cards
print("Deleting placeholder cards...")
query = api(f"databases/{DB_ID}/query", {})
for entry in query["results"]:
    title = "".join(t["plain_text"] for t in entry["properties"]["Name"]["title"])
    if title.startswith("Card"):
        delete_page(entry["id"])
        print(f"  Deleted: {title}")

print("\nCreating sprint tasks...\n")

# ============================================================
# SPRINT: March 26 - April 4 (tighter, ~8 working days)
# ============================================================

tasks = [
    # --- TOM: Week 1 (Mar 26-28) - Data Foundation ---
    ("Audit score breakdown - map real Dune data to 6 factors", "2026-03-26", "2026-03-26", [TOM]),
    ("Add rank + percentile columns to Dune query", "2026-03-26", "2026-03-27", [TOM]),
    ("Rework tier thresholds based on data distribution", "2026-03-27", "2026-03-28", [TOM]),
    ("Design sector-specific scoring model", "2026-03-28", "2026-03-28", [TOM]),
    ("x402 pricing proposal (SOL + USDC amounts)", "2026-03-28", "2026-03-28", [TOM]),

    # --- TOM: Week 2 (Mar 29 - Apr 2) - x402 + Leaderboard ---
    ("Build x402 middleware + payment verification", "2026-03-29", "2026-03-31", [TOM]),
    ("GET /api/v1/score - paid endpoint behind x402", "2026-03-31", "2026-04-01", [TOM]),
    ("Expand leaderboard to top 50 + pagination data", "2026-04-01", "2026-04-02", [TOM]),
    ("New wallet filtering - threshold + placement logic", "2026-04-01", "2026-04-02", [TOM]),
    ("Batch score lookup endpoint (POST /api/scores)", "2026-04-02", "2026-04-03", [TOM]),
    ("Payment receipt tracking + logging", "2026-04-03", "2026-04-04", [TOM]),
    ("Review Jacob's infra + integration testing", "2026-04-04", "2026-04-04", [TOM]),

    # --- JACOB: Week 1 (Mar 26-28) - Identity + Wallet ---
    ("Remove settings icon from sidebar", "2026-03-26", "2026-03-26", [JACOB]),
    ("Replace wallet-adapter with Dynamic.xyz", "2026-03-26", "2026-03-27", [JACOB]),
    ("Implement Twitter/X OAuth (replace localStorage)", "2026-03-27", "2026-03-28", [JACOB]),
    ("Wire up .sol domain resolution (SNS)", "2026-03-28", "2026-03-29", [JACOB]),

    # --- JACOB: Week 2 (Mar 29 - Apr 4) - UI + Polish ---
    ("Mobile-optimize layout", "2026-03-29", "2026-03-30", [JACOB]),
    ("Set up Vercel Analytics monitoring", "2026-03-30", "2026-03-30", [JACOB]),
    ("Leaderboard UI - pagination + remove from score pages", "2026-03-31", "2026-04-01", [JACOB]),
    ("Rework For Protocols - full Jupiter case study", "2026-04-01", "2026-04-02", [JACOB]),
    ("Add scorecard download (Save as PNG)", "2026-04-02", "2026-04-02", [JACOB]),
    ("Rework OG scorecard design", "2026-04-02", "2026-04-03", [JACOB]),
    ("Rework sector color coding", "2026-04-03", "2026-04-03", [JACOB]),
    ("List on Bazaar + agentic marketplaces", "2026-04-03", "2026-04-04", [JACOB]),
    ("Update dashboard after Tom's data changes", "2026-04-04", "2026-04-04", [JACOB]),

    # --- JOINT ---
    ("End-of-sprint review + polish pass", "2026-04-04", "2026-04-04", [JACOB, TOM]),
]

for name, start, end, assignees in tasks:
    result = create_task(name, start, end, assignees)
    who = "Tom" if TOM in assignees and JACOB not in assignees else "Jacob" if JACOB in assignees and TOM not in assignees else "Both"
    print(f"  [{who}] {start} -> {end}: {name}")

print(f"\nDone! {len(tasks)} tasks created in timeline.")
