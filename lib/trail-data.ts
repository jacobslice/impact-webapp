import type { ScoreData } from "./types";

export interface Profession {
  name: string;
  startSol: number;
  multiplier: number;
  description: string;
}

export const PROFESSIONS: Profession[] = [
  { name: "VC Partner", startSol: 100, multiplier: 1, description: "Unlimited capital, zero community respect. Nobody will trade with you." },
  { name: "KOL", startSol: 50, multiplier: 1.5, description: "500K followers and a paid promo deal. Your word moves markets (temporarily)." },
  { name: "Reply Guy", startSol: 10, multiplier: 2, description: "Been commenting 'gm' under every tweet for 2 years. Dedication unmatched." },
  { name: "Booth Girl", startSol: 25, multiplier: 1.5, description: "Got paid 5 SOL to wear a branded shirt at Breakpoint. Doesn't know what a blockchain is." },
  { name: "Moderator", startSol: 5, multiplier: 3, description: "Works 80hrs/week for a Discord role and 'future token allocation.' No grass since 2021." },
  { name: "Degen Farmer", startSol: 2, multiplier: 5, description: "47 wallets, airdrop spreadsheet, hasn't slept in 3 days." },
];

/** Assign profession based on wallet score/fees */
export function getProfessionForWallet(scoreData: ScoreData | null): Profession {
  if (!scoreData) return PROFESSIONS[4]; // Moderator as default
  const fees = scoreData.protocol_fees_paid;
  if (fees >= 100000) return PROFESSIONS[0]; // VC Partner
  if (fees >= 10000) return PROFESSIONS[1]; // KOL
  if (fees >= 1000) return PROFESSIONS[3]; // Booth Girl
  if (fees >= 100) return PROFESSIONS[2]; // Reply Guy
  if (fees >= 10) return PROFESSIONS[4]; // Moderator
  return PROFESSIONS[5]; // Degen Farmer
}

export const DEFAULT_PARTY_HANDLES = ["BlackNoise", "Tally", "ThreadGuy"];

export interface Supply {
  name: string;
  emoji: string;
  price: number;
  description: string;
}

export const SUPPLIES: Supply[] = [
  { name: "Bulls", emoji: "🐂", price: 8, description: "Pull your wagon. No bulls = no movement." },
  { name: "Food", emoji: "🍔", price: 3, description: "McDonald's Big Macs. Keeps the party alive." },
  { name: "Medicine", emoji: "🥩", price: 5, description: "It's just raw meat and eggs." },
];

export interface Landmark {
  id: string;
  name: string;
  protocol: string;
  sector: string;
  description: string;
  eventType: "river" | "decision" | "rest" | "danger";
  choices: { text: string; outcome: string; effect: "good" | "bad" | "neutral" }[];
}

