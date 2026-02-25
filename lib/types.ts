export interface ScoreData {
  wallet: string;
  score: number;
  protocol_fees_paid: number;
  network_fees_paid: number;
  current_holdings: number;
  protocol_count: number;
  protocols_used: string[] | string | null;
  months_active: number;
  is_sybil: string | null;
  jup_fees_paid: number;
  jup_staker: boolean;
  jup_perps_user: boolean;
}

export interface ScoreBreakdownItem {
  name: string;
  score: number;
  maxScore: number;
}

export interface TierInfo {
  name: string;
  minScore: number;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  gradient: string;
  description: string;
}

export const TIERS: TierInfo[] = [
  {
    name: "Whale",
    minScore: 95,
    color: "text-cyan-300",
    bgColor: "bg-cyan-900/20",
    borderColor: "border-cyan-400/30",
    icon: "🐋",
    gradient: "from-cyan-400 to-blue-500",
    description: "Elite on-chain presence. Top-tier cross-protocol activity, massive fees paid, and deep ecosystem engagement. These wallets are the backbone of Solana DeFi.",
  },
  {
    name: "Power User",
    minScore: 90,
    color: "text-violet-300",
    bgColor: "bg-violet-900/20",
    borderColor: "border-violet-400/30",
    icon: "⚡",
    gradient: "from-violet-400 to-purple-500",
    description: "Highly active across multiple protocols with significant fees and consistent engagement. Strong organic behavior with deep DeFi usage.",
  },
  {
    name: "Active User",
    minScore: 80,
    color: "text-emerald-300",
    bgColor: "bg-emerald-900/20",
    borderColor: "border-emerald-400/30",
    icon: "🟢",
    gradient: "from-emerald-400 to-green-500",
    description: "Regular ecosystem participant with meaningful protocol diversity. Consistent on-chain activity and solid contribution to network fees.",
  },
  {
    name: "Average User",
    minScore: 60,
    color: "text-yellow-300",
    bgColor: "bg-yellow-900/20",
    borderColor: "border-yellow-500/30",
    icon: "🟡",
    gradient: "from-yellow-400 to-amber-500",
    description: "Moderate activity across a few protocols. Uses the ecosystem regularly but with less breadth than higher tiers.",
  },
  {
    name: "Likely Human",
    minScore: 40,
    color: "text-orange-300",
    bgColor: "bg-orange-900/20",
    borderColor: "border-orange-500/30",
    icon: "🟠",
    gradient: "from-orange-400 to-orange-600",
    description: "Low but organic-looking activity. Occasional transactions suggest a real user with limited engagement.",
  },
  {
    name: "Potential Sybil",
    minScore: 20,
    color: "text-red-300",
    bgColor: "bg-red-900/20",
    borderColor: "border-red-500/30",
    icon: "🔴",
    gradient: "from-red-400 to-red-600",
    description: "Minimal cross-protocol activity with patterns that may indicate automated or inorganic behavior. Requires further verification.",
  },
  {
    name: "Sybil",
    minScore: 0,
    color: "text-red-400",
    bgColor: "bg-red-950/30",
    borderColor: "border-red-600/30",
    icon: "🚫",
    gradient: "from-red-500 to-red-800",
    description: "Near-zero cross-protocol activity. High probability of being a sybil wallet, bot, or single-use airdrop farmer.",
  },
];

export function getTier(score: number): TierInfo {
  return TIERS.find((t) => score >= t.minScore) || TIERS[TIERS.length - 1];
}

export function estimatePercentile(score: number): number {
  if (score >= 95) return Math.min(99.5, 99 + (score - 95) * 0.1);
  if (score >= 90) return 97 + ((score - 90) / 5) * 2;
  if (score >= 80) return 90 + ((score - 80) / 10) * 7;
  if (score >= 60) return 70 + ((score - 60) / 20) * 20;
  if (score >= 40) return 40 + ((score - 40) / 20) * 30;
  if (score >= 20) return 15 + ((score - 20) / 20) * 25;
  return (score / 20) * 15;
}

export function estimateRank(score: number): number {
  const percentile = estimatePercentile(score);
  return Math.max(1, Math.round(30_000_000 * (1 - percentile / 100)));
}

export function truncateAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(2);
}

export function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}
