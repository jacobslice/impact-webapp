import type { ScoreData } from "./types";

// ============================================================
// PROFESSIONS
// ============================================================
export interface Profession {
  name: string;
  startSol: number;
  multiplier: number;
  description: string;
  supplies: { Bulls: number; Food: number; Medicine: number };
}

export const PROFESSIONS: Profession[] = [
  {
    name: "VC Partner", startSol: 100, multiplier: 1,
    description: "Unlimited capital, zero community respect. Nobody will trade with you.",
    supplies: { Bulls: 4, Food: 20, Medicine: 10 },
  },
  {
    name: "KOL", startSol: 50, multiplier: 1.5,
    description: "500K followers and a paid promo deal. Your word moves markets (temporarily).",
    supplies: { Bulls: 3, Food: 15, Medicine: 5 },
  },
  {
    name: "Booth Girl", startSol: 25, multiplier: 1.5,
    description: "Got paid 5 SOL to wear a branded shirt at Breakpoint. Doesn't know what a blockchain is.",
    supplies: { Bulls: 2, Food: 10, Medicine: 3 },
  },
  {
    name: "Reply Guy", startSol: 10, multiplier: 2,
    description: "Been commenting 'gm' under every tweet for 2 years. Dedication unmatched.",
    supplies: { Bulls: 2, Food: 8, Medicine: 2 },
  },
  {
    name: "Moderator", startSol: 5, multiplier: 3,
    description: "Works 80hrs/week for a Discord role and 'future token allocation.' No grass since 2021.",
    supplies: { Bulls: 1, Food: 5, Medicine: 1 },
  },
  {
    name: "Degen Farmer", startSol: 2, multiplier: 5,
    description: "47 wallets, airdrop spreadsheet, hasn't slept in 3 days.",
    supplies: { Bulls: 1, Food: 3, Medicine: 0 },
  },
  {
    name: "Crypto Poor", startSol: 0.5, multiplier: 10,
    description: "Wallet emptier than a rug-pulled LP. You have a shopping cart instead of a wagon.",
    supplies: { Bulls: 0, Food: 1, Medicine: 0 },
  },
];

export function getProfessionForWallet(scoreData: ScoreData | null): Profession {
  if (!scoreData) return PROFESSIONS[6]; // Crypto Poor
  const fees = scoreData.protocol_fees_paid;
  if (fees >= 100000) return PROFESSIONS[0]; // VC Partner
  if (fees >= 10000) return PROFESSIONS[1]; // KOL
  if (fees >= 1000) return PROFESSIONS[2]; // Booth Girl
  if (fees >= 100) return PROFESSIONS[3]; // Reply Guy
  if (fees >= 10) return PROFESSIONS[4]; // Moderator
  if (fees >= 1) return PROFESSIONS[5]; // Degen Farmer
  return PROFESSIONS[6]; // Crypto Poor
}

// ============================================================
// KOLs — Real crypto Twitter handles with unique death messages
// ============================================================
export interface KOL {
  handle: string;
  uniqueDeaths: string[];
}