// Map protocol names to trail landmarks
const PROTOCOL_LANDMARKS: Record<string, Landmark> = {
  "jupiter ultra v6": {
    id: "jupiter", name: "Jupiter Crossing", protocol: "Jupiter", sector: "Aggregator",
    description: "The Jupiter river blocks your path. The current is strong with swap volume.",
    eventType: "river",
    choices: [
      { text: "Ford it (swap direct)", outcome: "You wade in. Slippage hits hard — lost some McDonald's!", effect: "bad" },
      { text: "Caulk the wagon (limit order)", outcome: "You set a limit order and wait. It fills! Safe crossing.", effect: "good" },
      { text: "Pay the ferry (DCA)", outcome: "You pay the aggregator fee. Jupiter handles routing. Smooth.", effect: "good" },
    ],
  },
  "raydium": {
    id: "raydium", name: "Raydium Pools", protocol: "Raydium", sector: "DEX",
    description: "You've reached the Raydium liquidity pools. The water looks... impermanent.",
    eventType: "rest",
    choices: [
      { text: "Provide liquidity", outcome: "You add to the pool. Impermanent loss eats 20% of your McDonald's.", effect: "bad" },
      { text: "Just swap and move on", outcome: "Quick trade, fair price. The party continues.", effect: "neutral" },
      { text: "Rest by the pools", outcome: "The party rests. Health restored by the concentrated liquidity.", effect: "good" },
    ],
  },
  "pump.fun": {
    id: "pumpfun", name: "Pump.fun Gulch", protocol: "Pump.fun", sector: "Launchpad",
    description: "A sketchy trader approaches selling maps to a city of gold.",
    eventType: "decision",
    choices: [
      { text: "Ape in (buy the map)", outcome: "The map leads nowhere. It was a rug. Lost 30% of SOL.", effect: "bad" },
      { text: "DYOR first", outcome: "You study the map. It's printed on toilet paper. You walk away.", effect: "neutral" },
      { text: "Counter-trade him", outcome: "You sell HIM a map. +10 SOL. Sigma move.", effect: "good" },
    ],
  },
  "drift": {
    id: "drift", name: "Drift Canyon", protocol: "Drift", sector: "Perps",
    description: "The trail narrows to a cliff edge. A sign reads: 'LEVERAGE AVAILABLE — 10x SHORTCUT'",
    eventType: "danger",
    choices: [
      { text: "Go 10x leverage", outcome: "The shortcut collapses! Party member liquidated. Literally.", effect: "bad" },
      { text: "Take the safe path", outcome: "Longer but safer. Your bulls appreciate the flat ground.", effect: "good" },
      { text: "Go 2x conservative", outcome: "Moderate risk. You save some time, only lose a little merch.", effect: "neutral" },
    ],
  },
  "meteora": {
    id: "meteora", name: "Meteora Springs", protocol: "Meteora", sector: "DEX",
    description: "Hot springs! The concentrated liquidity pools steam invitingly.",
    eventType: "rest",
    choices: [
      { text: "Rest and recover", outcome: "The party soaks in the springs. Full health restored!", effect: "good" },
      { text: "Collect the mineral deposits", outcome: "You find yield in the springs. +5 SOL.", effect: "good" },
      { text: "Keep moving (no time for rest)", outcome: "The party grumbles but pushes on. Morale drops.", effect: "bad" },
    ],
  },
  "orca": {
    id: "orca", name: "Orca Bay", protocol: "Orca", sector: "DEX",
    description: "A friendly whale surfaces and offers to carry your wagon across the bay.",
    eventType: "river",
    choices: [
      { text: "Trust the whale", outcome: "The whale delivers! Smooth crossing, everyone's happy.", effect: "good" },
      { text: "Swim across yourself", outcome: "Halfway across, you realize whales exist for a reason. Lost some supplies.", effect: "bad" },
      { text: "Build a raft", outcome: "Takes time but works. Your seed phrases stay dry.", effect: "neutral" },
    ],
  },
  "axiom": {
    id: "axiom", name: "Axiom Trading Post", protocol: "Axiom", sector: "Tools",
    description: "A frontier trading post. The prices seem... manipulated.",
    eventType: "decision",
    choices: [
      { text: "Trade aggressively", outcome: "You front-ran the other traders. +15 SOL, -1 reputation.", effect: "good" },
      { text: "Fair trade only", outcome: "Honest trades. Got fair value for your protocol merch.", effect: "neutral" },
      { text: "Report the manipulation", outcome: "Nobody cares. This is the wild west. Nothing happens.", effect: "neutral" },
    ],
  },
  "photon": {
    id: "photon", name: "Photon Ridge", protocol: "Photon", sector: "Tools",
    description: "The ridge glows with bot activity. Sniper bots patrol the area.",
    eventType: "danger",
    choices: [
      { text: "Deploy your own bot", outcome: "Your bot outsnipes theirs. +10 SOL from MEV.", effect: "good" },
      { text: "Sneak past", outcome: "You avoid the bots. Safe passage, nothing gained.", effect: "neutral" },
      { text: "Fight through", outcome: "The bots are faster. Lost some gas fees in the battle.", effect: "bad" },
    ],
  },
  "jupiter perpetuals": {
    id: "jupperps", name: "Jupiter Perps Cliff", protocol: "Jupiter Perps", sector: "Perps",
    description: "A vertical cliff face. Leveraged ropes hang from the top.",
    eventType: "danger",
    choices: [
      { text: "Climb with leverage (fast)", outcome: "You're liquidated halfway up. Party member falls.", effect: "bad" },
      { text: "Take the switchback trail", outcome: "Slow and steady. Everyone makes it. HODL energy.", effect: "good" },
      { text: "Hire a sherpa", outcome: "Costs 5 SOL but guaranteed safe passage.", effect: "neutral" },
    ],
  },
  "moonshot create": {
    id: "moonshot", name: "Moonshot Mountain", protocol: "Moonshot", sector: "Launchpad",
    description: "A mountain that promises the moon at its peak. Many have tried. Few returned.",
    eventType: "decision",
    choices: [
      { text: "Climb to the moon", outcome: "You reach the peak! It's just more rocks. But the view is nice. +morale.", effect: "neutral" },
      { text: "Mine the base", outcome: "You find some gems early. +8 SOL.", effect: "good" },
      { text: "Sell shovels to climbers", outcome: "Smart. +12 SOL. You are the real protocol.", effect: "good" },
    ],
  },
  "launchlab": {
    id: "launchlab", name: "LaunchLab Volcano", protocol: "LaunchLab", sector: "Launchpad",
    description: "An active volcano. Tokens erupt from the crater every few minutes.",
    eventType: "danger",
    choices: [
      { text: "Catch erupting tokens", outcome: "You catch a few! Most are worthless. +3 SOL from the one that wasn't.", effect: "neutral" },
      { text: "Go around the volcano", outcome: "Safe but slow. The party watches others get rekt from a distance.", effect: "neutral" },
      { text: "Dive into the crater", outcome: "Full degen. Lost your protocol merch but found a 100x. +20 SOL.", effect: "good" },
    ],
  },
  "lets bonk": {
    id: "letsbonk", name: "Bonk Town", protocol: "Lets Bonk", sector: "Launchpad",
    description: "A town where everyone communicates by bonking each other on the head.",
    eventType: "rest",
    choices: [
      { text: "Join the bonking", outcome: "You bonk and get bonked. Surprisingly therapeutic. +morale.", effect: "good" },
      { text: "Trade bonk tokens", outcome: "You trade some memes. Break even.", effect: "neutral" },
      { text: "This is weird, leave", outcome: "You miss out on the community airdrop. NGMI.", effect: "bad" },
    ],
  },
  "bags": {
    id: "bags", name: "Bag Holders' Pass", protocol: "Bags", sector: "Launchpad",
    description: "A mountain pass littered with heavy bags. Previous travelers couldn't let go.",
    eventType: "decision",
    choices: [
      { text: "Pick up some bags", outcome: "They're heavier than expected. Your bulls slow down.", effect: "bad" },
      { text: "Step over the bags", outcome: "You learn from others' mistakes. Diamond hands doesn't mean heavy bags.", effect: "good" },
      { text: "Sort through for gems", outcome: "Most are junk but you find one winner. +5 SOL.", effect: "good" },
    ],
  },
  "believe": {
    id: "believe", name: "Believe Bridge", protocol: "Believe", sector: "Launchpad",
    description: "A bridge that only appears if you believe in it. Seriously.",
    eventType: "river",
    choices: [
      { text: "Believe and walk", outcome: "The bridge holds! Your conviction is rewarded. Safe crossing.", effect: "good" },
      { text: "Test it first", outcome: "You throw a rock. It falls. You find another way. Slow but safe.", effect: "neutral" },
      { text: "Refuse to believe", outcome: "The bridge vanishes. You swim. Lost some McDonald's to the current.", effect: "bad" },
    ],
  },
  "jupiter dca": {
    id: "jupdca", name: "DCA Valley", protocol: "Jupiter DCA", sector: "Aggregator",
    description: "A peaceful valley where supplies trickle in at regular intervals.",
    eventType: "rest",
    choices: [
      { text: "Set up DCA camp", outcome: "You rest and accumulate. Steady gains. +5 SOL, +health.", effect: "good" },
      { text: "Lump sum the valley", outcome: "You buy everything at once. Market dumps. Lost 5 SOL.", effect: "bad" },
      { text: "Pass through quickly", outcome: "No time for DCA. The party moves on.", effect: "neutral" },
    ],
  },
};

