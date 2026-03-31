import json
import urllib.request
import sys
sys.stdout.reconfigure(encoding='utf-8')

TOKEN = os.environ.get("NOTION_TOKEN", "")
NOTION_VERSION = "2022-06-28"
USER_B = "1dc83e3d-7cf1-4844-9ccb-b151d15ebee2"

def get_children(block_id):
    req = urllib.request.Request(
        f"https://api.notion.com/v1/blocks/{block_id}/children?page_size=100",
        headers={"Authorization": f"Bearer {TOKEN}", "Notion-Version": NOTION_VERSION}
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())

# Get all top-level blocks
top = get_children("32eb6328-b169-81bd-879d-ee9520527f21")

tables = []
todos_with_children = []
current_heading = ""

for b in top["results"]:
    btype = b["type"]
    if btype.startswith("heading"):
        texts = b[btype].get("rich_text", [])
        current_heading = "".join(t["plain_text"] for t in texts)
    elif btype == "table":
        tables.append({
            "id": b["id"],
            "heading": current_heading,
            "edited_by_user": b["last_edited_by"]["id"] == USER_B
        })
    elif btype == "to_do" and b.get("has_children"):
        text = "".join(t["plain_text"] for t in b["to_do"]["rich_text"])
        todos_with_children.append({"id": b["id"], "text": text})

print("=" * 80)
print("ALL TABLES WITH DECISIONS")
print("=" * 80)

for t in tables:
    children = get_children(t["id"])
    rows = children["results"]
    print(f"\n### {t['heading']} (user_edited: {t['edited_by_user']})")
    for i, row in enumerate(rows):
        cells = row["table_row"]["cells"]
        cell_texts = []
        for cell in cells:
            cell_texts.append("".join(part["plain_text"] for part in cell) if cell else "")
        if i == 0:
            print(f"  HEADERS: {cell_texts}")
        else:
            print(f"  ROW: {cell_texts}")

print()
print("=" * 80)
print("TO-DO ITEMS WITH CHILDREN")
print("=" * 80)

for td in todos_with_children:
    print(f"\nTodo: {td['text']}")
    children = get_children(td["id"])
    for child in children["results"]:
        ctype = child["type"]
        if ctype in child:
            texts = child[ctype].get("rich_text", [])
            print(f"  Reply: {''.join(t['plain_text'] for t in texts)}")
