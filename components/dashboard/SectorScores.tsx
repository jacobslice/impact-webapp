import type { SectorScore } from "@/lib/types";

interface SectorScoresProps {
  sectors: SectorScore[];
  blurred?: boolean;
}

export function SectorScores({ sectors, blurred = false }: SectorScoresProps) {
  return (
    <div className={blurred ? "blur-[6px] select-none pointer-events-none" : ""}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {sectors.map((sector) => (
          <div
            key={sector.name}
            className="bg-white/[0.03] border border-white/[0.05] rounded-lg p-3 hover:-translate-y-px transition-transform"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                {sector.name}
              </span>
              <span className="text-xs font-bold text-white/80">
                {sector.score}
              </span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${sector.color} transition-all duration-600 ease-out`}
                style={{ width: `${sector.score}%` }}
              />
            </div>
            {sector.protocols.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {sector.protocols.map((p) => (
                  <span
                    key={p}
                    className="text-[9px] text-white/30 bg-white/[0.04] rounded px-1.5 py-0.5"
                  >
                    {p}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-[9px] text-white/20 italic">No activity</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
