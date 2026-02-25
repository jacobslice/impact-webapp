import type { ScoreBreakdownItem } from "@/lib/types";

interface ScoreBreakdownBarsProps {
  items: ScoreBreakdownItem[];
}

export function ScoreBreakdownBars({ items }: ScoreBreakdownBarsProps) {
  return (
    <div className="flex flex-col gap-2.5">
      {items.map((item) => (
        <div key={item.name} className="flex items-center gap-2.5">
          <span className="w-[130px] text-[11px] font-medium text-white/55 shrink-0">
            {item.name}
          </span>
          <div className="flex-1 h-[7px] bg-white/5 rounded overflow-hidden">
            <div
              className="h-full rounded bg-gradient-to-r from-[#9945FF] to-[#14F195] transition-all duration-600 ease-out"
              style={{ width: `${(item.score / item.maxScore) * 100}%` }}
            />
          </div>
          <span className="w-7 text-right text-xs font-bold text-white/90">
            {item.score}
          </span>
        </div>
      ))}
    </div>
  );
}