// Fallback landmarks for users with very few protocols
const FALLBACK_LANDMARKS: Landmark[] = [
  {
    id: "phantom_pass", name: "Phantom Pass", protocol: "Phantom", sector: "Wallet",
    description: "A ghost town. Everyone here connected their wallet to the wrong site.",
    eventType: "danger",
    choices: [
      { text: "Check your approvals", outcome: "Smart. You revoke 47 suspicious token approvals. Safety first.", effect: "good" },
      { text: "Connect to the free WiFi", outcome: "It's a honeypot. Lost some gas fees to a phishing site.", effect: "bad" },
      { text: "Keep walking", outcome: "You avoid the ghost town entirely. Nothing happens.", effect: "neutral" },
    ],
  },
  {
    id: "wormhole", name: "Wormhole Bridge", protocol: "Wormhole", sector: "Bridge",
    description: "A rickety bridge over a bottomless chasm. A sign reads: 'NOT RESPONSIBLE FOR LOST FUNDS'",
    eventType: "river",
    choices: [
      { text: "Cross the bridge", outcome: "Made it! Only lost a sock. Could've been worse.", effect: "neutral" },
      { text: "Find another way", outcome: "You walk 3 days around the chasm. Exhausting but safe.", effect: "neutral" },
      { text: "Bungee jump off it", outcome: "Why. Lost your protocol merch on the way down. But what a rush.", effect: "bad" },
    ],
  },
];

export function getLandmarksForWallet(protocolsUsed: string[]): Landmark[] {
  const landmarks: Landmark[] = [];
  const seen = new Set<string>();

  for (const proto of protocolsUsed) {
    const key = proto.toLowerCase().trim();
    const landmark = PROTOCOL_LANDMARKS[key];
    if (landmark && !seen.has(landmark.id)) {
      seen.add(landmark.id);
      landmarks.push(landmark);
    }
  }

  // If too few, add fallbacks
  while (landmarks.length < 3) {
    const fb = FALLBACK_LANDMARKS[landmarks.length % FALLBACK_LANDMARKS.length];
    if (!seen.has(fb.id)) {
      seen.add(fb.id);
      landmarks.push(fb);
    } else {
      break;
    }
  }

  // Cap at 5 landmarks for 3-5 min gameplay
  return landmarks.slice(0, 5);
}

