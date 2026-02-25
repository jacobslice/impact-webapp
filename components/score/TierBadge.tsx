import { getTier } from "@/lib/types";

interface TierBadgeProps {
  score: number;
  className?: string;
}

export function TierBadge({ score, className = "" }: TierBadgeProps) {
  const tier = getTier(score);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${tier.bgColor} ${tier.borderColor} ${tier.color} ${className}`}
    >
      <span>{tier.icon}</span>
      {tier.name}
    </span>
  );
}
