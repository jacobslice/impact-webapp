import type { ScoreBreakdownItem } from "@/lib/types";

interface ScoreBreakdownBarsProps {
  items: ScoreBreakdownItem[];
  blurred?: boolean;
}

function getBarColor(score: number): { gradient: string; textColor: string } {
  if (score >= 85) return { gradient: "from-[#9945FF] to-[#14F195]", textColor: "text-[#14F195]" };
  if (score >= 70) return { gradient: "from-[#9945FF] to-[#00D1FF]", textColor: "text-[#00D1FF]" };
  if (score >= 50) return { gradient: "from-[#9945FF] to-[#fbbf24]", textColor: "text-[#fbbf24]" };
  return { gradient: "from-[#9945FF] to-[#f43f5e]", textColor: "text-[#f43f5e]" };
}

export function ScoreBreakdownBars({ items, blurred = false }: ScoreBreakdownBarsProps) {
  return (
    <div className={`flex flex-col gap-3 ${blurred ? "blur-[6px] select-none pointer-events-none" : ""}`}>
      {items.map((item) => {
        const { gradient, textColor } = getBarColor(item.score);
        return (
          <div key={item.name} className="flex items-center gap-2.5">
            <span className="w-[130px] text-xs font-medium text-white/55 shrink-0">
              {item.name}
            </span>
            <div className="flex-1 h-2 bg-white/5 rounded overflow-hidden">
              <div
                className={`h-full rounded bg-gradient-to-r ${gradient} transition-all duration-600 ease-out`}
                style={{ width: `${(item.score / item.maxScore) * 100}%` }}
              />
            </div>
            <span className={`w-7 text-right text-[12.5px] font-bold ${textColor}`}>
              {item.score}
            </span>
          </div>
        );
      })}
    </div>
  );
}
