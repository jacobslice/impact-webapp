import json
import urllib.request
import sys
sys.stdout.reconfigure(encoding='utf-8')

TOKEN = os.environ.get("NOTION_TOKEN", "")
NOTION_VERSION = "2022-06-28"
DB_ID = "32eb6328-b169-80d4-8b8f-d81d896c22ed"

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

# Get all tasks
query = api(f"databases/{DB_ID}/query", {})

# Map of task title substring -> new dates
# Jacob tasks - reordered by priority
jacob_updates = {
    "Final UI Review": {"start": "2026-03-30", "end": "2026-03-31"},
    "Rework sector color": {"start": "2026-03-31", "end": "2026-03-31"},
    "Rework For Protocols": {"start": "2026-03-31", "end": "2026-04-01"},
    "Rework OG scorecard": {"start": "2026-04-01", "end": "2026-04-02"},
    "scorecard download": {"start": "2026-04-02", "end": "2026-04-02"},
    "Vercel Analytics": {"start": "2026-04-02", "end": "2026-04-02"},
    "Bazaar": {"start": "2026-04-03", "end": "2026-04-04"},
    "Mobile-optimize": {"start": "2026-04-07", "end": "2026-04-08"},
}

# Blocked by Tom - push back
blocked_updates = {
    "Leaderboard UI": {"start": "2026-04-07", "end": "2026-04-08"},
    "Update dashboard after Tom": {"start": "2026-04-08", "end": "2026-04-09"},
    "End-of-sprint review": {"start": "2026-04-09", "end": "2026-04-09"},
    "Review Jacob": {"start": "2026-04-09", "end": "2026-04-09"},
}

for entry in query["results"]:
    title = "".join(t["plain_text"] for t in entry["properties"]["Name"]["title"])
    task_id = entry["id"]
    status = entry["properties"].get("Status", {}).get("status", {}).get("name", "")

    if status == "Done":
        continue

    # Check jacob tasks
    for key, dates in jacob_updates.items():
        if key.lower() in title.lower():
            api(f"pages/{task_id}", {
                "properties": {"Date": {"date": {"start": dates["start"], "end": dates["end"]}}}
            }, method="PATCH")
            print(f"Updated: {title} -> {dates['start']} to {dates['end']}")
            break

    # Check blocked tasks
    for key, dates in blocked_updates.items():
        if key.lower() in title.lower():
            api(f"pages/{task_id}", {
                "properties": {"Date": {"date": {"start": dates["start"], "end": dates["end"]}}}
            }, method="PATCH")
            print(f"Pushed back: {title} -> {dates['start']} to {dates['end']}")
            break

print("\nDone!")