export const KOLS: KOL[] = [
  // ===== TIER 1: Well-known Solana figures (multiple unique deaths each) =====
  {
    handle: "blknoiz06", // Ansem
    uniqueDeaths: [
      "@blknoiz06 went to visit a Twitter thot for the weekend. Never returned.",
      "@blknoiz06 left for the journey WIFout a hat. Died of sun poisoning.",
      "@blknoiz06 started hallucinating while traveling through Las Vegas. Was terminated by the Sphere police.",
      "@blknoiz06 called the top on his own life expectancy. It was lower than he thought.",
      "@blknoiz06 tried to alpha-call his way out of a bear attack. The bear wasn't subscribed.",
    ],
  },
  {
    handle: "toly", // Toly (Anatoly Yakovenko)
    uniqueDeaths: [
      "@toly — Solana went down again. This time the holders took their revenge.",
      "@toly tried to process 65,000 trail decisions per second. Crashed and couldn't restart.",
      "@toly said the trail would have 400ms finality. It had 400ms until fatal.",
      "@toly pushed a network update mid-journey. It bricked the wagon.",
    ],
  },
  {
    handle: "notthreadguy", // threadguy
    uniqueDeaths: [
      "@notthreadguy was drafted to fight in the Iran war. Died valiantly in battle. 🫡",
      "@notthreadguy posted a 1/🧵 thread about surviving the trail. There was no 2/.",
      "@notthreadguy started a thread about why he was dying. Got ratioed by the bear.",
      "@notthreadguy's last words were 'this thread will explain everything.' It didn't.",
    ],
  },
  {
    handle: "MustStopMurad", // Murad
    uniqueDeaths: [
      "@MustStopMurad couldn't stop. Nobody could stop Murad. The trail stopped Murad.",
      "@MustStopMurad gave a 45-minute presentation on why memecoins would save the party. The bear ate him during the Q&A.",
      "@MustStopMurad was too busy making slides to notice the cliff.",
      "@MustStopMurad held his bags all the way to the grave. Diamond hands. Dirt nap.",
    ],
  },
  {
    handle: "0xMert_", // Mert (Helius)
    uniqueDeaths: [
      "@0xMert_ shipped one last RPC call. Status: 500 Internal Server Error. Status: dead.",
      "@0xMert_ tried to debug the bear's attack vector. Should have just run.",
      "@0xMert_ rage-quit the trail after the 47th failed transaction.",
      "@0xMert_ went on a Twitter Spaces rant about trail infrastructure. The bear joined as a listener.",
    ],
  },
  {
    handle: "weremeow", // Meow (Jupiter)
    uniqueDeaths: [
      "@weremeow tried to route around death. Even Jupiter couldn't find a path.",
      "@weremeow used all 9 lives on the first landmark. Classic cat behavior.",
      "@weremeow launched Jupiter Ultra for trail navigation. Slippage: 100%. Of his life.",
    ],
  },

  // ===== TIER 2: Wider crypto figures =====
  {
    handle: "VitalikButerin",
    uniqueDeaths: [
      "@VitalikButerin tried to explain Ethereum's roadmap to a bear. The bear fell asleep and crushed him.",
      "@VitalikButerin proposed EIP-9999: 'Don't Die On The Trail.' It's still in draft.",
      "@VitalikButerin said the trail needed sharding. He got sharded.",
    ],
  },
  {
    handle: "cz_binance", // CZ — handle renders as cz_binance on X
    uniqueDeaths: [
      "@cz_binance offered 4% APY on trail survival. Terms and conditions applied. He didn't survive them.",
      "@cz_binance said 'funds are SAFU.' They were not SAFU.",
      "@cz_binance tried to buy the trail. The SEC had questions.",
    ],
  },
  {
    handle: "CryptoHayes", // Arthur Hayes
    uniqueDeaths: [
      "@CryptoHayes called for 100x. Got 0x instead.",
      "@CryptoHayes tried to YOLO the river crossing. Got rekt with 100x leverage. Classic Arthur.",
      "@CryptoHayes wrote a 5,000-word essay about the metaphysics of trail survival. Died before the conclusion.",
    ],
  },
  {
    handle: "GCRClassic", // GCR
    uniqueDeaths: [
      "@GCRClassic predicted everything except this.",
      "@GCRClassic posted a cryptic tweet: 'the trail ends here.' Everyone thought it was alpha. It was literal.",
      "@GCRClassic counter-traded the bear. The bear doesn't read CT.",
    ],
  },
  {
    handle: "inversebrah",
    uniqueDeaths: [
      "@inversebrah inversed survival. It did not work out.",
      "@inversebrah inversed 'don't walk toward the bear.' Results were as expected.",
    ],
  },

  // ===== TIER 3: CT personalities =====
  {
    handle: "cobie", // Cobie
    uniqueDeaths: [
      "@cobie called the top... on his own life. Liquidated.",
      "@cobie went on a podcast to explain why the trail was dead. Then he was too.",
      "@cobie sold the trail at the bottom. Of a cliff.",
    ],
  },
  {
    handle: "HsakaTrades",
    uniqueDeaths: [
      "@HsakaTrades opened a leveraged long on survival. Got liquidated. Literally.",
      "@HsakaTrades drew the perfect support line. The bear broke through it. And him.",
    ],
  },
  {
    handle: "Zhusu", // Zhu Su (3AC)
    uniqueDeaths: [
      "@Zhusu's supercycle thesis did not apply to his lifespan.",
      "@Zhusu tried to borrow his way out of the trail. The lenders want their Big Macs back.",
      "@Zhusu fled the trail on a yacht. The yacht sank. Just like 3AC.",
    ],
  },
  {
    handle: "SBF_FTX",
    uniqueDeaths: [
      "@SBF_FTX was already in jail. How did he die on the trail? Customer funds were involved.",
      "@SBF_FTX promised to cover the party's losses. The check bounced. From prison.",
    ],
  },
  {
    handle: "APompliano",
    uniqueDeaths: [
      "@APompliano said the trail was going up forever. It went off a cliff.",
      "@APompliano tried to pump the bear. The bear doesn't watch YouTube.",
    ],
  },
  {
    handle: "DegenSpartan",
    uniqueDeaths: [
      "@DegenSpartan fought 300 bears. This is not the movie. There were no survivors.",
      "@DegenSpartan aped into a cave marked 'CERTAIN DEATH.' At least he was consistent.",
    ],
  },
  {
    handle: "loomdart",
    uniqueDeaths: [
      "@loomdart threw the last dart. It missed. Unlike the bear.",
      "@loomdart found the exit liquidity. It was a grave.",
    ],
  },
  {
    handle: "CryptoCobain",
    uniqueDeaths: [
      "@CryptoCobain saw it coming. Tweeted about it. Still died. At least the tweet went viral.",
      "@CryptoCobain predicted the bear market. Didn't predict the actual bear.",
    ],
  },
  {
    handle: "IamNomad",
    uniqueDeaths: [
      "@IamNomad wandered off the trail. Permanently. He's still nomading. In the afterlife.",
      "@IamNomad was last seen chasing a memecoin into a cave. The memecoin rugged. So did the cave.",
    ],
  },
  {
    handle: "pumpdotfun",
    uniqueDeaths: [
      "@pumpdotfun pumped. Then dumped. Then died. Circle of life on Solana.",
      "@pumpdotfun launched a survival token on the trail. It went to zero in 4 minutes.",
    ],
  },
];