export interface RandomEvent {
  text: string;
  effect: "catastrophic" | "bad" | "good" | "neutral";
  supplyLoss?: Partial<Record<string, number>>;
}

export const RANDOM_EVENTS: RandomEvent[] = [
  // Catastrophic - DEATH EVENTS
  { text: "PARTY_MEMBER got rugged on a memecoin. The shock was fatal.", effect: "catastrophic" },
  { text: "PARTY_MEMBER has dysentery. Shouldn't have eaten that gas station sushi at the Solana hackathon.", effect: "catastrophic" },
  { text: "PARTY_MEMBER clicked a 'free mint' link. Wallet drained. They didn't survive the loss.", effect: "catastrophic" },
  { text: "PARTY_MEMBER went all-in on a 100x leveraged perp. Liquidated. Literally.", effect: "catastrophic" },
  { text: "PARTY_MEMBER shared their seed phrase in a Discord DM with 'Phantom Support.' RIP.", effect: "catastrophic" },
  { text: "PARTY_MEMBER got exit scammed by a KOL's promoted token. Lost everything. Didn't make it.", effect: "catastrophic" },
  { text: "A bridge exploit drained PARTY_MEMBER's entire wallet. They walked into the desert and never came back.", effect: "catastrophic" },
  { text: "PARTY_MEMBER tried to catch a falling knife. The knife won.", effect: "catastrophic" },
  { text: "PARTY_MEMBER was pump and dumped by a celebrity token. The emotional damage was too much.", effect: "catastrophic" },
  // Bad
  { text: "Failed transaction. Lost 2 Solana in gas fees. Solana said 400ms but it felt like 400 years.", effect: "bad" },
  { text: "Someone clicked a phishing link disguised as an airdrop checker. Lost some Solana.", effect: "bad" },
  { text: "Your Phantom wallet won't connect. You restart 17 times. Wasted a day and some Big Macs.", effect: "bad" },
  { text: "Network congested. Priority fees eating into your stack.", effect: "bad" },
  { text: "One of your bulls got spooked by a red candle. It ran away.", effect: "bad" },
  { text: "A KOL you followed dumped their bags on you. Lost some Solana.", effect: "bad" },
  { text: "Food poisoning from a sketchy gas station Big Mac. Party health drops.", effect: "bad" },
  { text: "Gas fees spiked. Every transaction costs 10x more than expected.", effect: "bad" },
  { text: "Your party ate through half the Big Macs in one night. Food running low.", effect: "bad" },
  // Good
  { text: "Discovered a forgotten airdrop! Free Solana from a protocol you used once in 2023!", effect: "good" },
  { text: "A friendly whale donated Big Macs to your party! Wagmi.", effect: "good" },
  { text: "A memecoin you forgot about did a 50x overnight! +5 Solana!", effect: "good" },
  { text: "The carnivore diet kicked in. Everyone's eating raw steak and eggs. Party health restored!", effect: "good" },
  { text: "You found an abandoned Ledger on the trail. It has some Solana on it!", effect: "good" },
  { text: "A VC airdropped your party some Solana for looking promising.", effect: "good" },
  // Neutral
  { text: "You find an abandoned wallet. It has 0.001 Solana and 47 worthless tokens.", effect: "neutral" },
  { text: "A stranger offers 1000 monkey JPEGs for 1 Big Mac. You wisely decline.", effect: "neutral" },
  { text: "You meet a traveling validator. He shares war stories about the February 2023 outage.", effect: "neutral" },
  { text: "Solana goes down for maintenance. Everyone rests involuntarily. Classic.", effect: "neutral" },
  { text: "You overhear two degens arguing about whether Solana will hit $1000. Neither has touched grass in months.", effect: "neutral" },
];

export interface HuntTarget {
  name: string;
  emoji: string;
  points: number;
  speed: number;
  behavior: string;
  joke: string;
}

export const HUNT_TARGETS: HuntTarget[] = [
  { name: "Bear", emoji: "🐻", points: 3, speed: 3, behavior: "runs", joke: "Bear spotted! +3 Solana!" },
  { name: "Bear", emoji: "🐻", points: 2, speed: 4, behavior: "runs", joke: "Another bear! +2 Solana!" },
  { name: "Bear", emoji: "🐻", points: 4, speed: 5, behavior: "charges", joke: "Big bear! +4 Solana!" },
  { name: "Bull", emoji: "🐂", points: -5, speed: 2, behavior: "charges", joke: "That's YOUR bull! You just killed your transportation!" },
];
