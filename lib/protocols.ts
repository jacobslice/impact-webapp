export interface Protocol {
  name: string;
  displayName: string;
  sector: string;
  logo?: string;
}

export const PROTOCOLS: Record<string, Protocol> = {
  // DEX
  "pumpswap": {
    name: "pumpswap",
    displayName: "PumpSwap",
    sector: "Dex",
    logo: "/images/protocols/pumpfun.png", // Uses pump.fun branding
  },
  "raydium cpmm": {
    name: "raydium cpmm",
    displayName: "Raydium CPMM",
    sector: "Dex",
    logo: "/images/protocols/raydium.jpg",
  },
  "raydium amm": {
    name: "raydium amm",
    displayName: "Raydium AMM",
    sector: "Dex",
    logo: "/images/protocols/raydium.jpg",
  },
  "raydium clmm": {
    name: "raydium clmm",
    displayName: "Raydium CLMM",
    sector: "Dex",
    logo: "/images/protocols/raydium.jpg",
  },
  "raydium": {
    name: "raydium",
    displayName: "Raydium",
    sector: "Dex",
    logo: "/images/protocols/raydium.jpg",
  },
  "orca": {
    name: "orca",
    displayName: "Orca",
    sector: "Dex",
    logo: "/images/protocols/orca.jpg",
  },
  "meteora damm v2": {
    name: "meteora damm v2",
    displayName: "Meteora DAMM v2",
    sector: "Dex",
    logo: "/images/protocols/meteora.jpg",
  },
  "meteora": {
    name: "meteora",
    displayName: "Meteora",
    sector: "Dex",
    logo: "/images/protocols/meteora.jpg",
  },
  "byreal clmm": {
    name: "byreal clmm",
    displayName: "ByReal CLMM",
    sector: "Dex",
    logo: "/images/protocols/byreal.jpg",
  },

  // Launchpad
  "moonshot create": {
    name: "moonshot create",
    displayName: "Moonshot Create",
    sector: "Launchpad",
    logo: "/images/protocols/moonshot.jpg",
  },
  "launchlab": {
    name: "launchlab",
    displayName: "LaunchLab",
    sector: "Launchpad",
    logo: "/images/protocols/launchlab.jpg",
  },
  "pump.fun": {
    name: "pump.fun",
    displayName: "Pump.fun",
    sector: "Launchpad",
    logo: "/images/protocols/pumpfun.png",
  },
  "lets bonk": {
    name: "lets bonk",
    displayName: "Lets Bonk",
    sector: "Launchpad",
    logo: "/images/protocols/letsbonk.jpg",
  },
  "bags": {
    name: "bags",
    displayName: "Bags",
    sector: "Launchpad",
    logo: "/images/protocols/bags.jpg",
  },
  "believe": {
    name: "believe",
    displayName: "Believe",
    sector: "Launchpad",
    logo: "/images/protocols/believe.jpg",
  },

  // DEX Aggregator
  "jupiter aggregator ultra (v6)": {
    name: "jupiter aggregator ultra (v6)",
    displayName: "Jupiter Ultra",
    sector: "Dex Aggregator",
    logo: "/images/protocols/jupiter.svg",
  },
  "jupiter ultra v6": {
    name: "jupiter ultra v6",
    displayName: "Jupiter Ultra",
    sector: "Dex Aggregator",
    logo: "/images/protocols/jupiter.svg",
  },
  "jupiter aggregator limit order": {
    name: "jupiter aggregator limit order",
    displayName: "Jupiter Limit Order",
    sector: "Dex Aggregator",
    logo: "/images/protocols/jupiter.svg",
  },
  "jupiter dca": {
    name: "jupiter dca",
    displayName: "Jupiter DCA",
    sector: "Dex Aggregator",
    logo: "/images/protocols/jupiter.svg",
  },

  // Perps
  "jupiter perps": {
    name: "jupiter perps",
    displayName: "Jupiter Perps",
    sector: "Perps",
    logo: "/images/protocols/jupiter.svg",
  },
  "drift perps": {
    name: "drift perps",
    displayName: "Drift Perps",
    sector: "Perps",
    logo: "/images/protocols/drift.png",
  },
  "drift": {
    name: "drift",
    displayName: "Drift",
    sector: "Perps",
    logo: "/images/protocols/drift.png",
  },

  // Trading Apps
  "axiom": {
    name: "axiom",
    displayName: "Axiom",
    sector: "Trading App",
    logo: "/images/protocols/axiom.png",
  },
  "moonshot.money": {
    name: "moonshot.money",
    displayName: "Moonshot.money",
    sector: "Trading App",
    logo: "/images/protocols/moonshot.jpg",
  },
  "photon": {
    name: "photon",
    displayName: "Photon",
    sector: "Trading App",
    logo: "/images/protocols/photon.png",
  },

  // Wallet
  "phantom": {
    name: "phantom",
    displayName: "Phantom",
    sector: "Wallet",
    logo: "/images/protocols/phantom.jpg",
  },

  // Other
  "dex screener": {
    name: "dex screener",
    displayName: "Dex Screener",
    sector: "Other",
    logo: "/images/protocols/dexscreener.png",
  },
  "dexscreener": {
    name: "dexscreener",
    displayName: "DexScreener",
    sector: "Other",
    logo: "/images/protocols/dexscreener.png",
  },
  "dex tools": {
    name: "dex tools",
    displayName: "Dex Tools",
    sector: "Other",
    logo: "/images/protocols/dextools.png",
  },
  "dextools": {
    name: "dextools",
    displayName: "DexTools",
    sector: "Other",
    logo: "/images/protocols/dextools.png",
  },
};

export function getProtocol(name: string): Protocol {
  const key = name.toLowerCase().trim();
  return (
    PROTOCOLS[key] || {
      name: key,
      displayName: name,
      sector: "Other",
    }
  );
}

export const SECTOR_COLORS: Record<string, string> = {
  Dex: "bg-blue-900/50 border-blue-700 text-blue-300",
  Launchpad: "bg-orange-900/50 border-orange-700 text-orange-300",
  "Dex Aggregator": "bg-purple-900/50 border-purple-700 text-purple-300",
  Perps: "bg-red-900/50 border-red-700 text-red-300",
  "Trading App": "bg-cyan-900/50 border-cyan-700 text-cyan-300",
  Wallet: "bg-violet-900/50 border-violet-700 text-violet-300",
  Other: "bg-zinc-800 border-zinc-600 text-zinc-300",
};