// KOLs that should always appear (showcase deaths)
const MVP_FEATURED_HANDLES = ["blknoiz06", "toly"];

/** Pick 3 KOLs — featured ones first, then random fill */
export function getRandomKOLs(count = 3): KOL[] {
  const featured = KOLS.filter(k => MVP_FEATURED_HANDLES.includes(k.handle));
  const rest = KOLS.filter(k => !MVP_FEATURED_HANDLES.includes(k.handle));
  const shuffledRest = rest.sort(() => Math.random() - 0.5);
  return [...featured, ...shuffledRest].slice(0, count);
}

// ============================================================
// LANDMARKS
// ============================================================
export interface Landmark {
  id: string;
  name: string;
  protocol: string;
  sector: string;
  description: string;
  eventType: "river" | "decision" | "rest" | "danger";
  choices: { text: string; outcome: string; effect: "good" | "bad" | "neutral" }[];
}

const PROTOCOL_LANDMARKS: Record<string, Landmark> = {
  "jupiter ultra v6": {
    id: "jupiter", name: "Jupiter Crossing", protocol: "Jupiter", sector: "Aggregator",
    description: "The Jupiter river blocks your path. The current is strong with swap volume.",
    eventType: "river",
    choices: [
      { text: "Ford it (swap direct)", outcome: "You wade in. Slippage hits hard — lost some Big Macs!", effect: "bad" },
      { text: "Caulk the wagon (limit order)", outcome: "You set a limit order and wait. It fills! Safe crossing.", effect: "good" },
      { text: "Pay the ferry (DCA)", outcome: "You pay the aggregator fee. Jupiter handles routing. Smooth.", effect: "good" },
    ],
  },
  "raydium": {
    id: "raydium", name: "Raydium Pools", protocol: "Raydium", sector: "DEX",
    description: "You've reached the Raydium liquidity pools. The water looks... impermanent.",
    eventType: "rest",
    choices: [
      { text: "Provide liquidity", outcome: "Impermanent loss eats 20% of your Big Macs. Classic.", effect: "bad" },
      { text: "Just swap and move on", outcome: "Quick trade, fair price. The party continues.", effect: "neutral" },
      { text: "Rest by the pools", outcome: "The party rests. Health restored by concentrated liquidity.", effect: "good" },
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
      { text: "Collect mineral deposits", outcome: "You find yield in the springs. +5 SOL.", effect: "good" },
      { text: "Keep moving (no time)", outcome: "The party grumbles but pushes on. Morale drops.", effect: "bad" },
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
      { text: "Climb with leverage", outcome: "Liquidated halfway up. Party member falls.", effect: "bad" },
      { text: "Take the switchback", outcome: "Slow and steady. Everyone makes it. HODL energy.", effect: "good" },
      { text: "Hire a sherpa (5 SOL)", outcome: "Costs 5 SOL but guaranteed safe passage.", effect: "neutral" },
    ],
  },
  "moonshot create": {
    id: "moonshot", name: "Moonshot Mountain", protocol: "Moonshot", sector: "Launchpad",
    description: "A mountain that promises the moon at its peak. Many have tried. Few returned.",
    eventType: "decision",
    choices: [
      { text: "Climb to the moon", outcome: "It's just more rocks. But the view is nice. +morale.", effect: "neutral" },
      { text: "Mine the base", outcome: "You find some gems early. +8 SOL.", effect: "good" },
      { text: "Sell shovels to climbers", outcome: "Smart. +12 SOL. You are the real protocol.", effect: "good" },
    ],
  },
  "launchlab": {
    id: "launchlab", name: "LaunchLab Volcano", protocol: "LaunchLab", sector: "Launchpad",
    description: "An active volcano. Tokens erupt from the crater every few minutes.",
    eventType: "danger",
    choices: [
      { text: "Catch erupting tokens", outcome: "Most are worthless. +3 SOL from the one that wasn't.", effect: "neutral" },
      { text: "Go around", outcome: "Safe but slow. Watch others get rekt from a distance.", effect: "neutral" },
      { text: "Dive into the crater", outcome: "Full degen. Lost your merch but found a 100x. +20 SOL.", effect: "good" },
    ],
  },
  "lets bonk": {
    id: "letsbonk", name: "Bonk Town", protocol: "Lets Bonk", sector: "Launchpad",
    description: "A town where everyone communicates by bonking each other on the head.",
    eventType: "rest",
    choices: [
      { text: "Join the bonking", outcome: "Surprisingly therapeutic. +morale.", effect: "good" },
      { text: "Trade bonk tokens", outcome: "Break even. At least you had fun.", effect: "neutral" },
      { text: "This is weird, leave", outcome: "You miss the community airdrop. NGMI.", effect: "bad" },
    ],
  },
  "bags": {
    id: "bags", name: "Bag Holders' Pass", protocol: "Bags", sector: "Launchpad",
    description: "A mountain pass littered with heavy bags. Previous travelers couldn't let go.",
    eventType: "decision",
    choices: [
      { text: "Pick up some bags", outcome: "Heavier than expected. Your bulls slow down.", effect: "bad" },
      { text: "Step over the bags", outcome: "You learn from others' mistakes. Diamond hands ≠ heavy bags.", effect: "good" },
      { text: "Sort through for gems", outcome: "Most are junk but you find one winner. +5 SOL.", effect: "good" },
    ],
  },
  "believe": {
    id: "believe", name: "Believe Bridge", protocol: "Believe", sector: "Launchpad",
    description: "A bridge that only appears if you believe in it. Seriously.",
    eventType: "river",
    choices: [
      { text: "Believe and walk", outcome: "The bridge holds! Your conviction is rewarded.", effect: "good" },
      { text: "Test it first", outcome: "You throw a rock. It falls. You find another way.", effect: "neutral" },
      { text: "Refuse to believe", outcome: "Bridge vanishes. You swim. Lost some Big Macs.", effect: "bad" },
    ],
  },
  "jupiter dca": {
    id: "jupdca", name: "DCA Valley", protocol: "Jupiter DCA", sector: "Aggregator",
    description: "A peaceful valley where supplies trickle in at regular intervals.",
    eventType: "rest",
    choices: [
      { text: "Set up DCA camp", outcome: "Steady gains. +5 SOL, +health.", effect: "good" },
      { text: "Lump sum the valley", outcome: "Bought everything at once. Market dumps. Lost 5 SOL.", effect: "bad" },
      { text: "Pass through quickly", outcome: "No time for DCA. The party moves on.", effect: "neutral" },
    ],
  },
};

