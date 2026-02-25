export interface ScoreData {
  wallet: string;
  score: number;
  protocol_fees_paid: number;
  network_fees_paid: number;
  current_holdings: number;
  protocol_count: number;
  protocols_used: string | null;
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
}

export const TIERS: TierInfo[] = [
  {
    name: "Diamond",
    minScore: 80,
    color: "text-cyan-300",
    bgColor: "bg-cyan-900/20",
    borderColor: "border-cyan-500/30",
    icon: "💎",
    gradient: "from-cyan-400 to-blue-500",
  },
  {
    name: "Platinum",
    minScore: 60,
    color: "text-violet-300",
    bgColor: "bg-violet-900/20",
    borderColor: "border-violet-500/30",
    icon: "✦",
    gradient: "from-violet-400 to-purple-500",
  },
  {
    name: "Gold",
    minScore: 40,
    color: "text-yellow-300",
    bgColor: "bg-yellow-900/20",
    borderColor: "border-yellow-500/30",
    icon: "🥇",
    gradient: "from-yellow-400 to-amber-500",
  },
  {
    name: "Silver",
    minScore: 20,
    color: "text-zinc-300",
    bgColor: "bg-zinc-700/20",
    borderColor: "border-zinc-400/30",
    icon: "🥈",
    gradient: "from-zinc-300 to-zinc-500",
  },
  {
    name: "Bronze",
    minScore: 0,
    color: "text-orange-300",
    bgColor: "bg-orange-900/20",
    borderColor: "border-orange-600/30",
    icon: "🥉",
    gradient: "from-orange-400 to-orange-600",
  },
];

export function getTier(score: number): TierInfo {
  return TIERS.find((t) => score >= t.minScore) || TIERS[TIERS.length - 1];
}

export function estimatePercentile(score: number): number {
  if (score >= 80) return Math.min(99, 98 + (score - 80) * 0.05);
  if (score >= 60) return 90 + ((score - 60) / 20) * 8;
  if (score >= 40) return 70 + ((score - 40) / 20) * 20;
  if (score >= 20) return 40 + ((score - 20) / 20) * 30;
  return (score / 20) * 40;
}

export function estimateRank(score: number): number {
  // Rough estimation from 30M users
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
