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

# Find the Twitter OAuth task
query = api(f"databases/{DB_ID}/query", {
    "filter": {"property": "Name", "title": {"contains": "Twitter"}}
})

for entry in query["results"]:
    title = "".join(t["plain_text"] for t in entry["properties"]["Name"]["title"])
    if "Twitter" in title or "OAuth" in title:
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
                "rich_text": [{"type": "text", "text": {"content": "Completed 2026-03-30. Twitter/X OAuth 2.0 working."}}],
                "icon": {"type": "emoji", "emoji": "\u2705"}
            }},
            {"object": "block", "type": "heading_3", "heading_3": {
                "rich_text": [{"type": "text", "text": {"content": "What was done"}}]
            }},
            {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {
                "rich_text": [{"type": "text", "text": {"content": "Built full OAuth 2.0 PKCE flow in lib/twitter-auth.ts"}}]
            }},
            {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {
                "rich_text": [{"type": "text", "text": {"content": "4 API routes: /api/auth/twitter (init), /callback, /me, /logout"}}]
            }},
            {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {
                "rich_text": [{"type": "text", "text": {"content": "Updated endpoints from twitter.com to x.com (fixes session persistence so logged-in users just see Authorize screen)"}}]
            }},
            {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {
                "rich_text": [{"type": "text", "text": {"content": "Session stored in httpOnly cookie (30 day expiry)"}}]
            }},
            {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {
                "rich_text": [{"type": "text", "text": {"content": "WalletIdentity component shows PFP, handle, follower count, Unlink button when connected"}}]
            }},
            {"object": "block", "type": "heading_3", "heading_3": {
                "rich_text": [{"type": "text", "text": {"content": "Path forward"}}]
            }},
            {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {
                "rich_text": [{"type": "text", "text": {"content": "For production: set NEXTAUTH_URL to the Vercel domain and add that callback URL in X developer portal"}}]
            }},
            {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {
                "rich_text": [{"type": "text", "text": {"content": "Store refresh_token to silently re-auth when access token expires (offline.access scope already requested)"}}]
            }},
            {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {
                "rich_text": [{"type": "text", "text": {"content": "Consider tying Twitter profile to wallet address in DB so it persists across devices when same wallet connects"}}]
            }},
            {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {
                "rich_text": [{"type": "text", "text": {"content": "Env vars needed: TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET, NEXTAUTH_URL (stored in .env.local, do NOT commit)"}}]
            }},
        ]}, method="PATCH")
        print("  -> Notes added")

print("\nDone!")
