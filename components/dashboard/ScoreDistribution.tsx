import { SCORE_DISTRIBUTION } from "@/lib/mock-data";

interface ScoreDistributionProps {
  userScore: number;
}

export function ScoreDistribution({ userScore }: ScoreDistributionProps) {
  // Determine which range the user falls in
  const getUserRange = (score: number): string => {
    if (score >= 90) return "90-100";
    if (score >= 80) return "80-89";
    if (score >= 60) return "60-79";
    if (score >= 40) return "40-59";
    if (score >= 20) return "20-39";
    return "0-19";
  };

  const userRange = getUserRange(userScore);
  const maxPct = Math.max(...SCORE_DISTRIBUTION.map((d) => d.percentage));

  return (
    <div>
      <div className="text-[10.5px] font-semibold uppercase tracking-wider text-white/35 mb-3">
        Score Distribution
      </div>
      <div className="flex flex-col gap-1.5">
        {SCORE_DISTRIBUTION.map((d) => {
          const isHighlight = d.range === userRange;
          const barWidth = (d.percentage / maxPct) * 100;
          return (
            <div key={d.range} className="flex items-center gap-2">
              <span className="w-[62px] text-[10px] font-medium text-white/35 text-right">
                {d.range}
              </span>
              <div className="flex-1 h-3.5 bg-white/[0.03] rounded overflow-hidden relative">
                <div
                  className={`h-full rounded transition-all duration-500 ease-out ${
                    isHighlight
                      ? "bg-gradient-to-r from-[#9945FF] to-[#14F195] shadow-[0_0_8px_rgba(153,69,255,0.3)]"
                      : "bg-[#9945FF]/25"
                  }`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              <span className="w-8 text-[10px] font-semibold text-white/35">
                {d.percentage}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
