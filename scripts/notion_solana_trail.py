import json
import urllib.request
import sys
sys.stdout.reconfigure(encoding='utf-8')

TOKEN = os.environ.get("NOTION_TOKEN", "")
NOTION_VERSION = "2022-06-28"
PARENT_ID = "32eb6328-b169-80f1-86d5-d29905f9c960"

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
def todo(t):
    return {"object": "block", "type": "to_do", "to_do": {
        "rich_text": [{"type": "text", "text": {"content": t}}], "checked": False
    }}

# Create page
page = api("pages", {
    "parent": {"page_id": PARENT_ID},
    "icon": {"type": "emoji", "emoji": "\U0001f40e"},
    "properties": {
        "title": {"title": [{"text": {"content": "Solana Trail - Game Design Doc"}}]}
    },
    "children": [
        callout("Oregon Trail x Crypto. Users play a speed-run to claim their Solana Score. Budget determined by real wallet data. Twitter party system with global death leaderboard.", "\U0001f3ae"),
        p("CRT green monochrome aesthetic. Every element is a crypto/Solana callback.", bold=True),
        divider(),

        h1("Game Flow"),
        bullet("1. Title screen - CRT green aesthetic, 'SOLANA TRAIL' pixel text"),
        bullet("2. Connect wallet - Score pre-loaded but hidden until end"),
        bullet("3. Enter Twitter handle - yours + up to 4 party members via @handle"),
        bullet("4. Choose profession - affects starting SOL and score multiplier"),
        bullet("5. Buy supplies at Sol's General Store - budget based on wallet fees"),
        bullet("6. Trail gameplay - 8-10 landmark stops, random events, pace/ration management"),
        bullet("7. Hunting mini-game - 2-3 times during journey (shoot bulls/bears/rugs)"),
        bullet("8. River crossings - at protocol landmarks (ford/caulk/ferry)"),
        bullet("9. Arrival at Willamette Valley - reveal real Solana Score + game score"),
        bullet("10. Share on X - tombstone card + scorecard"),
        divider(),

        h1("Professions"),
        p("Each determines starting SOL and score multiplier:"),
        table(
            ["Profession", "Start SOL", "Multiplier", "Description"],
            [
                ["VC Partner", "100 SOL", "1x", "Unlimited capital, zero community respect. Nobody will trade with you."],
                ["KOL", "50 SOL", "1.5x", "500K followers and a paid promo deal. Your word moves markets (temporarily)."],
                ["Reply Guy", "10 SOL", "2x", "Been commenting 'gm' under every tweet for 2 years. Dedication unmatched."],
                ["Booth Girl", "25 SOL", "1.5x", "Got paid 5 SOL to wear a branded shirt at Breakpoint. Doesn't know what a blockchain is."],
                ["Moderator", "5 SOL", "3x", "Works 80hrs/week for a Discord role and 'future token allocation.' No grass since 2021."],
                ["Degen Farmer", "2 SOL", "5x", "47 wallets, airdrop spreadsheet, hasn't slept in 3 days."],
            ]
        ),
        divider(),

        h1("Supplies (Sol's General Store)"),
        table(
            ["Supply", "Original", "Crypto Version", "Effect"],
            [
                ["Oxen", "Oxen", "Hardware Wallets", "Lose one = lose access. 'Your Ledger bricked after firmware update.'"],
                ["Food", "Food", "Stablecoins (USDC)", "Keeps party alive. 'Should've kept more dry powder.'"],
                ["Ammunition", "Ammunition", "SOL for Gas", "Needed for hunting/trading. 'Transaction failed: insufficient SOL.'"],
                ["Spare Parts", "Wagon parts", "Seed Phrases", "Lose them = catastrophic. 'Wrote seed phrase on a napkin. Napkin is gone.'"],
                ["Clothing", "Clothing", "Monkey JPEGs (NFTs)", "Status + warmth. 'Your Okay Bear keeps spirits up.' Worth nothing at end."],
                ["Medicine", "Medicine", "VPN Subscriptions", "Protects against regulatory disease. 'OFAC sanctions hit your mixer.'"],
            ]
        ),
        divider(),

        h1("Trail Landmarks"),
        p("Each landmark is a real Solana protocol/event:"),
        table(
            ["Landmark", "Sector", "Description"],
            [
                ["Independence (Start)", "--", "You create your first wallet. The blockchain awaits."],
                ["Jupiter Crossing", "Aggregator", "River crossing. Ford (swap direct), caulk (limit order), or ferry (DCA)?"],
                ["Raydium Pools", "DEX", "You've reached the liquidity pools. The water looks... impermanent."],
                ["Pump.fun Gulch", "Launchpad", "A man sells maps to a city of gold. Buy? (Ape into a memecoin)"],
                ["Drift Canyon", "Perps", "Trail narrows to cliff edge. Go 10x leverage on shortcut? Party could die."],
                ["Meteora Springs", "DEX", "Rest stop. Party rests by the concentrated liquidity pools."],
                ["Orca Bay", "DEX", "A friendly whale offers to carry your wagon. Trust the whale?"],
                ["Axiom Trading Post", "Tools", "Trade supplies with NPCs. Prices are manipulated."],
                ["Phantom Pass", "Wallet", "Ghost town. Everyone connected their wallet to the wrong site."],
                ["Wormhole Bridge", "Bridge", "Rickety bridge. 50% chance supplies disappear in transit."],
                ["Marinade Salt Flats", "Staking", "Stake your oxen for passive food. Lock period: 2 epochs."],
                ["Willamette Valley", "--", "You've reached Oregon. Score revealed."],
            ]
        ),
        divider(),
    ]
})

