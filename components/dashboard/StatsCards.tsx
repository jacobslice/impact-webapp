import type { ScoreData } from "@/lib/types";
import { formatCurrency } from "@/lib/types";

interface StatsCardsProps {
  data: ScoreData;
}

export function StatsCards({ data }: StatsCardsProps) {
  const stats = [
    {
      label: "Protocol Fees",
      value: formatCurrency(data.protocol_fees_paid),
    },
    {
      label: "Holdings",
      value: formatCurrency(data.current_holdings),
    },
    {
      label: "Months Active",
      value: String(data.months_active),
    },
    {
      label: "Protocols Used",
      value: String(data.protocol_count),
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="glass-card relative overflow-hidden p-3.5"
        >
          {/* Top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
          <div className="text-[10px] text-white/35 font-medium uppercase tracking-wider mb-1.5">
            {stat.label}
          </div>
          <div className="text-lg font-extrabold text-white/90">
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}
