// Score tier definitions
export interface ScoreTier {
  name: string;
  minScore: number;
  maxScore: number;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
}

export const SCORE_TIERS: ScoreTier[] = [
  {
    name: "Diamond",
    minScore: 80,
    maxScore: 100,
    color: "text-cyan-300",
    bgColor: "bg-cyan-900/30",
    borderColor: "border-cyan-500",
    icon: "💎",
  },
  {
    name: "Gold",
    minScore: 50,
    maxScore: 79.99,
    color: "text-yellow-300",
    bgColor: "bg-yellow-900/30",
    borderColor: "border-yellow-500",
    icon: "🥇",
  },
  {
    name: "Silver",
    minScore: 25,
    maxScore: 49.99,
    color: "text-zinc-300",
    bgColor: "bg-zinc-700/30",
    borderColor: "border-zinc-400",
    icon: "🥈",
  },
  {
    name: "Bronze",
    minScore: 10,
    maxScore: 24.99,
    color: "text-orange-300",
    bgColor: "bg-orange-900/30",
    borderColor: "border-orange-600",
    icon: "🥉",
  },
  {
    name: "Newcomer",
    minScore: 0,
    maxScore: 9.99,
    color: "text-zinc-400",
    bgColor: "bg-zinc-800/30",
    borderColor: "border-zinc-600",
    icon: "🌱",
  },
];

export function getScoreTier(score: number): ScoreTier {
  return (
    SCORE_TIERS.find((tier) => score >= tier.minScore && score <= tier.maxScore) ||
    SCORE_TIERS[SCORE_TIERS.length - 1]
  );
}

// Percentile estimation based on score
// This is an approximation - in production you'd calculate from actual distribution
export function estimatePercentile(score: number): number {
  // Assuming roughly normal distribution skewed toward lower scores
  // Score 0-10: bottom 40%
  // Score 10-25: 40-60%
  // Score 25-50: 60-85%
  // Score 50-80: 85-98%
  // Score 80+: top 2%

  if (score >= 80) return Math.min(99, 98 + (score - 80) * 0.05);
  if (score >= 50) return 85 + ((score - 50) / 30) * 13;
  if (score >= 25) return 60 + ((score - 25) / 25) * 25;
  if (score >= 10) return 40 + ((score - 10) / 15) * 20;
  return (score / 10) * 40;
}

// Score breakdown components with their weights
export interface ScoreComponent {
  name: string;
  category: "Value" | "Activity";
  weight: number;
  description: string;
}

export const SCORE_COMPONENTS: ScoreComponent[] = [
  {
    name: "Protocol Fees",
    category: "Value",
    weight: 30,
    description: "Fees paid to Solana protocols",
  },
  {
    name: "Network Fees",
    category: "Value",
    weight: 10,
    description: "Transaction fees paid to validators",
  },
  {
    name: "Holdings",
    category: "Value",
    weight: 10,
    description: "Current value of Solana tokens",
  },
  {
    name: "Protocol Diversity",
    category: "Activity",
    weight: 30,
    description: "Number of protocols used",
  },
  {
    name: "Consistency",
    category: "Activity",
    weight: 20,
    description: "Months of activity on Solana",
  },
];

// Recent lookups storage
const RECENT_LOOKUPS_KEY = "solana-score-recent-lookups";
const MAX_RECENT_LOOKUPS = 5;

export interface RecentLookup {
  address: string;
  score: number;
  tier: string;
  timestamp: number;
}

export function getRecentLookups(): RecentLookup[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(RECENT_LOOKUPS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addRecentLookup(lookup: Omit<RecentLookup, "timestamp">): void {
  if (typeof window === "undefined") return;
  try {
    const lookups = getRecentLookups();
    // Remove existing entry for this address
    const filtered = lookups.filter((l) => l.address !== lookup.address);
    // Add new entry at the beginning
    const updated = [
      { ...lookup, timestamp: Date.now() },
      ...filtered,
    ].slice(0, MAX_RECENT_LOOKUPS);
    localStorage.setItem(RECENT_LOOKUPS_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
}

export function clearRecentLookups(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(RECENT_LOOKUPS_KEY);
  } catch {
    // Ignore storage errors
  }
}

// Utility to truncate address for display
export function truncateAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
