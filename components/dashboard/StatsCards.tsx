import type { ScoreData } from "@/lib/types";
import { Shield, ShieldX } from "lucide-react";

interface StatsCardsProps {
  data: ScoreData;
  blurred?: boolean;
}

export function StatsCards({ data, blurred = false }: StatsCardsProps) {
  const sybilPassed = data.is_sybil !== "true" && data.is_sybil !== "1";

  const stats = [
    {
      label: "Sybil Check",
      value: sybilPassed ? "Pass" : "Fail",
      icon: sybilPassed ? (
        <Shield className="w-4 h-4 text-emerald-400" />
      ) : (
        <ShieldX className="w-4 h-4 text-red-400" />
      ),
      valueColor: sybilPassed ? "text-emerald-400" : "text-red-400",
      borderColor: sybilPassed ? "via-emerald-500/30" : "via-red-500/30",
    },
    {
      label: "Network Fees",
      value: `${data.network_fees_paid.toFixed(2)} SOL`,
      valueColor: "text-white/90",
      borderColor: "via-purple-500/20",
    },
    {
      label: "Wallet Age",
      value: `${data.months_active} month${data.months_active !== 1 ? "s" : ""}`,
      valueColor: "text-white/90",
      borderColor: "via-purple-500/20",
    },
    {
      label: "Protocols Used",
      value: String(data.protocol_count),
      valueColor: "text-white/90",
      borderColor: "via-purple-500/20",
    },
  ];

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 ${blurred ? "blur-[6px] select-none pointer-events-none" : ""}`}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="glass-card relative overflow-hidden p-3.5"
        >
          <div
            className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${stat.borderColor} to-transparent`}
          />
          <div className="text-[10px] text-white/35 font-medium uppercase tracking-wider mb-1.5">
            {stat.label}
          </div>
          <div className={`text-lg font-extrabold ${stat.valueColor} flex items-center gap-2`}>
            {stat.icon}
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}
