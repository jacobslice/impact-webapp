"use client";

import { SCORE_COMPONENTS } from "@/lib/score-utils";

interface ScoreBreakdownProps {
  protocolFees: number;
  networkFees: number;
  holdings: number;
  protocolCount: number;
  monthsActive: number;
}

export function ScoreBreakdown({
  protocolFees,
  networkFees,
  holdings,
  protocolCount,
  monthsActive,
}: ScoreBreakdownProps) {
  // Calculate relative contribution for each component
  // These are rough estimates of how the score is computed
  const maxProtocolFees = 1000; // $1000 gets max points
  const maxNetworkFees = 10; // 10 SOL gets max points
  const maxHoldings = 10000; // $10k gets max points
  const maxProtocols = 10; // 10 protocols gets max points
  const maxMonths = 12; // 12 months gets max points

  const valueComponents = [
    {
      name: "Protocol Fees",
      weight: 30,
      fill: Math.min(100, (protocolFees / maxProtocolFees) * 100),
      value: `$${protocolFees.toFixed(2)}`,
      color: "bg-purple-500",
    },
    {
      name: "Network Fees",
      weight: 10,
      fill: Math.min(100, (networkFees / maxNetworkFees) * 100),
      value: `${networkFees.toFixed(4)} SOL`,
      color: "bg-purple-400",
    },
    {
      name: "Holdings",
      weight: 10,
      fill: Math.min(100, (holdings / maxHoldings) * 100),
      value: `$${holdings.toFixed(2)}`,
      color: "bg-purple-300",
    },
  ];

  const activityComponents = [
    {
      name: "Protocol Diversity",
      weight: 30,
      fill: Math.min(100, (protocolCount / maxProtocols) * 100),
      value: `${protocolCount} protocols`,
      color: "bg-green-500",
    },
    {
      name: "Consistency",
      weight: 20,
      fill: Math.min(100, (monthsActive / maxMonths) * 100),
      value: `${monthsActive} months`,
      color: "bg-green-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Category Headers */}
      <div className="flex justify-between text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500" />
          <span className="text-zinc-400">Value (50%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-zinc-400">Activity (50%)</span>
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
      </div>

      {/* Value Components */}
      <div className="space-y-3">
        {valueComponents.map((component) => (
          <div key={component.name} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">
                {component.name}{" "}
                <span className="text-zinc-600">({component.weight}%)</span>
              </span>
              <span className="text-zinc-300 font-mono text-xs">
                {component.value}
              </span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${component.color} rounded-full transition-all duration-1000 ease-out`}
                style={{ width: `${component.fill}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-zinc-800" />

      {/* Activity Components */}
      <div className="space-y-3">
        {activityComponents.map((component) => (
          <div key={component.name} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">
                {component.name}{" "}
                <span className="text-zinc-600">({component.weight}%)</span>
              </span>
              <span className="text-zinc-300 font-mono text-xs">
                {component.value}
              </span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${component.color} rounded-full transition-all duration-1000 ease-out`}
                style={{ width: `${component.fill}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="pt-2 text-xs text-zinc-600 text-center">
        Bar shows relative contribution toward maximum possible score
      </div>
    </div>
  );
}