const FALLBACK_LANDMARKS: Landmark[] = [
  {
    id: "phantom_pass", name: "Phantom Pass", protocol: "Phantom", sector: "Wallet",
    description: "A ghost town. Everyone here connected their wallet to the wrong site.",
    eventType: "danger",
    choices: [
      { text: "Check your approvals", outcome: "Smart. You revoke 47 suspicious token approvals.", effect: "good" },
      { text: "Connect to free WiFi", outcome: "It's a honeypot. Lost gas fees to a phishing site.", effect: "bad" },
      { text: "Keep walking", outcome: "You avoid the ghost town entirely.", effect: "neutral" },
    ],
  },
  {
    id: "wormhole", name: "Wormhole Bridge", protocol: "Wormhole", sector: "Bridge",
    description: "A rickety bridge over a bottomless chasm. Sign: 'NOT RESPONSIBLE FOR LOST FUNDS'",
    eventType: "river",
    choices: [
      { text: "Cross the bridge", outcome: "Made it! Only lost a sock. Could've been worse.", effect: "neutral" },
      { text: "Find another way", outcome: "3 days around the chasm. Exhausting but safe.", effect: "neutral" },
      { text: "Bungee jump off it", outcome: "Why. Lost your merch on the way down. But what a rush.", effect: "bad" },
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

  while (landmarks.length < 1) {
    const fb = FALLBACK_LANDMARKS[landmarks.length % FALLBACK_LANDMARKS.length];
    if (!seen.has(fb.id)) {
      seen.add(fb.id);
      landmarks.push(fb);
    } else break;
  }

  // Cap at 1 landmark for fast gameplay
  return landmarks.slice(0, 1);
}

// ============================================================
// RANDOM EVENTS
// ============================================================
export interface RandomEvent {
  text: string;
  effect: "catastrophic" | "bad" | "good" | "neutral";
}

export const RANDOM_EVENTS: RandomEvent[] = [
  // Catastrophic - DEATH EVENTS
  { text: "PARTY_MEMBER got rugged on a memecoin. The shock was fatal.", effect: "catastrophic" },
  { text: "PARTY_MEMBER has dysentery. Shouldn't have eaten that gas station sushi at the Solana hackathon.", effect: "catastrophic" },
  { text: "PARTY_MEMBER clicked a 'free mint' link. Wallet drained. They didn't survive the loss.", effect: "catastrophic" },
  { text: "PARTY_MEMBER went all-in on a 100x leveraged perp. Liquidated. Literally.", effect: "catastrophic" },
  { text: "PARTY_MEMBER shared their seed phrase in a Discord DM with 'Phantom Support.' RIP.", effect: "catastrophic" },
  { text: "PARTY_MEMBER got exit scammed by a KOL's promoted token. Lost everything.", effect: "catastrophic" },
  { text: "A bridge exploit drained PARTY_MEMBER's wallet. They walked into the desert.", effect: "catastrophic" },
  { text: "PARTY_MEMBER tried to catch a falling knife. The knife won.", effect: "catastrophic" },
  { text: "PARTY_MEMBER was pump and dumped by a celebrity token. The emotional damage was fatal.", effect: "catastrophic" },
  { text: "RFK Jr. showed up and replaced all your medicine with raw milk and deer antler velvet. PARTY_MEMBER got a brain worm. It was fatal.", effect: "catastrophic" },
  { text: "PARTY_MEMBER tried the carnivore-only trail diet. Got scurvy. In 2026. Died of something medieval.", effect: "catastrophic" },
  { text: "PARTY_MEMBER bought 'blockchain-verified supplements' from a guy in a van. They were just horse paste. The horse paste won.", effect: "catastrophic" },
  // Bad
  { text: "Failed transaction. Lost 2 SOL in gas fees. Solana said 400ms but it felt like 400 years.", effect: "bad" },
  { text: "Your Phantom wallet won't connect. You restart 17 times. Wasted a day.", effect: "bad" },
  { text: "Network congested. Priority fees eating into your stack.", effect: "bad" },
  { text: "One of your bulls got spooked by a red candle. It ran away.", effect: "bad" },
  { text: "A KOL you followed dumped their bags on you.", effect: "bad" },
  { text: "Food poisoning from a sketchy gas station Big Mac. Party health drops.", effect: "bad" },
  { text: "Gas fees spiked. Every transaction costs 10x more.", effect: "bad" },
  { text: "Your party ate through half the Big Macs in one night.", effect: "bad" },
  { text: "Someone mixed up the ivermectin with the coffee creamer. Half the party has the runs.", effect: "bad" },
  { text: "A wellness influencer sold your party $200 of jade eggs. They do nothing. Lost SOL.", effect: "bad" },
  // Good
  { text: "Discovered a forgotten airdrop! Free SOL from a protocol you used once in 2023!", effect: "good" },
  { text: "A friendly whale donated Big Macs to your party! Wagmi.", effect: "good" },
  { text: "A memecoin you forgot about did a 50x overnight!", effect: "good" },
  { text: "Someone's essential oils actually worked?! Party health restored. Even the doctor in your party is confused.", effect: "good" },
  { text: "You found an abandoned Ledger on the trail. It has some SOL!", effect: "good" },
  { text: "A VC airdropped your party some SOL for looking promising.", effect: "good" },
  // Neutral — time passes, minor costs
  { text: "You find an abandoned wallet. It has 0.001 SOL and 47 worthless tokens. The party spends hours trying to recover anything useful.", effect: "neutral" },
  { text: "A stranger offers 1000 monkey JPEGs for 1 Big Mac. You decline, but the negotiation took half the day.", effect: "neutral" },
  { text: "You meet a traveling validator. He shares war stories about the Feb 2023 outage. Talks for hours on end. The party eats through supplies waiting for him to shut up.", effect: "neutral" },
  { text: "Solana goes down for maintenance. The party is stuck waiting for it to come back. Everyone burns through supplies.", effect: "neutral" },
  { text: "Two degens argue about whether SOL will hit $1000. The debate lasts 6 hours. Nobody has touched grass in months and the party ate while watching.", effect: "neutral" },
  { text: "The party gets lost following a Twitter thread that promised a shortcut. Hours wasted. Supplies consumed.", effect: "neutral" },
  { text: "A dust storm of worthless airdrops hits the trail. The party takes shelter and waits it out, burning through Big Macs.", effect: "neutral" },
];

// ============================================================
// TRAVEL FLAVOR TEXT (shown during wagon animation)
// ============================================================
export const TRAVEL_FLAVOR: string[] = [
  "PARTY_MEMBER is looking pale...",
  "PARTY_MEMBER found a stale Big Mac on the trail.",
  "PARTY_MEMBER is arguing about ETH vs SOL again.",
  "PARTY_MEMBER won't stop checking CoinGecko.",
  "PARTY_MEMBER is drafting a tweet about the journey.",
  "PARTY_MEMBER claims they called the top. Nobody believes them.",
  "PARTY_MEMBER is trying to mint the sunset as an NFT.",
  "PARTY_MEMBER just realized they left their Ledger at the last stop.",
  "PARTY_MEMBER is explaining Layer 2 scaling to the bulls. They don't care.",
  "PARTY_MEMBER swears they saw Satoshi behind that rock.",
  "PARTY_MEMBER is live-tweeting the trail. 3 likes so far.",
  "PARTY_MEMBER keeps refreshing their portfolio.",
  "PARTY_MEMBER is writing a Medium article about trail survival. Nobody will read it.",
  "PARTY_MEMBER says 'this is just like 2018' for the 47th time.",
  "PARTY_MEMBER is trying to stake the campfire.",
];

// ============================================================
// SBF DIALOGUE
// ============================================================
export const SBF_DIALOGUE: string[] = [
  "Hey traveler... psst... over here...",
  "I have a new exchange. Totally safe this time. Customer funds are SAFU.",
  "Come on, 20% APY guaranteed. What could possibly go wrong?",
  "Look, this time it's different. I pinky promise. Cross my heart and hope to— well, you know.",
];

// ============================================================
// HUNT TARGETS
// ============================================================
export interface HuntTarget {
  name: string;
  sprite: string;
  points: number;
  speed: number;
}

export const HUNT_TARGETS: HuntTarget[] = [
  { name: "Bear", sprite: "/images/trail/bear.png", points: 3, speed: 3 },
  { name: "Bear", sprite: "/images/trail/bear.png", points: 2, speed: 4 },
  { name: "Bear", sprite: "/images/trail/bear.png", points: 4, speed: 5 },
  { name: "Bull", sprite: "/images/trail/bull.png", points: -5, speed: 2 },
];

// ============================================================
// TRUMP MISS QUOTES
// ============================================================
export const TRUMP_MISS_QUOTES: string[] = [
  "Terrible aim! With shooting like that, you're definitely not getting drafted for Iran!",
  "Sad! Even Sleepy Joe could've hit that one!",
  "That's the worst shot I've ever seen. And I've seen a LOT of bad shots, believe me.",
  "You missed bigly! But don't worry, we won't need you for the draft.",
  "Wow. Just wow. My 10-year-old grandson shoots better than that. Tremendous failure!",
];

// ============================================================
// BIOS BOOT SEQUENCE
// ============================================================
export const BIOS_LINES: string[] = [
  "SOLANA TRAIL BIOS v4.20.69",
  "Copyright (c) 2024 Slice Analytics",
  "",
  "Checking wallet connection.......... OK",
  "RAM: 640K (should be enough for anybody)",
  "Scanning blockchain................ OK",
  "Loading trail protocols............ OK",
  "Initializing CRT display.......... OK",
  "",
  "Press any key to continue...",
];
