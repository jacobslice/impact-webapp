import json
import urllib.request
import sys
sys.stdout.reconfigure(encoding='utf-8')

TOKEN = os.environ.get("NOTION_TOKEN", "")
NOTION_VERSION = "2022-06-28"
PAGE_ID = "333b6328-b169-8167-9475-f5f4bdb202b1"
USER_B = "1dc83e3d-7cf1-4844-9ccb-b151d15ebee2"
BOT_ID = "32eb6328-b169-8163-8dc2-0027727663c1"

def get_children(block_id):
    req = urllib.request.Request(
        f"https://api.notion.com/v1/blocks/{block_id}/children?page_size=100",
        headers={"Authorization": f"Bearer {TOKEN}", "Notion-Version": NOTION_VERSION}
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())

def get_text(block):
    btype = block["type"]
    if btype in block and "rich_text" in block[btype]:
        return "".join(t["plain_text"] for t in block[btype]["rich_text"])
    return ""

# Get all top-level blocks
blocks = get_children(PAGE_ID)

print("=== SCANNING FOR USER EDITS AND ADDITIONS ===\n")

for b in blocks["results"]:
    text = get_text(b)
    created_by = b["created_by"]["id"]
    edited_by = b["last_edited_by"]["id"]
    has_children = b.get("has_children", False)
    btype = b["type"]

    # Block was added by the user
    if created_by == USER_B:
        print(f"USER ADDED [{btype}]: {text[:120]}")

    # Block was edited by the user (but created by bot)
    elif edited_by == USER_B and created_by != USER_B:
        print(f"USER EDITED [{btype}]: {text[:120]}")

    # Check children of any block that has them
    if has_children:
        try:
            children = get_children(b["id"])
            for child in children["results"]:
                ctext = get_text(child)
                c_created = child["created_by"]["id"]
                c_edited = child["last_edited_by"]["id"]
                ctype = child["type"]

                if c_created == USER_B:
                    print(f"  USER ADDED CHILD [{ctype}]: {ctext[:120]}")
                    # Check grandchildren
                    if child.get("has_children"):
                        try:
                            grandchildren = get_children(child["id"])
                            for gc in grandchildren["results"]:
                                gctext = get_text(gc)
                                if gc["created_by"]["id"] == USER_B:
                                    print(f"    USER ADDED GRANDCHILD [{gc['type']}]: {gctext[:120]}")
                        except:
                            pass
                elif c_edited == USER_B:
                    print(f"  USER EDITED CHILD [{ctype}]: {ctext[:120]}")
        except:
            pass

print("\n=== DONE ===")