page_id = page["id"]
print(f"Page created: {page['url']}")

# Part 2
part2 = [
    h1("Pace & Rations"),
    h3("Pace"),
    table(
        ["Pace", "Crypto Name", "Effect"],
        [
            ["Steady", "Dollar Cost Averaging", "Safe, slow. Low risk."],
            ["Strenuous", "Active Trading", "Faster but party health drops."],
            ["Grueling", "Full Degen Mode", "Max speed. Party hallucinating about SOL hitting $1000."],
        ]
    ),
    h3("Rations"),
    table(
        ["Setting", "Crypto Name", "Effect"],
        [
            ["Filling", "All-In", "Burns stablecoins fast but party is happy"],
            ["Meager", "Diversified Portfolio", "Balanced consumption"],
            ["Bare Bones", "Ramen Mode", "Party subsists on instant noodles and copium"],
        ]
    ),
    divider(),

    h1("Hunting Mini-Game (Market Trading)"),
    p("Targets move across screen. Shoot or avoid:"),
    table(
        ["Target", "Effect", "Behavior", "Joke"],
        [
            ["Bull", "+50 SOL", "Runs fast, hard to hit", "Bull market appeared! Buy everything!"],
            ["Bear", "-30 SOL if it hits you", "Charges AT you", "Bear market incoming. Dodge or get liquidated."],
            ["Rug Pull Snake", "+0 (wastes ammo)", "Disappears when shot", "Token vanished before your TX confirmed."],
            ["Airdrop Eagle", "+100 SOL", "Flies fast across top", "Wild airdrop appeared! Claim before farmers!"],
            ["SEC Hawk", "-20 SOL", "Swoops down", "SEC circling. They think your ammo is a security."],
            ["Diamond Hands Turtle", "+200 if you DON'T shoot", "Sits still 30sec", "A HODL turtle. Leave it alone = reward."],
        ]
    ),
    divider(),

    h1("Random Events"),
    h3("Catastrophic"),
    bullet("You got rugged. Team deleted Twitter and Discord. Lost 40% of stablecoins."),
    bullet("Laptop fell in the river. Hot wallet gone. Lost 2 hardware wallets."),
    bullet("@HANDLE has dysentery. (classic)"),
    bullet("Exploit drained the bridge. Lost all supplies in transit."),
    bullet("Seed phrase was in a screenshot. A bot found it. Lost everything."),
    bullet("SEC classified your NFTs as securities. Legal fees: 50 SOL."),
    p(""),
    h3("Bad"),
    bullet("Failed transaction. Lost 0.5 SOL in gas."),
    bullet("Someone clicked a phishing link. Cholera outbreak."),
    bullet("Flash loan attack on trading post. Prices are insane."),
    bullet("Phantom wallet won't connect. Restarted 17 times."),
    bullet("Network congested. Stuck at this landmark for 3 days."),
    bullet("@HANDLE caught insider trading. Party morale drops."),
    p(""),
    h3("Good"),
    bullet("Discovered a forgotten airdrop! +20 SOL"),
    bullet("Friendly whale donated to party. +10 stablecoins."),
    bullet("Monkey JPEG 10x'd overnight. Morale through the roof."),
    bullet("Successfully bridged without getting hacked. +15 SOL."),
    bullet("@HANDLE was finally given token allocation. Tears of joy."),
    p(""),
    h3("Neutral"),
    bullet("Found abandoned wallet on trail. 0.001 SOL and 47 worthless tokens."),
    bullet("Stranger offers 1000 monkey JPEGs for 1 hardware wallet."),
    bullet("Met a traveling validator. Shared war stories about downtime."),
    bullet("Solana goes down for maintenance. Everyone rests involuntarily."),
    divider(),
]

