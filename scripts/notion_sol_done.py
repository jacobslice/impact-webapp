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

# Find the .sol domain task
query = api(f"databases/{DB_ID}/query", {
    "filter": {"property": "Name", "title": {"contains": ".sol"}}
})

for entry in query["results"]:
    title = "".join(t["plain_text"] for t in entry["properties"]["Name"]["title"])
    if ".sol" in title.lower():
        task_id = entry["id"]
        print(f"Found task: {title} ({task_id})")

        # Mark as done
        api(f"pages/{task_id}", {
            "properties": {"Status": {"status": {"name": "Done"}}}
        }, method="PATCH")
        print("  -> Marked Done")

        # Add completion notes
        api(f"blocks/{task_id}/children", {"children": [
            {"object": "block", "type": "callout", "callout": {
                "rich_text": [{"type": "text", "text": {"content": "Completed 2026-03-30. .sol domain resolution working end-to-end."}}],
                "icon": {"type": "emoji", "emoji": "\u2705"}
            }},
            {"object": "block", "type": "heading_3", "heading_3": {
                "rich_text": [{"type": "text", "text": {"content": "What was done"}}]
            }},
            {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {
                "rich_text": [{"type": "text", "text": {"content": "Installed @bonfida/spl-name-service (Solana Name Service SDK)"}}]
            }},
            {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {
                "rich_text": [{"type": "text", "text": {"content": "Created lib/sol-domain.ts with isSolDomain() and resolveSolDomain() helpers"}}]
            }},
            {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {
                "rich_text": [{"type": "text", "text": {"content": "Updated /api/score route: detects .sol input, resolves to wallet address via SNS before querying Dune"}}]
            }},
            {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {
                "rich_text": [{"type": "text", "text": {"content": "Search bars on Home + Topbar already had .sol placeholder text — now functional"}}]
            }},
            {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {
                "rich_text": [{"type": "text", "text": {"content": "Tested: toly.sol, bonfida.sol resolve correctly (not in Dune dataset but resolution works)"}}]
            }},
            {"object": "block", "type": "heading_3", "heading_3": {
                "rich_text": [{"type": "text", "text": {"content": "How it works"}}]
            }},
            {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {
                "rich_text": [{"type": "text", "text": {"content": "User types 'toly.sol' in search bar -> routed to /score/toly.sol -> page calls /api/score?address=toly.sol"}}]
            }},
            {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {
                "rich_text": [{"type": "text", "text": {"content": "API detects .sol suffix -> calls SNS resolve() via Solana mainnet RPC -> gets wallet address -> queries Dune with resolved address"}}]
            }},
            {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {
                "rich_text": [{"type": "text", "text": {"content": "If domain doesn't exist: returns 404 'Could not resolve .sol domain'"}}]
            }},
        ]}, method="PATCH")
        print("  -> Notes added")
        break

print("\nDone!")