api(f"blocks/{page_id}/children", {"children": part2}, method="PATCH")
print("Part 2 added")

# Part 3
part3 = [
    h1("River Crossings (Protocol Decisions)"),
    table(
        ["Option", "Risk", "Crypto Parallel"],
        [
            ["Ford the river (free)", "High - can lose supplies/members", "Swap on-chain. Hope for no slippage."],
            ["Caulk the wagon (free)", "Medium - slower", "Use a limit order. Might not fill."],
            ["Pay the ferry (costs SOL)", "Low - safest", "Pay aggregator fee. Jupiter handles routing."],
            ["Wait for conditions", "Delays", "Wait for lower gas fees."],
        ]
    ),
    divider(),

    h1("Party System (Twitter Integration)"),
    bullet("Player enters own Twitter handle"),
    bullet("Add up to 4 party members by @handle"),
    bullet("Each member has random HP (funnier that way)"),
    bullet("When someone dies: '@HANDLE has died of dysentery' - stored in global death DB"),
    bullet("End screen shows tombstones for dead party members"),
    bullet("Global leaderboard: 'Most Deaths' - which Twitter handles died most across all playthroughs"),
    p(""),
    h3("Tombstones Along the Trail"),
    bullet("As players progress, they see tombstones from OTHER players' runs"),
    bullet("'Here lies @cryptobro99. Died of leverage. Rest in pieces.'"),
    bullet("'Here lies @ngmi_andy. Lost seed phrase at Pump.fun Gulch.'"),
    bullet("Real tombstones pulled from global death database"),
    divider(),

    h1("End Screen - Score Reveal"),
    callout("Game score is fun. But the REAL reveal is their actual Solana Score from their wallet data.", "\U0001f3c6"),
    bullet("Party survivors count"),
    bullet("Remaining supplies breakdown"),
    bullet("Game score with profession multiplier"),
    bullet("Then: 'BUT MORE IMPORTANTLY...'"),
    bullet("Real Solana Score: 87/100"),
    bullet("Tier: Power User"),
    bullet("4 breakdown bars + 5 sector scores"),
    bullet("Sybil status: VERIFIED HUMAN"),
    bullet("Share on X button generates tombstone card + scorecard"),
    divider(),

    h1("Technical Plan"),
    todo("Build as a standalone route: /trail"),
    todo("Game state managed in React useState/useReducer"),
    todo("CRT green monochrome aesthetic (reuse mockup 36 styles)"),
    todo("Wallet connect at start to pre-load score (hidden until end)"),
    todo("Twitter handle input + party member handles"),
    todo("8-10 landmark progression with random events between each"),
    todo("Hunting mini-game: simple canvas or CSS-based shooter"),
    todo("River crossing decision screens at protocol landmarks"),
    todo("Global death leaderboard (needs simple backend/KV store)"),
    todo("Share on X: generate tombstone OG image"),
    todo("Score reveal animation at the end"),
    todo("Sound effects: optional retro beeps"),
]

api(f"blocks/{page_id}/children", {"children": part3}, method="PATCH")
print("Part 3 added")
print(f"\nDone! View: {page['url']}")
